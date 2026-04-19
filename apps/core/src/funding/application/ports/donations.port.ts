import { Either } from '@app/shared/domain';
import { InitiativeAlreadyClosedError } from '@app/shared/domain/value-objects/initiative-status.vo';
import { InvalidMoneyAmountError } from '@app/shared/domain/value-objects/money-amount.vo';
import { DonationCreationError } from '../../domain/entities/donation.entity';
import { FundingActionNotFoundError } from '../../domain/repositories/funding-action.repository';
import { CreateDonationDto } from '../dtos/create-donation.dto';
import { DonationDto } from '../dtos/donation.dto';
import { PaymentDto } from '../dtos/payment.dto';
import { PaymentsGatewaryError } from './payments-gateway.port';

export abstract class DonationsPort {
  abstract startDonation(
    data: CreateDonationDto,
    userId: string,
  ): Promise<
    Either<
      | PaymentsGatewaryError
      | InitiativeAlreadyClosedError
      | InvalidMoneyAmountError
      | FundingActionNotFoundError,
      PaymentDto
    >
  >;

  abstract completeDonation(
    externalPaymentId: string,
  ): Promise<
    Either<
      | PaymentsGatewaryError
      | DonationCreationError
      | FundingActionNotFoundError
      | InvalidMoneyAmountError,
      DonationDto
    >
  >;
}
