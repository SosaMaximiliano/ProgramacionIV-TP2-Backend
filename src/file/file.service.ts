import { Injectable } from '@nestjs/common';
import { parse } from 'node:path';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileService {
  constructor(config: ConfigService) {
    cloudinary.config({
      cloud_name: config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    });
  }

  cloudinaryUploader(
    archivo: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: parse(archivo.originalname).name,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(new Error('No se pudo subir la foto.'));
          } else if (!result?.secure_url) {
            reject(new Error('No se devolvió la URL de la foto.'));
          } else {
            resolve(result.secure_url);
          }
        },
      );
      stream.on('error', (error: Error) => {
        console.log(error);
        reject(new Error('No se pudo enviar la foto al servidor.'));
      });
      stream.end(archivo.buffer);
    });
  }
}
