import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario } from './entities/usuario.entity.js';
import { UsuarioService } from './usuario.service.js';
import { UsuarioController } from './usuario.controller.js';
import { UsuarioSchema } from './entities/usuario.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { FileService } from '../file/file.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
    AuthModule,
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService, FileService],
})
export class UsuarioModule {}
