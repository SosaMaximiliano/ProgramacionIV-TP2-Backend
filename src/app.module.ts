import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuarioModule } from './usuario/usuario.module.js';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://user:MhiGxfdiQ23KJz5L@practicamongo.xmshni6.mongodb.net/',
    ),
    UsuarioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
