import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Request } from 'express';
import { UsuarioService } from './usuario.service.js';
import { UpdatePerfilDto } from './dto/update-perfil.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { FileService } from '../file/file.service.js';

type RequestConUsuario = Request & {
  user: { sub: string; perfil: string };
};

@Controller('usuario')
export class UsuarioController {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly fileService: FileService,
  ) {}

  @Get()
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('imagenPerfil', { storage: memoryStorage() }))
  async update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdatePerfilDto,
    @Req() request: RequestConUsuario,
    @UploadedFile() archivo?: Express.Multer.File,
  ) {
    if (request.user.sub !== id) {
      throw new ForbiddenException('Sólo podés editar tu propio perfil.');
    }

    if (archivo) {
      updateUsuarioDto.imagenPerfil = await this.fileService.cloudinaryUploader(
        archivo,
        'usuarios',
      );
    }

    // Sólo estos campos se pueden modificar desde el formulario de perfil.
    const datosDePerfil: UpdatePerfilDto = {
      nombre: updateUsuarioDto.nombre,
      apellido: updateUsuarioDto.apellido,
      fechaNacimiento: updateUsuarioDto.fechaNacimiento,
      correo: updateUsuarioDto.correo,
      usuario: updateUsuarioDto.usuario,
      descripcion: updateUsuarioDto.descripcion,
      imagenPerfil: updateUsuarioDto.imagenPerfil,
    };

    return this.usuarioService.update(id, datosDePerfil);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(id);
  }
}
