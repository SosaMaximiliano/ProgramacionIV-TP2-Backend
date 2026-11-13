import { Injectable } from '@nestjs/common';
import { CreatePublicacionDto } from './dto/create-publicacion.dto.js';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto.js';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Publicacion } from './entities/publicacion.entity.js';

@Injectable()
export class PublicacionService {
  //Inyecto el Model que permite al back comunicarse con Mongo
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
  ) {}

  async create(
    createPublicacionDto: CreatePublicacionDto,
    nombreArchivo?: string,
  ) {
    try {
      const publicacionCreada = await this.publicacionModel.create({
        ...createPublicacionDto,
        imagenPublicacion: nombreArchivo,
      });
      return publicacionCreada;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(orden: string, offset: number, limit: number) {
    const offsetSeguro = Number.isFinite(offset)
      ? Math.max(0, Math.floor(offset))
      : 0;

    const limitSeguro = Number.isFinite(limit)
      ? Math.min(Math.max(Math.floor(limit), 1), 50)
      : 10;

    const publicaciones = await this.publicacionModel.aggregate([
      {
        $match: { estaActivo: true },
      },
      {
        $addFields: {
          cantidadLikes: { $size: { $ifNull: ['$likes', []] } },
        },
      },
      {
        $sort:
          orden === 'likes' ? { cantidadLikes: -1, fecha: -1 } : { fecha: -1 },
      },
      { $skip: offsetSeguro },
      { $limit: limitSeguro },
      {
        $project: { cantidadLikes: 0 },
      },
    ]);

    return this.publicacionModel.populate(publicaciones, {
      path: 'usuario',
      select: 'nombre apellido usuario imagenPerfil',
    });
  }

  // async findAllByUser(userId: string) {
  //   return await this.publicacionModel
  //     .find({ usuario: userId, estaActivo: true })
  //     .populate('usuario', 'nombre apellido usuario imagenPerfil')
  //     .sort({ fecha: -1 });
  // }

  async findOne(id: string) {
    return this.publicacionModel
      .findById(id)
      .populate('usuario', 'nombre apellido usuario imagenPerfil');
  }

  async update(id: string, updatePublicacionDto: UpdatePublicacionDto) {
    return await this.publicacionModel.findByIdAndUpdate(
      id,
      updatePublicacionDto,
      {
        upsert: true,
      },
    );
  }

  async remove(id: string) {
    return await this.publicacionModel.findByIdAndDelete(id);
  }
}
