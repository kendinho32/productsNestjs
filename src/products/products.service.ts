import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Product, ProductImage } from './entities';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class ProductsService {
  private readonly NAME_SERVICE: string = 'ProductsService';
  private readonly ERROR_23505: string = '23505';
  private readonly log: Logger = new Logger(this.NAME_SERVICE);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { images = [], ...productDetails } = createProductDto;

    const product = this.productRepository.create({
      ...productDetails,
      images: images.map((image) =>
        this.productImageRepository.create({ url: image }),
      ),
    });
    await this.productRepository.save(product).catch((err) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.handlerException(err);
    });

    return product;
  }

  async findAll(paginationDto: PaginationDto): Promise<Product[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    const products: Product[] = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
    });

    if (products.length === 0) {
      throw new NotFoundException('Products not found');
    }

    return products;
  }

  async findOne(term: string): Promise<Product> {
    let product: Product | null;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({
        id: term,
      });
    } else {
      const query: SelectQueryBuilder<Product> =
        this.productRepository.createQueryBuilder('product');
      product = await query
        .where('title =:title or slug =:slug', {
          title: term,
          slug: term,
        })
        .leftJoinAndSelect('product.images', 'prodImages')
        .getOne();
    }

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const { images, ...toUpdate } = updateProductDto;

    let product = await this.productRepository.preload({
      id: id,
      ...toUpdate,
    });

    if (!product) {
      throw new NotFoundException(`Product not found with id: ${id} `);
    }

    // create QueryRunner (transactions)
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      product = await this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.handlerException(error);
    }
    return product;
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async removeAll() {
    try {
      return await this.productRepository.deleteAll();
      /*
      return await this.productRepository
        .createQueryBuilder()
        .delete()
        .from(Product)
        .execute();
       */
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.handlerException(error);
    }
  }

  /**
   * Method for check Exception globals
   * @param err specification the error received
   * @private
   */
  private handlerException(err: { code: string; detail: any }) {
    if (err.code === this.ERROR_23505) {
      throw new BadRequestException(err.detail);
    }

    this.log.error(err);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
