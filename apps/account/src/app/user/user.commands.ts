import {Body, Controller} from '@nestjs/common';
import {RMQRoute, RMQValidate} from "nestjs-rmq";
import {AccountBuyItem, AccountChangeProfile, AccountCheckPayment} from "@nest-rmq/contracts";
import {UserService} from "./user.service";

@Controller()
export class UserCommands {
  constructor(
    private readonly userService: UserService
  ) {}

  @RMQValidate()
  @RMQRoute(AccountChangeProfile.topic)
  async changeProfile(@Body() { user, id }: AccountChangeProfile.Request): Promise<AccountChangeProfile.Response> {
    return this.userService.changeProfile(user, id);
  }

  @RMQValidate()
  @RMQRoute(AccountBuyItem.topic)
  async buyItem(@Body() { userId, itemId }: AccountBuyItem.Request): Promise<AccountBuyItem.Response> {
    return this.userService.buyItem(userId, itemId);
  }

  @RMQValidate()
  @RMQRoute(AccountCheckPayment.topic)
  async checkPayment(@Body() { userId, itemId }: AccountCheckPayment.Request): Promise<AccountCheckPayment.Response> {
    return this.userService.checkPayments(userId, itemId);
  }
}
