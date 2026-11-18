import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { HydratedDocument, Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../usuario/entities/usuario.entity.js';
import { UsuarioService } from '../usuario/usuario.service.js';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usuarioService: UsuarioService,
    @InjectModel(Usuario.name)
    private readonly usuarioModel: Model<Usuario>,
  ) {}

  async registrar(createUsuarioDto: CreateUsuarioDto) {
    const usuarioCreado = await this.usuarioService.create(createUsuarioDto);
    return this.crearRespuestaAutenticacion(usuarioCreado);
  }

  async login(identificador: string, password: string) {
    //Busco en la base por identificador.
    //Si lo encuentra lo devuelve con el hash
    const usuarioEncontrado = await this.usuarioModel
      .findOne({
        $or: [{ usuario: identificador }, { correo: identificador }],
        $and: [{ estaHabilitado: true }],
      })
      .select('+password');

    //Bcrypt hashea la contraseña recibida por parámetro
    // y la compara con la del usuario encontrado
    if (
      !usuarioEncontrado ||
      !(await bcrypt.compare(password, usuarioEncontrado.password))
    ) {
      throw new UnauthorizedException('Usuario no autorizado.');
    }

    return this.crearRespuestaAutenticacion(usuarioEncontrado);
  }

  async autorizar(id: string) {
    const usuario = await this.usuarioModel
      .findOne({ _id: id, estaHabilitado: true })
      .select('-password');

    if (!usuario) {
      throw new UnauthorizedException('El usuario del token ya no existe.');
    }

    return usuario;
  }

  private async crearRespuestaAutenticacion(
    usuario: HydratedDocument<Usuario>,
  ) {
    const token = await this.jwtService.signAsync({
      id: usuario._id.toString(),
      perfil: usuario.perfil,
    });

    return {
      access_token: token,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        fechaNacimiento: usuario.fechaNacimiento,
        correo: usuario.correo,
        usuario: usuario.usuario,
        descripcion: usuario.descripcion,
        perfil: usuario.perfil,
        imagenPerfil: usuario.imagenPerfil,
      },
    };
  }

  async refrescar(payload: { id: string; perfil: string }) {
    const access_token = await this.jwtService.signAsync({
      id: payload.id,
      perfil: payload.perfil,
    });
    return { access_token };
  }
}
