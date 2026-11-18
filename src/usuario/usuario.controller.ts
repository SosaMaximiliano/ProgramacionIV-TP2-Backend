import {
  Controller,
  Post,
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
import { CreateUsuarioAdminDto } from './dto/create-usuario.dto.js';
import { AuthService } from '../auth/auth.service.js';
import { AdminGuard } from '../auth/admin.guard/admin.guard.js';

type RequestConUsuario = Request & {
  user: { id: string; perfil: string };
};

@Controller('usuario')
export class UsuarioController {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly fileService: FileService,
  ) {}

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('imagenPerfil', { storage: memoryStorage() }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdatePerfilDto,
    @Req() request: RequestConUsuario,
    @UploadedFile() archivo?: Express.Multer.File,
  ) {
    if (request.user.id !== id) {
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

  //******************* ADMIN ******************************/

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      storage: memoryStorage(),
    }),
  )
  async registrar(
    @Body() createUsuarioDto: CreateUsuarioAdminDto,
    @UploadedFile() archivo?: Express.Multer.File,
  ) {
    if (archivo) {
      createUsuarioDto.imagenPerfil = await this.fileService.cloudinaryUploader(
        archivo,
        'usuarios',
      );
    }

    const usuarioCreado = await this.usuarioService.create(createUsuarioDto);

    return {
      _id: usuarioCreado._id,
      nombre: usuarioCreado.nombre,
      apellido: usuarioCreado.apellido,
      fechaNacimiento: usuarioCreado.fechaNacimiento,
      correo: usuarioCreado.correo,
      usuario: usuarioCreado.usuario,
      descripcion: usuarioCreado.descripcion,
      perfil: usuarioCreado.perfil,
      imagenPerfil: usuarioCreado.imagenPerfil,
      estaHabilitado: usuarioCreado.estaHabilitado,
    };
  }

  @Post(':id')
  //Primero valida el token y después el perfil. Importa el orden de los guard.
  @UseGuards(JwtAuthGuard, AdminGuard)
  habilitar(@Param('id') id: string) {
    return this.usuarioService.habilitar(id);
  }

  @Delete(':id')
  //Primero valida el token y después el perfil. Importa el orden de los guard.
  @UseGuards(JwtAuthGuard, AdminGuard)
  deshabilitar(@Param('id') id: string) {
    return this.usuarioService.deshabilitar(id);
  }
}
