import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthService } from './auth.service.js';
import { FileService } from '../file/file.service.js';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto.js';
import { LoginUsuarioDto } from '../usuario/dto/login-usuario.dto.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly fileService: FileService,
  ) {}

  @Post('registro')
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      storage: memoryStorage(),
    }),
  )
  async registrar(
    @Body() createUsuarioDto: CreateUsuarioDto,
    @UploadedFile() archivo?: Express.Multer.File,
  ) {
    if (archivo) {
      createUsuarioDto.imagenPerfil = await this.fileService.cloudinaryUploader(
        archivo,
        'usuarios',
      );
    }

    return this.authService.registrar(createUsuarioDto);
  }

  @Post('login')
  login(@Body() loginUsuarioDto: LoginUsuarioDto) {
    return this.authService.login(
      loginUsuarioDto.identificador,
      loginUsuarioDto.password,
    );
  }
}
