import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comentario } from '../comentario/entities/comentario.entity.js';
import { Publicacion } from '../publicacion/entities/publicacion.entity.js';
import { Usuario } from '../usuario/entities/usuario.entity.js';

type DatoEstadistica = { etiqueta: string; cantidad: number };

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<Comentario>,
    @InjectModel(Usuario.name)
    private readonly usuarioModel: Model<Usuario>,
  ) {}

  async publicacionesPorUsuario(desde: string, hasta: string): Promise<DatoEstadistica[]> {
    const rango = this.crearRango(desde, hasta);

    return this.publicacionModel.aggregate<DatoEstadistica>([
      { $match: { estaActivo: true, fecha: { $gte: rango.inicio, $lte: rango.fin } } },
      { $group: { _id: '$usuario', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: this.usuarioModel.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'autor',
        },
      },
      { $unwind: '$autor' },
      { $project: { _id: 0, etiqueta: '$autor.usuario', cantidad: 1 } },
      { $sort: { cantidad: -1 } },
    ]);
  }

  async comentariosPorDia(desde: string, hasta: string): Promise<DatoEstadistica[]> {
    const rango = this.crearRango(desde, hasta);

    return this.comentarioModel.aggregate<DatoEstadistica>([
      { $match: { fecha: { $gte: rango.inicio, $lte: rango.fin } } },
      ...this.soloComentariosDePublicacionesActivas(),
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$fecha' } },
          cantidad: { $sum: 1 },
        },
      },
      { $project: { _id: 0, etiqueta: '$_id', cantidad: 1 } },
      { $sort: { etiqueta: 1 } },
    ]);
  }

  async comentariosPorPublicacion(desde: string, hasta: string): Promise<DatoEstadistica[]> {
    const rango = this.crearRango(desde, hasta);

    return this.comentarioModel.aggregate<DatoEstadistica>([
      { $match: { fecha: { $gte: rango.inicio, $lte: rango.fin } } },
      ...this.soloComentariosDePublicacionesActivas(),
      {
        $group: {
          _id: '$publicacion',
          etiqueta: { $first: '$post.titulo' },
          cantidad: { $sum: 1 },
        },
      },
      { $project: { _id: 0, etiqueta: 1, cantidad: 1 } },
      { $sort: { cantidad: -1 } },
    ]);
  }

  private crearRango(desde: string, hasta: string) {
    const inicio = new Date(`${desde}T00:00:00.000Z`);
    const fin = new Date(`${hasta}T23:59:59.999Z`);

    if (
      !desde ||
      !hasta ||
      Number.isNaN(inicio.getTime()) ||
      Number.isNaN(fin.getTime()) ||
      inicio > fin
    ) {
      throw new BadRequestException('Indicá un rango de fechas válido.');
    }

    return { inicio, fin };
  }

  private soloComentariosDePublicacionesActivas() {
    return [
      {
        $lookup: {
          from: this.publicacionModel.collection.name,
          localField: 'publicacion',
          foreignField: '_id',
          as: 'post',
        },
      },
      { $unwind: '$post' },
      { $match: { 'post.estaActivo': true } },
    ];
  }
}
