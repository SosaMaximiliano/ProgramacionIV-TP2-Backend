import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Publicacion } from './entities/publicacion.entity.js';
import { PublicacionService } from './publicacion.service.js';
import { PublicacionController } from './publicacion.controller.js';
import { PublicacionSchema } from './entities/publicacion.entity.js';
import { AuthModule } from '../../auth/auth.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
    ]),
    AuthModule,
  ],
  controllers: [PublicacionController],
  providers: [PublicacionService],
})
export class PublicacionModule {}
