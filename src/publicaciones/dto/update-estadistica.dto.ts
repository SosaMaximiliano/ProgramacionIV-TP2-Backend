import { PartialType } from '@nestjs/mapped-types';
import { CreateEstadisticaDto } from './create-estadistica.dto.js';

export class UpdateEstadisticaDto extends PartialType(CreateEstadisticaDto) {}
