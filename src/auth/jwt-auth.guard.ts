import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

//*********************************************/
//Esto dejaría una forma => request = {user:{sub: string, perfil: string}}

type DatosDelToken = {
  sub: string;
  perfil: string;
};

type RequestConUsuario = Request & {
  user: DatosDelToken;
};
//*********************************************/

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  //Acá se revisa la petición. Si tiene el token en la cabecera permite acceso.
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestConUsuario>();
    const authorization = request.headers.authorization;
    const [tipo, token] = authorization?.split(' ') ?? [];

    //Revisa que el token exista y tenga esa forma.
    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Falta el token de acceso.');
    }

    //Si existe, revisa que no esté vencido.
    try {
      request.user = await this.jwtService.verifyAsync<DatosDelToken>(token);
      return true;
    } catch {
      throw new UnauthorizedException('El token no es válido o venció.');
    }
  }
}
