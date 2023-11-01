import { IsString } from 'class-validator';
import {PurchaseState} from "@nest-rmq/interfaces";

export namespace AccountChangedItem {
  export const topic = 'account.changed-item.event';

  export class Request {
    @IsString()
    userId: string;

    @IsString()
    itemId: string;

    @IsString()
    state: PurchaseState;
  }
}
