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
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  // REGISTRO
  async create(createUsuarioDto: CreateUsuarioDto) {
    try {
      const passwordHasheado = await bcrypt.hash(createUsuarioDto.password, 10);
      const usuarioCreado = await this.usuarioModel.create({
        ...createUsuarioDto,
        password: passwordHasheado,
      });
      const token = await this.jwtService.signAsync({
        sub: usuarioCreado?._id.toString(),
        perfil: usuarioCreado?.perfil,
      });
      return {
        access_token: token,
        usuario: {
          _id: usuarioCreado._id,
          nombre: usuarioCreado.nombre,
          apellido: usuarioCreado.apellido,
          fechaNacimiento: usuarioCreado.fechaNacimiento,
          correo: usuarioCreado.correo,
          usuario: usuarioCreado.usuario,
          descripcion: usuarioCreado.descripcion,
          perfil: usuarioCreado.perfil,
          imagenPerfil: usuarioCreado.imagenPerfil,
        },
      };
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

  // LOGIN
  async login(identificador: string, password: string) {
    //Model permite conectar con Mongo y hacer la query
    const usuarioEncontrado = await this.usuarioModel
      .findOne({
        $or: [{ usuario: identificador }, { correo: identificador }],
      })
      .select('+password');

    if (
      !usuarioEncontrado ||
      !(await bcrypt.compare(password, usuarioEncontrado.password))
    ) {
      throw new UnauthorizedException('Usuario no autorizado.');
    }

    //Si encuentro al usuario genero el token a partir del id y el perfil
    const token = await this.jwtService.signAsync({
      sub: usuarioEncontrado?._id.toString(),
      perfil: usuarioEncontrado?.perfil,
    });

    //Retorno un JSON con las claves usuario y token
    return {
      access_token: token,
      usuario: {
        _id: usuarioEncontrado._id,
        nombre: usuarioEncontrado.nombre,
        apellido: usuarioEncontrado.apellido,
        fechaNacimiento: usuarioEncontrado.fechaNacimiento,
        correo: usuarioEncontrado.correo,
        usuario: usuarioEncontrado.usuario,
        descripcion: usuarioEncontrado.descripcion,
        perfil: usuarioEncontrado.perfil,
        imagenPerfil: usuarioEncontrado.imagenPerfil,
      },
    };
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
