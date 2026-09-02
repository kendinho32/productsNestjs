import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const GetUserDecorator = createParamDecorator(
  (data, context: ExecutionContext) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const user = request.user;

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  },
);
