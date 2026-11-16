import { PartialType } from '@nestjs/mapped-types';
import { CreateComentarioDto } from './create-comentario.dto.js';

export class UpdateComentarioDto extends PartialType(CreateComentarioDto) {}
