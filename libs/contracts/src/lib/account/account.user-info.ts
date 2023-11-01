import { IsString } from 'class-validator';
import {IUser} from "@nest-rmq/interfaces";

export namespace AccountUserInfo {
  export const topic = 'account.user-info.query';

  export class Request {
    @IsString()
    id: string;
  }

  export class Response {
    profile: Omit<IUser, 'hash_password'>;
  }
}

