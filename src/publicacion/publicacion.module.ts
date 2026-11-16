import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Publicacion,
  PublicacionSchema,
} from './entities/publicacion.entity.js';
import {
  Comentario,
  ComentarioSchema,
} from '../comentario/entities/comentario.entity.js';
import { PublicacionService } from './publicacion.service.js';
import { PublicacionController } from './publicacion.controller.js';
import { ComentarioService } from '../comentario/comentario.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { FileService } from '../file/file.service.js';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema },
    ]),
    AuthModule,
  ],
  controllers: [PublicacionController],
  providers: [PublicacionService, FileService, ComentarioService],
})
export class PublicacionModule {}
