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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException, Query } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';

@Controller('publicaciones')
export class PublicacionController {
  constructor(private readonly publicacionService: PublicacionService) {}

  @Post('nueva')
  @UseInterceptors(
    FileInterceptor('imagenPublicacion', {
      storage: diskStorage({
        destination: './uploads/posts',
        filename: (_request, file, callback) => {
          const nombreArchivo = `${Date.now()}${extname(file.originalname)}`;
          callback(null, nombreArchivo);
        },
      }),
    }),
  )
  create(
    @Body() createPublicacionDto: CreatePublicacionDto,
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
    return this.publicacionService.create(
      createPublicacionDto,
      archivo?.filename,
    );
  }

  // @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('orden') orden = 'fecha',
    @Query('offset') offset = '0',
    @Query('limit') limit = '10',
  ) {
    return this.publicacionService.findAll(orden, +offset, +limit);
  }

  // @Get('usuario/:userId')
  // findAllByUser(@Param('userId') userId: string) {
  //   return this.publicacionService.findAllByUser(userId);
  // }

  // @UseGuards(JwtAuthGuard)
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
