import {
  IsAlpha,
  IsByteLength,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsNotEmpty()
  @IsString()
  @IsByteLength(2, 40)
  // Usa Matches porque IsAlpha no permite espacios
  @Matches(/^[\p{L}]+(?:[ '-][\p{L}]+)*$/u)
  nombre: string;

  @IsNotEmpty()
  @IsString()
  @IsByteLength(2, 40)
  // Usa Matches porque IsAlpha no permite espacios
  @Matches(/^[\p{L}]+(?:[ '-][\p{L}]+)*$/u)
  apellido: string;

  @IsNotEmpty()
  @IsString()
  fechaNacimiento: string;

  @IsNotEmpty()
  @IsString()
  correo: string;

  @IsNotEmpty()
  @IsString()
  @IsByteLength(3, 12)
  usuario: string;

  @IsNotEmpty()
  @IsString()
  @IsByteLength(8, 16)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/, {
    message:
      'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.',
  })
  password: string;

  @IsByteLength(0, 100)
  descripcion: string;
}
