import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario } from './entities/usuario.entity.js';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
  ) {}

  // REGISTRO
  async create(createUsuarioDto: CreateUsuarioDto) {
    try {
      const passwordHasheado = await bcrypt.hash(createUsuarioDto.password, 10);
      const usuarioCreado = await this.usuarioModel.create({
        ...createUsuarioDto,
        password: passwordHasheado,
      });

      return usuarioCreado;
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new ConflictException(
          'El correo o nombre de usuario ya está registrado.',
        );
      }

      throw error;
    }
  }

  async findAll() {
    return await this.usuarioModel.find().select('-password');
  }

  async findOne(id: string) {
    return await this.usuarioModel.findById(id).select('-password');
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    return await this.usuarioModel.findByIdAndUpdate(id, updateUsuarioDto, {
      upsert: true,
    });
  }

  async remove(id: string) {
    return await this.usuarioModel.findByIdAndDelete(id);
  }
}
