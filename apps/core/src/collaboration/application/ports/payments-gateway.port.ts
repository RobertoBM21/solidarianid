import { DomainError, Either } from '@app/shared/domain';
import { DonationIntention } from '../../../initiatives/domain/entities/donation-intention.entity';

export class PaymentsGatewaryError implements DomainError {
  constructor(public message?: string) {}
}

export interface PaymentData {
  amount: number;
  fundingActionId: string;
  donorId: string;
}

export abstract class PaymentsGatewaryPort {
  abstract generatePaymentLink(
    intention: DonationIntention,
    apiUrl: string,
  ): Promise<Either<PaymentsGatewaryError, string>>;

  abstract verifyPayment(
    externalPaymentId: string,
  ): Promise<Either<PaymentsGatewaryError, PaymentData>>;
}
