import {IsEmail, IsString, Length} from 'class-validator';

export namespace AccountLogin {
  export const topic = 'account.login.command';

  export class Request {
    @IsEmail()
    email: string;

    @IsString()
    @Length(6, 40)
    password: string;
  }

  export class Response {
    access_token: string;
  }
}

