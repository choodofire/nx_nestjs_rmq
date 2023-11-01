import {IDomainEvent, IUser, IUserItems, PurchaseState, UserRole} from "@nest-rmq/interfaces";
import {compare, genSalt, hash} from "bcryptjs";
import {AccountChangedItem} from "@nest-rmq/contracts";

export class UserEntity implements IUser {
  _id?: string;
  email: string;
  hash_password: string;
  name?: string;
  role: UserRole;
  items: IUserItems[];
  events: IDomainEvent[] = [];

  constructor(user: IUser) {
    this._id = user._id;
    this.hash_password = user.hash_password;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
    this.items = user.items;
  }

  public setItemStatus(itemId: string, state: PurchaseState) {
    const exist = this.items.find(c => c._id === itemId);
    if (!exist) {
      this.items.push({
        itemId,
        purchaseState: state
      });
      return this;
    }

    if (state === PurchaseState.Canceled) {
      this.items = this.items.filter(c => c.itemId !== itemId);
      return this;
    }

    this.items = this.items.map(c => {
      if (c._id === itemId) {
        c.purchaseState = state;
        return c;
      }
      return c;
    });
    this.events.push({
      topic: AccountChangedItem.topic,
      data: { itemId, userId: this._id, state }
    });
    return this;
  }

  public getPublicProfile() {
    return {
      email: this.email,
      role: this.role,
      name: this.name
    }
  }

  public async setPassword(password: string) {
    const salt = await genSalt(10);
    this.hash_password = await hash(password, salt);
    return this;
  }

  public validatePassword(password: string) {
    return compare(password, this.hash_password);
  }

  public updateProfile(name: string) {
    this.name = name;
    return this;
  }
}
