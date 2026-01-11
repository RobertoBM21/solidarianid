import { Either, left, UniqueEntityID } from '@app/shared/domain';
import { QueryHandler } from '@nestjs/cqrs';
import {
  DonationIntention,
  DonationIntentionCreationError,
} from '../../domain/entities/donation-intention.entity';
import { ActionNotFoundError } from '../../domain/repositories/action.repository';
import { FundingActionRepository } from '../../domain/repositories/funding-action.repository';
import { GetDonationIntentionQuery } from '../queries/get-donation-intention.query';

@QueryHandler(GetDonationIntentionQuery)
export class GetDonationIntentionHandler {
  constructor(private readonly repository: FundingActionRepository) {}

  async execute(
    query: GetDonationIntentionQuery,
  ): Promise<
    Either<
      ActionNotFoundError | DonationIntentionCreationError,
      DonationIntention
    >
  > {
    const actionId = UniqueEntityID.create(query.fundingActionId);
    const actionOrError = await this.repository.findById(actionId);
    if (actionOrError.isLeft()) {
      return left(actionOrError.value);
    }

    return actionOrError.value.requestDonation(query.amount, query.donorId);
  }
}
