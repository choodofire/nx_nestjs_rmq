import { IsNumber, IsString } from 'class-validator';

export namespace PaymentGenerateLink {
  export const topic = 'payment.generate-link.command';

  export class Request {
    @IsString()
    itemId: string;

    @IsString()
    userId: string;

    @IsNumber()
    sum: number;
  }

  export class Response {
    paymentLink: string;
  }
}
