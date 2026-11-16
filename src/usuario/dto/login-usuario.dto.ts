import { IsString } from 'class-validator';

export class LoginUsuarioDto {
  @IsString()
  identificador: string;

  @IsString()
  password: string;
}
