import { Document } from "mongoose";
import {IUser, UserRole} from "@nest-rmq/interfaces";
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

@Schema()
export class User extends Document implements IUser {
  @Prop({ type: String })
  name: string;

  @Prop({ required: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  hash_password: string;

  @Prop({ required: true, enum: UserRole, type: String, default: UserRole.User })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User)
