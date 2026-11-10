import { IsString } from 'class-validator';

export class LoginUsuarioDto {
  @IsString()
  usuario: string;

  @IsString()
  password: string;
}
