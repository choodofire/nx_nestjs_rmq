import {Body, Controller, Get} from '@nestjs/common';
import {RMQRoute, RMQService, RMQValidate} from "nestjs-rmq";
import {AccountUserInfo, AccountUserItems} from "@nest-rmq/contracts";
import {UserRepository} from "./repositories/user.repository";
import {UserEntity} from "./entities/user.entity";

@Controller('')
export class UserQueries {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rmqService: RMQService
  ) {}

  @RMQValidate()
  @RMQRoute(AccountUserInfo.topic)
  async userInfo(@Body() { id }: AccountUserInfo.Request): Promise<AccountUserInfo.Response> {
    const user = await this.userRepository.findUserById(id);
    const profile = new UserEntity(user).getPublicProfile()
    return {
      profile
    };
  }

  @RMQValidate()
  @RMQRoute(AccountUserItems.topic)
  async userOrders(@Body() { id }: AccountUserItems.Request): Promise<AccountUserItems.Response> {
    const user = await this.userRepository.findUserById(id);
    return {
      items: user.items
    };
  }

  // mb healthcheck
  @Get('healthcheck')
  async healthCheck() {
    const isRMQ = this.rmqService.healthCheck();
    const user = await this.userRepository.healthCheck();
  }
}
