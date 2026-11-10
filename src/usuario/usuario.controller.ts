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
import {
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  // **************** REGISTRO ******************
  @Post('registro')
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_request, file, callback) => {
          const nombreArchivo = `${Date.now()}${extname(file.originalname)}`;
          callback(null, nombreArchivo);
        },
      }),
    }),
  )
  create(
    @Body() createUsuarioDto: CreateUsuarioDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
        fileIsRequired: false,
      }),
    )
    archivo: Express.Multer.File,
  ) {
    if (
      archivo &&
      !['image/jpeg', 'image/png', 'image/webp'].includes(archivo.mimetype)
    ) {
      throw new BadRequestException('La imagen debe ser JPG, PNG o WEBP.');
    }
    return this.usuarioService.create(createUsuarioDto, archivo?.filename);
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
