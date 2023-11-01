import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RMQModule, RMQService, RMQTestService } from 'nestjs-rmq';
import { UserModule } from './user.module';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfig } from '../configs/mongo.config'
import { INestApplication } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { AccountBuyItem, AccountCheckPayment, AccountLogin, AccountRegister, AccountUserInfo, ItemGetItem, PaymentCheck, PaymentGenerateLink } from '@nest-rmq/contracts';
import { verify } from 'jsonwebtoken';
import { faker } from '@faker-js/faker';

const authLogin: AccountLogin.Request = {
  email: faker.internet.email(),
  password: faker.internet.password()
}

const authRegister: AccountRegister.Request = {
  ...authLogin,
  name: faker.internet.displayName()
}

const itemId = 'itemId';

describe('UserController', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let rmqService: RMQTestService;
  let configService: ConfigService;
  let token: string;
  let userId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: 'envs/.account.dev.env' }),
        RMQModule.forTest({}),
        UserModule,
        AuthModule,
        MongooseModule.forRootAsync(getMongoConfig())
      ]
    }).compile();
    app = module.createNestApplication();
    userRepository = app.get<UserRepository>(UserRepository);
    rmqService = app.get(RMQService);
    configService = app.get<ConfigService>(ConfigService);
    await app.init();

    await rmqService.triggerRoute<AccountRegister.Request, AccountRegister.Response>(
      AccountRegister.topic,
      authRegister
    );
    const { access_token } = await rmqService.triggerRoute<AccountLogin.Request, AccountLogin.Response>(
      AccountLogin.topic,
      authLogin
    );
    token = access_token;
    const data = verify(token, configService.get('JWT_SECRET'));
    userId = data['id'];
  })

  it('AccountUserInfo', async () => {
    const res = await rmqService.triggerRoute<AccountUserInfo.Request, AccountUserInfo.Response>(
      AccountUserInfo.topic,
      { id: userId }
    );
    expect(res.profile.name).toEqual(authRegister.name);
  });

  it('BuyItem', async () => {
    const paymentLink = 'paymentLink';

    rmqService.mockReply<ItemGetItem.Response>(ItemGetItem.topic, {
      item: {
        _id: itemId,
        price: 1000
      }
    });

    rmqService.mockReply<PaymentGenerateLink.Response>(PaymentGenerateLink.topic, {
      paymentLink
    });

    const res = await rmqService.triggerRoute<AccountBuyItem.Request, AccountBuyItem.Response>(
      AccountBuyItem.topic,
      { userId, itemId }
    );
    expect(res.paymentLink).toEqual(paymentLink);

    await expect(
      rmqService.triggerRoute<AccountBuyItem.Request, AccountBuyItem.Response>(
        AccountBuyItem.topic,
        { userId, itemId }
      )
    ).rejects.toThrowError();
  });

  it('BuyItem/CheckPayments', async () => {
    rmqService.mockReply<PaymentCheck.Response>(PaymentCheck.topic, {
      status: 'success'
    });

    const res = await rmqService.triggerRoute<AccountCheckPayment.Request, AccountCheckPayment.Response>(
      AccountCheckPayment.topic,
      { userId, itemId }
    );
    expect(res.status).toEqual('success');
  });

  afterAll(async () => {
    await userRepository.deleteUser(authRegister.email);
    app.close();
  });
});
