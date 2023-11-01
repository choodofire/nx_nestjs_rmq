import { IsString } from 'class-validator';

export namespace AccountBuyItem {
  export const topic = 'account.buy-item.command';

  export class Request {
    @IsString()
    userId: string;

    @IsString()
    itemId: string;
  }

  export class Response {
    paymentLink: string;
  }
}
