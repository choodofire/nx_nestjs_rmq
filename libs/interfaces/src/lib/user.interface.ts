export enum UserRole {
  User = 'User',
  Admin = 'Admin'
}

export interface IUser {
  _id?: string;
  name?: string;
  email: string;
  hash_password: string;
  role: UserRole;
}
