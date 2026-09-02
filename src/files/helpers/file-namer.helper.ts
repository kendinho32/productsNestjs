import { v7 as uuid } from 'uuid';

export const fileNamer = (
  _req: Express.Request,
  file: Express.Multer.File,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  callback: Function,
) => {
  if (!file) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
    return callback(new Error('No file found'), false);
  }

  const fileExtension = file.mimetype.split('/')[1];
  const fileName = `${uuid()}.${fileExtension}`;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  callback(null, fileName);
};
