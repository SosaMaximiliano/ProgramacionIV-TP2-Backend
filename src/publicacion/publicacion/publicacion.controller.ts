import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { PublicacionService } from './publicacion.service.js';
import { CreatePublicacionDto } from './dto/create-publicacion.dto.js';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage, diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException, Query } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { FileService } from '../../file/file.service.js';
import { Req } from '@nestjs/common';
import { Request } from 'express';
import { request } from 'http';

type RequestConUsuario = Request & {
  user: { sub: string; perfil: string };
};

@Controller('publicaciones')
export class PublicacionController {
  constructor(
    private readonly publicacionService: PublicacionService,
    private fileService: FileService,
  ) {}

  @Post('nueva')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('imagenPublicacion', {
      storage: memoryStorage(),
    }),
  )
  async create(
    @Body() createPublicacionDto: CreatePublicacionDto,
    @UploadedFile()
    archivo: Express.Multer.File | undefined,
    @Req() request: RequestConUsuario,
  ) {
    if (archivo) {
      createPublicacionDto.imagenPublicacion =
        await this.fileService.cloudinaryUploader(archivo, 'publicaciones');
    }

    return this.publicacionService.create(
      createPublicacionDto,
      request.user.sub,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('orden') orden = 'fecha',
    @Query('offset') offset = '0',
    @Query('limit') limit = '10',
  ) {
    return this.publicacionService.findAll(orden, +offset, +limit);
  }

  @Get('usuario/:id/ultimas')
  @UseGuards(JwtAuthGuard)
  traerUltimasPorUsuario(@Param('id') idUsuario: string) {
    return this.publicacionService.traerUltimasPorUsuario(idUsuario);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.publicacionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePublicacionDto: UpdatePublicacionDto,
  ) {
    return this.publicacionService.update(id, updatePublicacionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() request: RequestConUsuario) {
    return this.publicacionService.remove(
      id,
      request.user.sub,
      request.user.perfil,
    );
  }

  //LIKES

  @Post(':id/likes')
  @UseGuards(JwtAuthGuard)
  agregarLike(@Param('id') idPost: string, @Req() request: RequestConUsuario) {
    return this.publicacionService.agregarLike(idPost, request.user.sub);
  }

  @Delete(':id/likes')
  @UseGuards(JwtAuthGuard)
  quitarLike(@Param('id') idPost: string, @Req() request: RequestConUsuario) {
    return this.publicacionService.quitarLike(idPost, request.user.sub);
  }
}
