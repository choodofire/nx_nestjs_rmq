import { IsString } from 'class-validator';
import {IUserItems} from "@nest-rmq/interfaces";

export namespace AccountUserItems {
  export const topic = 'account.user-items.query';

  export class Request {
    @IsString()
    id: string;
  }

  export class Response {
    items: IUserItems[];
  }
}

