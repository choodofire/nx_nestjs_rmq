import {IsEmail, IsOptional, IsString, Length} from "class-validator";

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 40)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;
}
