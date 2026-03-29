import { Either } from '@app/shared/domain';
import { DonationIntentionCreationError } from '../../../initiatives/domain/entities/donation-intention.entity';
import { DonationCreationError } from '../../domain/aggregates/donation.aggregate';
import { CreateDonationDto } from '../dtos/create-donation.dto';
import { DonationDto } from '../dtos/donation.dto';
import { PaymentDto } from '../dtos/payment.dto';
import { PaymentsGatewaryError } from './payments-gateway.port';

export abstract class DonationsPort {
  abstract startDonation(
    data: CreateDonationDto,
    userId: string,
    apiUrl: string,
  ): Promise<
    Either<PaymentsGatewaryError | DonationIntentionCreationError, PaymentDto>
  >;

  abstract completeDonation(
    externalPaymentId: string,
  ): Promise<
    Either<PaymentsGatewaryError | DonationCreationError, DonationDto>
  >;
}
