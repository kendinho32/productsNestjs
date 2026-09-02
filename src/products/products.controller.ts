import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Auth, GetUserDecorator } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (validation error, unique constraint violation)',
  })
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUserDecorator() user: User,
  ): Promise<Product> {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get a list of paginated products' })
  @ApiResponse({
    status: 200,
    description: 'List of products retrieved successfully',
    type: [Product],
  })
  findAll(@Query() paginationDto: PaginationDto): Promise<Product[]> {
    return this.productsService.findAll(paginationDto);
  }

  @Get(':term')
  @ApiOperation({ summary: 'Find a product by UUID v7, slug, or title' })
  @ApiParam({
    name: 'term',
    description: 'Product UUID, slug, or title to search for',
  })
  @ApiResponse({
    status: 200,
    description: 'Product found successfully',
    type: Product,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('term') term: string) {
    return this.productsService.findOne(term);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product by UUID v7' })
  @ApiParam({ name: 'id', description: 'Product UUID v7' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: Product,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUserDecorator() user: User,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product by UUID v7' })
  @ApiParam({ name: 'id', description: 'Product UUID v7' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id', new ParseUUIDPipe({ version: '7' })) id: string) {
    return this.productsService.remove(id);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all products from the database' })
  @ApiResponse({
    status: 200,
    description: 'All products deleted successfully',
  })
  removeAll() {
    return this.productsService.removeAll();
  }
}
