import {
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import * as express from 'express';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/file-namer.helper';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('product/:name')
  async findProductImage(
    @Res() res: express.Response,
    @Param('name') name: string,
  ) {
    const path: any = await this.filesService.getStaticProductImage(name);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  uploadProductImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024, // 10 MB
            errorMessage: 'El archivo no puede superar los 10 MB',
          }),
          new FileTypeValidator({
            fileType: 'image/(jpeg|jpg|png|gif)',
            skipMagicNumbersValidation: true,
            errorMessage:
              'Archivo no valido, el archivo debe ser: jpeg, jpg, png o gif',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const secureUrl = `${this.configService.get('HOST_API')}/static/products/${file.filename}`;

    return {
      secureUrl: secureUrl,
      mimetype: file.mimetype,
      size: file.size,
    };
  }
}
