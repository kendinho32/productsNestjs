import { Injectable, NotFoundException } from '@nestjs/common';
import { join } from 'path';
import { promises as fs } from 'node:fs';

@Injectable()
export class FilesService {
  async getStaticProductImage(name: string): Promise<string> {
    const path = join(__dirname, '../../static/products', name);

    try {
      await fs.access(path);
    } catch {
      throw new NotFoundException(`File ${name} not found`);
    }
    return path;
  }
}
