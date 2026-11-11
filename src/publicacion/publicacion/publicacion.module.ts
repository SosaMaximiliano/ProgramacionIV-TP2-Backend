import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Publicacion } from './entities/publicacion.entity.js';
import { PublicacionService } from './publicacion.service.js';
import { PublicacionController } from './publicacion.controller.js';
import { PublicacionSchema } from './entities/publicacion.entity.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
    ]),
  ],
  controllers: [PublicacionController],
  providers: [PublicacionService],
})
export class PublicacionModule {}
