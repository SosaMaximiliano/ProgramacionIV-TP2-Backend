import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service.js';
import { CreateEstadisticaDto } from './dto/create-estadistica.dto.js';
import { UpdateEstadisticaDto } from './dto/update-estadistica.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AdminGuard } from '../auth/admin.guard/admin.guard.js';

@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() createEstadisticaDto: CreateEstadisticaDto) {
    return this.estadisticasService.create(createEstadisticaDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll() {
    return this.estadisticasService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findOne(@Param('id') id: string) {
    return this.estadisticasService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(
    @Param('id') id: string,
    @Body() updateEstadisticaDto: UpdateEstadisticaDto,
  ) {
    return this.estadisticasService.update(+id, updateEstadisticaDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.estadisticasService.remove(+id);
  }
}
