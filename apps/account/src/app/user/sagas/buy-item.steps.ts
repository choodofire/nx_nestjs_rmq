import { UserEntity } from '../entities/user.entity';
import {BuyItemSagaState} from "./buy-item.state";
import {PurchaseState} from "@nest-rmq/interfaces";
import {ItemGetItem, PaymentCheck, PaymentGenerateLink, PaymentStatus} from "@nest-rmq/contracts";

export class BuyItemSagaStateStarted extends BuyItemSagaState {
  public async pay(): Promise<{ paymentLink: string; user: UserEntity; }> {
    const { item } = await this.saga.rmqService.send<ItemGetItem.Request, ItemGetItem.Response>(ItemGetItem.topic, {
      id: this.saga.itemId
    });
    if (!item) {
      throw new Error('There is no such item.');
    }
    if (item.price == 0) {
      this.saga.setState(PurchaseState.Purchased, item._id);
      return { paymentLink: null, user: this.saga.user };
    }
    const { paymentLink } = await this.saga.rmqService.send<PaymentGenerateLink.Request, PaymentGenerateLink.Response>(PaymentGenerateLink.topic, {
      itemId: item._id,
      userId: this.saga.user._id,
      sum: item.price
    });
    this.saga.setState(PurchaseState.WaitingForPayment, item._id);
    return { paymentLink, user: this.saga.user };
  }

  public checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
    throw new Error('You cant check a payment that has not started.');
  }

  public async cancel(): Promise<{ user: UserEntity; }> {
    this.saga.setState(PurchaseState.Canceled, this.saga.itemId);
    return { user: this.saga.user };
  }
}

export class BuyItemSagaStateWaitingForPayment extends BuyItemSagaState {
  public pay(): Promise<{ paymentLink: string; user: UserEntity; }> {
    throw new Error('You cant create a payment link in the process.');
  }

  public async checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
    const { status } = await this.saga.rmqService.send<PaymentCheck.Request, PaymentCheck.Response>(PaymentCheck.topic, {
      userId: this.saga.user._id,
      itemId: this.saga.itemId
    });

    if (status === 'canceled') {
      this.saga.setState(PurchaseState.Canceled, this.saga.itemId);
      return { user: this.saga.user, status: 'canceled' };
    }

    if (status === 'success') {
      return { user: this.saga.user, status: 'success' };
    }

    this.saga.setState(PurchaseState.Purchased, this.saga.itemId);
    return { user: this.saga.user, status: 'progress' };
  }

  public cancel(): Promise<{ user: UserEntity; }> {
    throw new Error('You cant cancel a payment in the process.');
  }
}

export class BuyItemSagaStatePurchased extends BuyItemSagaState {
  public pay(): Promise<{ paymentLink: string; user: UserEntity; }> {
    throw new Error('You cant pay for a purchased course.');
  }
  public checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
    throw new Error('You cant check the payment against the purchased rate.');
  }
  public cancel(): Promise<{ user: UserEntity; }> {
    throw new Error('You cant cancel a course you\'ve purchased.');
  }
}

export class BuyItemSagaStateCanceled extends BuyItemSagaState {
  public pay(): Promise<{ paymentLink: string; user: UserEntity; }> {
    this.saga.setState(PurchaseState.Init, this.saga.itemId);
    return this.saga.getState().pay();
  }
  public checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
    throw new Error('You cant verify a payment at the cancelled rate.');
  }
  public cancel(): Promise<{ user: UserEntity; }> {
    throw new Error('You cant undo a cancelled course.');
  }
}
