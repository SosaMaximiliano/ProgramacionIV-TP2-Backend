import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario } from './entities/usuario.entity.js';
import { UsuarioService } from './usuario.service.js';
import { UsuarioController } from './usuario.controller.js';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { FileService } from '../file/file.service.js';
import { UsuarioSchema } from './entities/usuario.entity.js';
import { AdminGuard } from '../auth/admin.guard/admin.guard.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService, JwtAuthGuard, FileService, AdminGuard],
  exports: [UsuarioService, MongooseModule],
})
export class UsuarioModule {}
