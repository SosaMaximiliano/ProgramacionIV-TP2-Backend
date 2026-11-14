import { CreatePublicacionDto } from './dto/create-publicacion.dto.js';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto.js';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Publicacion } from './entities/publicacion.entity.js';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class PublicacionService {
  //Inyecto el Model que permite al back comunicarse con Mongo
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
  ) {}

  async create(createPublicacionDto: CreatePublicacionDto, idUsuario: string) {
    try {
      return await this.publicacionModel.create({
        ...createPublicacionDto,
        usuario: idUsuario,
      });
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

  async remove(idPost: string, idUsuario: string, perfil: string) {
    const publicacion = await this.publicacionModel.findById(idPost);

    if (!publicacion || !publicacion.estaActivo) {
      throw new NotFoundException('No se encontró la publicación.');
    }

    const esAutor = publicacion.usuario.toString() === idUsuario;
    const esAdministrador = perfil === 'administrador';

    if (!esAutor && !esAdministrador) {
      throw new ForbiddenException(
        'Sólo el autor o un administrador puede eliminar esta publicación.',
      );
    }

    publicacion.estaActivo = false;
    return await publicacion.save();
  }

  ////////////////////////////////////////////////////////////////////////////////////////////

  async agregarLike(idPost: string, idUsuario: string) {
    const publicacion = await this.publicacionModel
      .findByIdAndUpdate(
        idPost,
        { $addToSet: { likes: idUsuario } },
        { new: true },
      )
      .populate('usuario', 'nombre apellido usuario imagenPerfil');

    if (!publicacion) {
      throw new NotFoundException('No se encontró la publicación.');
    }

    return publicacion;
  }

  async quitarLike(idPost: string, idUsuario: string) {
    const publicacion = await this.publicacionModel
      .findByIdAndUpdate(idPost, { $pull: { likes: idUsuario } }, { new: true })
      .populate('usuario', 'nombre apellido usuario imagenPerfil');

    if (!publicacion) {
      throw new NotFoundException('No se encontró la publicación.');
    }

    return publicacion;
  }

  async traerUltimasPorUsuario(idUsuario: string) {
    return await this.publicacionModel
      .find({ usuario: idUsuario, estaActivo: true })
      .sort({ fecha: -1 })
      .limit(3)
      .populate('usuario', 'nombre apellido usuario imagenPerfil');
  }
}
