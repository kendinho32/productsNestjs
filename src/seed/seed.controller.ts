import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  @ApiOperation({ summary: 'Execute database seed to populate initial data' })
  @ApiResponse({ status: 200, description: 'Seed executed successfully.' })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during seeding.',
  })
  executeSeed() {
    return this.seedService.runSeed();
  }
}
