import { UserEntity } from '../entities/user.entity';
import { BuyItemSaga } from './buy-item.saga';
import {PaymentStatus} from "@nest-rmq/contracts";

export abstract class BuyItemSagaState {
  public saga: BuyItemSaga;

  public setContext(saga: BuyItemSaga) {
    this.saga = saga;
  }

  public abstract pay(): Promise<{ paymentLink: string, user: UserEntity }>;
  public abstract checkPayment(): Promise<{ user: UserEntity, status: PaymentStatus }>;
  public abstract cancel(): Promise<{ user: UserEntity }>;
}
