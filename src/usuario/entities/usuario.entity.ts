import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Usuario {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  apellido: string;

  @Prop({ required: true })
  fechaNacimiento: string;

  @Prop({ required: true, unique: true })
  correo: string;

  @Prop({ required: true, unique: true })
  usuario: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: 'usuario' })
  perfil: string;

  @Prop()
  imagenPerfil?: string;

  @Prop()
  descripcion?: string;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
