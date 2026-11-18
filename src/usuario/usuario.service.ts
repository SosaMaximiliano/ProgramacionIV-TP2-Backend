import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdatePerfilDto } from './dto/update-perfil.dto.js';
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
      const [correoOcupado, usuarioOcupado] = await Promise.all([
        this.usuarioModel.exists({ correo: createUsuarioDto.correo }),
        this.usuarioModel.exists({ usuario: createUsuarioDto.usuario }),
      ]);

      if (correoOcupado && usuarioOcupado) {
        throw new ConflictException(
          'El correo y el nombre de usuario ya están registrados.',
        );
      }
      if (correoOcupado) {
        throw new ConflictException('Ese correo ya está registrado.');
      }
      if (usuarioOcupado) {
        throw new ConflictException(
          'Ese nombre de usuario ya está registrado.',
        );
      }

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

  async update(id: string, updateUsuarioDto: UpdatePerfilDto) {
    try {
      const usuarioActualizado = await this.usuarioModel
        .findByIdAndUpdate(id, updateUsuarioDto, {
          new: true,
          runValidators: true,
        })
        .select('-password');

      if (!usuarioActualizado) {
        throw new NotFoundException('No se encontró el usuario.');
      }

      return usuarioActualizado;
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

  async remove(id: string) {
    return await this.usuarioModel.findByIdAndDelete(id);
  }

  async deshabilitar(id: string) {
    const usuario = await this.findOne(id);
    if (!usuario) {
      throw new NotFoundException('El usuario no existe.');
    }
    return await this.usuarioModel.findByIdAndUpdate(id, {
      estaHabilitado: false,
    });
  }

  async habilitar(id: string) {
    const usuario = await this.findOne(id);
    if (!usuario) {
      throw new NotFoundException('El usuario no existe.');
    }
    return await this.usuarioModel.findByIdAndUpdate(id, {
      estaHabilitado: true,
    });
  }
}
