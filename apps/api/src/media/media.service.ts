import { Injectable } from '@nestjs/common';
import { extname } from 'path';

@Injectable()
export class MediaService {
  generateFileName(file: Express.Multer.File): string {
    const name = file.originalname.split('.')[0].replace(/\s/g, '');
    const fileExtName = extname(file.originalname);
    const randomName = Array(4)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    return `${name}-${randomName}${fileExtName}`;
  }

  getPublicUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}
