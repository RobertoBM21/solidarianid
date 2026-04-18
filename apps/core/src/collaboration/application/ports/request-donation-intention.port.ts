import { Either } from '@app/shared/domain';
import { DonationIntentionDto } from '../../../initiatives/application/dtos/donation-intention.dto';
import { DonationIntentionCreationError } from '../../../initiatives/domain/entities/donation-intention.entity';
import { ActionNotFoundError } from '../../../initiatives/domain/repositories/action.repository';
import { DonationIntention } from '../../../initiatives/domain/entities/donation-intention.entity';

export abstract class RequestDonationIntentionPort {
  abstract requestDonation(
    data: DonationIntentionDto,
  ): Promise<
    Either<
      ActionNotFoundError | DonationIntentionCreationError,
      DonationIntention
    >
  >;
}
