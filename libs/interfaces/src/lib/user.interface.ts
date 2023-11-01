export enum UserRole {
  User = 'User',
  Admin = 'Admin'
}

export enum PurchaseState {
  Init = 'Init',
  WaitingForPayment = 'WaitingForPayment',
  Purchased = 'Purchased',
  Canceled = 'Canceled'
}

export interface IUser {
  _id?: string;
  name?: string;
  email: string;
  hash_password: string;
  role: UserRole;
  items?: IUserItems[];
}

export interface IUserItems {
  itemId: string;
  purchaseState: PurchaseState;
}
