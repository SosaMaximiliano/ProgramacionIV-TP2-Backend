import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateComentarioDto } from './dto/create-comentario.dto.js';
import { UpdateComentarioDto } from './dto/update-comentario.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { Comentario } from './entities/comentario.entity.js';
import { Publicacion } from '../publicacion/entities/publicacion.entity.js';
import { Model, Types } from 'mongoose';

@Injectable()
export class ComentarioService {
  constructor(
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<Comentario>,
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
  ) {}
  //

  async crear(idPost: string, dto: CreateComentarioDto, idUsuario: string) {
    const publicacion = await this.publicacionModel.findById(idPost);
    if (!publicacion || !publicacion.estaActivo) {
      throw new NotFoundException('No se encontró la publicación.');
    }
    const comentario = await this.comentarioModel.create({
      comentario: dto.comentario,
      publicacion: publicacion._id,
      usuario: idUsuario,
    });
    return comentario.populate('usuario', 'usuario imagenPerfil');
  }

  async obtenerPorPublicacion(idPost: string, offset: number, limit: number) {
    const publicacion = await this.publicacionModel.findById(idPost);

    if (!publicacion || !publicacion.estaActivo) {
      throw new NotFoundException('La publicación no existe.');
    }

    const offsetSeguro = Number.isFinite(offset)
      ? Math.max(0, Math.floor(offset))
      : 0;
    const limitSeguro = Number.isFinite(limit)
      ? Math.min(Math.max(Math.floor(limit), 1), 50)
      : 10;

    return this.comentarioModel
      .find({ publicacion: new Types.ObjectId(idPost) })
      .populate('usuario', 'usuario imagenPerfil')
      .sort({ fecha: -1 })
      .skip(offsetSeguro)
      .limit(limitSeguro)
      .exec();
  }

  async actualizar(
    idPost: string,
    idComentario: string,
    dto: UpdateComentarioDto,
    idUsuario: string,
  ) {
    if (!dto.comentario?.trim()) {
      throw new BadRequestException('El comentario no puede quedar vacío.');
    }

    //Busco la publicación
    const publicacion = await this.publicacionModel.findOne({
      _id: idPost,
      estaActivo: true,
    });

    if (!publicacion) {
      throw new NotFoundException('No se encontró la publicación.');
    }

    //Busco el comentario
    const comentario = await this.comentarioModel.findOne({
      _id: idComentario,
      publicacion: publicacion._id,
    });

    if (!comentario) {
      throw new NotFoundException('No se encontró el comentario.');
    }

    //Valido que el comentario corresponda al usuario recibido
    if (comentario.usuario.toString() !== idUsuario) {
      throw new ForbiddenException(
        'Sólo quien escribió el comentario puede editarlo.',
      );
    }

    comentario.comentario = dto.comentario.trim();
    comentario.modificado = true;

    await comentario.save();
    return comentario.populate('usuario', 'usuario imagenPerfil');
  }
}
