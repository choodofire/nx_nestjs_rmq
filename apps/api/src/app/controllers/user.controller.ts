import {Controller, Logger, Post, UseGuards} from '@nestjs/common';
import {JWTAuthGuard} from "../guards/jwt.guard";
import {UserId} from "../guards/user.decorator";
import {Cron} from "@nestjs/schedule";

@Controller('user')
export class UserController {
  constructor() {}

  @UseGuards(JWTAuthGuard)
  @Post('info')
  async info(@UserId() userId: string) {}

  // Checking Cron operation for periodic startup.
  @Cron('*/5 * * * *')
  async cron() {
    Logger.log('Done!')
  }
}
