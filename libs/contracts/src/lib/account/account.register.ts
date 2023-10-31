import {IsEmail, IsOptional, IsString, Length} from "class-validator";

export namespace AccountRegister {
  export const topic = 'account.register.command';

  export class Request {
    @IsEmail()
    email: string;

    @IsString()
    @Length(6, 40)
    password: string;

    @IsOptional()
    @IsString()
    name?: string;
  }

  export class Response {
    email: string;
  }
}
