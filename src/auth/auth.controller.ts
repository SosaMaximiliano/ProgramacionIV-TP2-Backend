import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthService } from './auth.service.js';
import { FileService } from '../file/file.service.js';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto.js';
import { LoginUsuarioDto } from '../usuario/dto/login-usuario.dto.js';
import { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard.js';

//Creo un tipo con la forma Request + usuario.
type RequestConUsuario = Request & {
  user: {
    id: string;
    perfil: string;
  };
};
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

  @Post('autorizar')
  @UseGuards(JwtAuthGuard)
  autorizar(@Req() request: RequestConUsuario) {
    return this.authService.autorizar(request.user.id);
  }

  @Post('refrescar')
  @UseGuards(JwtAuthGuard)
  //Recibo la petición y la guardo en request.
  //@Req
  refrescar(@Req() request: RequestConUsuario) {
    return this.authService.refrescar(request.user);
  }
}
