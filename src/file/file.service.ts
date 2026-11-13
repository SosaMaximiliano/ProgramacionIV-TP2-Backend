import { Injectable } from '@nestjs/common';
import { parse } from 'node:path';
import { v2 as cloudinary } from 'cloudinary';
import { error } from 'node:console';

cloudinary.config({
  cloud_name: 'juvuvlpg',
  api_key: '752228819842768',
  api_secret: 'aesMiLQmjmeuyjRwuTsnzzj9I_E',
});

@Injectable()
export class FileService {
  cloudinaryUploader(archivo: Express.Multer.File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'usuarios',
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
        reject(new Error('No se pudo enviar la foto al servidor.'));
      });
      stream.end(archivo.buffer);
    });
  }
}
