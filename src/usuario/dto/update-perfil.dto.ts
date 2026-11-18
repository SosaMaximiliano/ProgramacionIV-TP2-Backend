import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreateUsuarioDto } from './create-usuario.dto.js';

export class UpdatePerfilDto extends PartialType(
  PickType(CreateUsuarioDto, [
    'nombre',
    'apellido',
    'fechaNacimiento',
    'correo',
    'usuario',
    'descripcion',
  ] as const),
) {
  @IsOptional()
  @IsString()
  imagenPerfil?: string;
}
