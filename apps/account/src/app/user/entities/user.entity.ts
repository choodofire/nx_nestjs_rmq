import {IUser, UserRole} from "@nest-rmq/interfaces";
import {compare, genSalt, hash} from "bcryptjs";

export class UserEntity implements IUser {
  _id?: string;
  email: string;
  hash_password: string;
  name?: string;
  role: UserRole;

  constructor(user: IUser) {
    this._id = user._id;
    this.hash_password = user.hash_password;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
  }

  public async setPassword(password: string) {
    const salt = await genSalt(10);
    this.hash_password = await hash(password, salt);
    return this;
  }

  public validatePassword(password: string) {
    return compare(password, this.hash_password);
  }
}
