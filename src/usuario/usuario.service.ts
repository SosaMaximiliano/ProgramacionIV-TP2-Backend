import {
  ConflictException,
  Injectable,
  UnauthorizedException,
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
  async create(createUsuarioDto: CreateUsuarioDto, nombreArchivo?: string) {
    try {
      const passwordHasheado = await bcrypt.hash(createUsuarioDto.password, 10);
      const usuarioCreado = await this.usuarioModel.create({
        ...createUsuarioDto, //Operador Spread
        password: passwordHasheado,
        imagenPerfil: nombreArchivo,
      });
      return usuarioCreado;
    } catch (error) {
      throw new ConflictException('El usuario ya se encuentra registrado.');
    }
  }

  async findAll() {
    return await this.usuarioModel.find();
  }

  async findOne(id: string) {
    return await this.usuarioModel.findById(id);
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    return await this.usuarioModel.findByIdAndUpdate(id, updateUsuarioDto, {
      upsert: true,
    });
  }

  async remove(id: string) {
    return await this.usuarioModel.findByIdAndDelete(id);
  }

  // LOGIN
  async login(usuario: string, password: string) {
    const usuarioEncontrado = await this.usuarioModel.findOne({
      usuario,
    });
    if (
      !usuarioEncontrado ||
      !(await bcrypt.compare(password, usuarioEncontrado.password))
    )
      throw new UnauthorizedException('Usuario no autorizado.');
    else {
      return {
        _id: usuarioEncontrado._id,
        nombre: usuarioEncontrado.nombre,
        apellido: usuarioEncontrado.apellido,
        fechaNacimiento: usuarioEncontrado.fechaNacimiento,
        correo: usuarioEncontrado.correo,
        usuario: usuarioEncontrado.usuario,
        descripcion: usuarioEncontrado.descripcion,
        perfil: usuarioEncontrado.perfil,
        imagenPerfil: usuarioEncontrado.imagenPerfil,
      };
    }
  }
}
