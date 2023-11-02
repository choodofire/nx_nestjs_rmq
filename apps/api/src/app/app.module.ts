import { Module } from '@nestjs/common';
import {AuthController} from "./controllers/auth.controller";
import {ConfigModule} from "@nestjs/config";
import {RMQModule} from "nestjs-rmq";
import {getRMQConfig} from "./configs/rmq.config";
import {JwtModule} from "@nestjs/jwt";
import {getJWTConfig} from "./configs/jwt.config";
import {PassportModule} from "@nestjs/passport";
import {UserController} from "./controllers/user.controller";
import {ScheduleModule} from "@nestjs/schedule";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: 'envs/.api.dev.env', isGlobal: true }),
    RMQModule.forRootAsync(getRMQConfig()),
    JwtModule.registerAsync(getJWTConfig()),
    PassportModule,
    ScheduleModule.forRoot()
  ],
  controllers: [AuthController, UserController]
})
export class AppModule {}
