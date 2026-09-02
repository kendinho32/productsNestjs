import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetHeadersDecorator = createParamDecorator(
  (_data, context: ExecutionContext) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
    return request.rawHeaders;
  },
);
