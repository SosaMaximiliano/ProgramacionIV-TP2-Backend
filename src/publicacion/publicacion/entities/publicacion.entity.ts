import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class Publicacion {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario: Types.ObjectId;

  @Prop()
  imagenPublicacion?: string;

  @Prop({ default: Date.now })
  fecha: Date;

  @Prop({ type: [String], default: [] })
  likes: string[];

  @Prop({ default: true })
  estaActivo: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
