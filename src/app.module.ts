import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuarioModule } from './usuario/usuario.module.js';
import { PublicacionModule } from './publicacion/publicacion/publicacion.module.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI!),
    UsuarioModule,
    PublicacionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
