import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsuarioModule } from '../usuario/usuario.module.js';
import { FileService } from '../file/file.service.js';

@Module({
  imports: [
    UsuarioModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60s' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, FileService],
  exports: [JwtModule, JwtAuthGuard],
})
export class AuthModule {}
