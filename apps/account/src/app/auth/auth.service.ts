import {Injectable} from '@nestjs/common';
import {UserRepository} from "../user/repositories/user.repository";
import {UserEntity} from "../user/entities/user.entity";
import {UserRole} from "@nest-rmq/interfaces";
import {JwtService} from "@nestjs/jwt";
import {AccountRegister} from "@nest-rmq/contracts";

@Injectable()
export class AuthService {
  constructor(
    private  readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  async register({ email, password, name }: AccountRegister.Request): Promise<AccountRegister.Response> {
    const oldUser = await this.userRepository.findUser(email);
    if (oldUser) {
      throw new Error('This user has already been registered.');
    }

    const newUserEntity = await new UserEntity({
      name,
      email,
      hash_password: '',
      role: UserRole.User,
    }).setPassword(password);

    const newUser = await this.userRepository.createUser(newUserEntity);
    return { email: newUser.email };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findUser(email);
    if (!user) {
      throw new Error('Invalid login or password.');
    }

    const userEntity = new UserEntity(user);

    const isCorrectPassword = await userEntity.validatePassword(password);
    if (!isCorrectPassword) {
      throw new Error('Invalid login or password.');
    }

    return { id: userEntity._id };
  }

  async login(id: string) {
    return {
      access_token: await this.jwtService.signAsync({ id })
    };
  }

}
