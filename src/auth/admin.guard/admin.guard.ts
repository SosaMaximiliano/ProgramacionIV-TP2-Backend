import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

type RequestConUsuario = Request & {
  user?: {
    id: string;
    perfil: string;
  };
};

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestConUsuario>();

    if (request.user?.perfil !== 'administrador') {
      throw new ForbiddenException(
        'Esta acción requiere perfil de administrador.',
      );
    }

    return true;
  }
}
