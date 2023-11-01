import { IsString } from 'class-validator';
import {IItem} from "@nest-rmq/interfaces";

export namespace ItemGetItem {
  export const topic = 'item.get-item.query';

  export class Request {
    @IsString()
    id: string;
  }

  export class Response {
    item: IItem | null;
  }
}

