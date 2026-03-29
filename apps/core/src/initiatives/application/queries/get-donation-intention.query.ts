import { Either } from '@app/shared/domain';
import { Query } from '@nestjs/cqrs';
import {
  DonationIntention,
  DonationIntentionCreationError,
} from '../../domain/entities/donation-intention.entity';
import { ActionNotFoundError } from '../../domain/repositories/action.repository';

export class GetDonationIntentionQuery extends Query<
  Either<
    ActionNotFoundError | DonationIntentionCreationError,
    DonationIntention
  >
> {
  constructor(
    public readonly fundingActionId: string,
    public readonly donorId: string,
    public readonly amount: number,
  ) {
    super();
  }
}
