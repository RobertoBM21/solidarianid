import { DomainError, Either } from '@app/shared/domain';

export class PaymentsGatewaryError implements DomainError {
  constructor(public message?: string) {}
}

export interface PaymentRequestData {
  fundingActionId: string;
  donorId: string;
  amount: number;
}

export interface PaymentData {
  amount: number;
  fundingActionId: string;
  donorId: string;
}

export abstract class PaymentsGatewaryPort {
  abstract generatePaymentLink(
    data: PaymentRequestData,
  ): Promise<Either<PaymentsGatewaryError, string>>;

  abstract verifyPayment(
    externalPaymentId: string,
  ): Promise<Either<PaymentsGatewaryError, PaymentData>>;
}
