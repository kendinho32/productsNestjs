import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Product } from '../products/entities';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    let result: boolean = await this.removeAllProducts();

    if (result) {
      result = await this.deleteUsers();
      if (result) {
        const adminUser = await this.insertUsers();
        await this.insertSeed(adminUser);
      }
    }

    return `Seed executed successfully.`;
  }

  private async deleteUsers() {
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
    return true;
  }

  private async removeAllProducts() {
    await this.productsService.removeAll();
    return true;
  }

  private async insertSeed(user: User) {
    const products = initialData.products;
    const promises: Promise<Product>[] = [];

    products.forEach((product) =>
      promises.push(this.productsService.create(product, user)),
    );

    await Promise.all(promises).catch((error) => {
      console.error(error);
      throw new InternalServerErrorException('Error while creating seed data');
    });
  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];

    seedUsers.forEach((user) => {
      users.push(this.userRepository.create(user));
    });

    const dbUsers = await this.userRepository.save(users);
    return dbUsers[0];
  }
}
