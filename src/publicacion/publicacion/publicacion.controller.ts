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

@Controller('publicaciones')
export class PublicacionController {
  constructor(
    private readonly publicacionService: PublicacionService,
    private fileService: FileService,
  ) {}

  @Post('nueva')
  @UseInterceptors(
    FileInterceptor('imagenPublicacion', {
      storage: memoryStorage(),
    }),
  )
  async create(
    @Body() createPublicacionDto: CreatePublicacionDto,
    @UploadedFile()
    archivo: Express.Multer.File,
  ) {
    if (archivo) {
      createPublicacionDto.imagenPublicacion =
        await this.fileService.cloudinaryUploader(archivo);
    }

    return this.publicacionService.create(
      createPublicacionDto,
      archivo?.filename,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('orden') orden = 'fecha',
    @Query('offset') offset = '0',
    @Query('limit') limit = '10',
  ) {
    return this.publicacionService.findAll(orden, +offset, +limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
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
  remove(@Param('id') id: string) {
    return this.publicacionService.remove(id);
  }
}
