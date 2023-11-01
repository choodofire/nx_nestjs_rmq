import { IsString } from 'class-validator';
import {IUser} from "@nest-rmq/interfaces";

export namespace AccountChangeProfile {
  export const topic = 'account.change-profile.command';

  export class Request {
    @IsString()
    id: string;

    @IsString()
    user: Pick<IUser, 'name'>
  }

  export class Response {}
}

