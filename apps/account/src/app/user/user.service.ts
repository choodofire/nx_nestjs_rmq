import {Injectable} from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { BuyItemSaga } from './sagas/buy-item.saga';
import {IUser} from "@nest-rmq/interfaces";
import {UserEventEmmiter} from "./user.event-emmiter";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rmqService: RMQService,
    private readonly userEventEmmiter: UserEventEmmiter
  ) {}

  public async changeProfile(user: Pick<IUser, 'name'>, id: string) {
    const existedUser = await this.userRepository.findUserById(id);
    if (!existedUser) {
      throw new Error('This user does not exist.')
    }
    const userEntity = new UserEntity(existedUser).updateProfile(user.name);
    await this.updateUser(userEntity);
    return {};
  }

  public async buyItem(userId: string, itemId: string) {
    const existedUser = await this.userRepository.findUserById(userId);
    if (!existedUser) {
      throw new Error('This user does not exist.')
    }
    const userEntity = new UserEntity(existedUser);
    const saga = new BuyItemSaga(userEntity, itemId, this.rmqService);
    const { user, paymentLink } = await saga.getState().pay();
    await this.updateUser(user);
    return { paymentLink };
  }

  public async checkPayments(userId: string, itemId: string) {
    const existedUser = await this.userRepository.findUserById(userId);
    if (!existedUser) {
      throw new Error('This user does not exist.')
    }
    const userEntity = new UserEntity(existedUser);
    const saga = new BuyItemSaga(userEntity, itemId, this.rmqService);
    const { user, status } = await saga.getState().checkPayment();
    await this.updateUser(user);
    return { status };
  }

  private updateUser(user: UserEntity) {
    return Promise.all([
      this.userEventEmmiter.handle(user),
      this.userRepository.updateUser(user)
    ]);
  }
}
