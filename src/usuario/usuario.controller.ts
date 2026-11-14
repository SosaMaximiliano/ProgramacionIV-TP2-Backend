import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { LoginUsuarioDto } from './dto/login-usuario.dto.js';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FileService } from '../file/file.service.js';

@Controller('usuario')
export class UsuarioController {
  constructor(
    private readonly usuarioService: UsuarioService,
    private fileService: FileService,
  ) {}

  // **************** REGISTRO ******************
  @Post('registro')
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      storage: memoryStorage(),
    }),
  )
  async create(
    @Body() createUsuarioDto: CreateUsuarioDto,
    @UploadedFile()
    archivo?: Express.Multer.File,
  ) {
    if (archivo) {
      createUsuarioDto.imagenPerfil = await this.fileService.cloudinaryUploader(
        archivo,
        'usuarios',
      );
    }
    return this.usuarioService.create(createUsuarioDto);
  }

  // **************** LOGIN ******************

  @Post('login')
  login(@Body() loginUsuarioDto: LoginUsuarioDto) {
    return this.usuarioService.login(
      loginUsuarioDto.usuario,
      loginUsuarioDto.password,
    );
  }

  @Get()
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(id);
  }
}
