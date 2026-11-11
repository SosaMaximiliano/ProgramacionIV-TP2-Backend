import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePublicacionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  titulo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  descripcion: string;

  @IsMongoId()
  usuario: string;
}
