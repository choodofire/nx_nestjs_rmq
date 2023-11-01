import { RMQService } from 'nestjs-rmq';
import { UserEntity } from '../entities/user.entity';
import {PurchaseState} from "@nest-rmq/interfaces";
import {BuyItemSagaState} from "./buy-item.state";
import {
  BuyItemSagaStateCanceled,
  BuyItemSagaStatePurchased,
  BuyItemSagaStateStarted,
  BuyItemSagaStateWaitingForPayment
} from "./buy-item.steps";

export class BuyItemSaga {
  private state: BuyItemSagaState;

  constructor(public user: UserEntity, public itemId: string, public rmqService: RMQService) {
    this.setState(user.getItemState(itemId), itemId);
  }

  setState(state: PurchaseState, itemId: string) {
    switch (state) {
      case PurchaseState.Init:
        this.state = new BuyItemSagaStateStarted();
        break;
      case PurchaseState.WaitingForPayment:
        this.state = new BuyItemSagaStateWaitingForPayment();
        break;
      case PurchaseState.Purchased:
        this.state = new BuyItemSagaStatePurchased();
        break;
      case PurchaseState.Canceled:
        this.state = new BuyItemSagaStateCanceled();
        break;
    }
    this.state.setContext(this);
    this.user.setItemStatus(itemId, state)
  }

  getState() {
    return this.state;
  }
}
