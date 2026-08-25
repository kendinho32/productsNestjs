import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly productsService: ProductsService) {}

  async runSeed() {
    const result: boolean = await this.removeAllProducts();

    if (result) {
      await this.insertSeed();
    }

    return `Seed executed successfully.`;
  }

  private async removeAllProducts() {
    await this.productsService.removeAll();
    return true;
  }

  private async insertSeed() {
    const products = initialData.products;
    const promises = [];

    products.forEach((product) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      promises.push(this.productsService.create(product));
    });

    // eslint-disable-next-line @typescript-eslint/await-thenable
    await Promise.all(promises).catch((error) => {
      console.error(error);
      throw new InternalServerErrorException('Error while creating seed data');
    });
  }
}
