import { Module } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service.js';
import { EstadisticasController } from './estadisticas.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { MongooseModule } from '@nestjs/mongoose';
import { Publicacion, PublicacionSchema } from '../publicacion/entities/publicacion.entity.js';
import { Comentario, ComentarioSchema } from '../comentario/entities/comentario.entity.js';
import { Usuario, UsuarioSchema } from '../usuario/entities/usuario.entity.js';
import { AdminGuard } from '../auth/admin.guard/admin.guard.js';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema },
      { name: Usuario.name, schema: UsuarioSchema },
    ]),
  ],
  controllers: [EstadisticasController],
  providers: [EstadisticasService, AdminGuard],
})
export class EstadisticasModule {}
