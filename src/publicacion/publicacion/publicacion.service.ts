import { Injectable } from '@nestjs/common';
import { CreatePublicacionDto } from './dto/create-publicacion.dto.js';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto.js';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Publicacion } from './entities/publicacion.entity.js';

@Injectable()
export class PublicacionService {
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

  async findAll() {
    return await this.publicacionModel.find();
  }

  async findOne(id: number) {
    return await this.publicacionModel.findById(id);
  }

  async update(id: number, updatePublicacionDto: UpdatePublicacionDto) {
    return await this.publicacionModel.findByIdAndUpdate(
      id,
      updatePublicacionDto,
      {
        upsert: true,
      },
    );
  }

  async remove(id: number) {
    return await this.publicacionModel.findByIdAndDelete(id);
  }
}
