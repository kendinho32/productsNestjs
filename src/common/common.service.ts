import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

@Injectable()
export class CommonService {
  private readonly logger = new Logger(CommonService.name);

  private readonly ERROR_23505 = '23505';

  /**
   * Method for check Exception globals
   * @param err specification the error received
   */
  handlerException(err: { code: string; detail: any }): never {
    if (err.code === this.ERROR_23505) {
      throw new BadRequestException(err.detail);
    }

    this.logger.error(err);

    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
