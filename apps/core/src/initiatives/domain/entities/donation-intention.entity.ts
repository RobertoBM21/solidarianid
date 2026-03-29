import { Either, Entity, right, UniqueEntityID } from '@app/shared/domain';
import {
  InvalidMoneyAmountError,
  MoneyAmount,
} from '@app/shared/domain/value-objects/money-amount.vo';

export interface DonationIntentionProps {
  fundingActionId: UniqueEntityID;
  donorId: UniqueEntityID;
  amount: MoneyAmount;
}

export type DonationIntentionCreationError = InvalidMoneyAmountError;

export class DonationIntention extends Entity<DonationIntentionProps> {
  private constructor(props: DonationIntentionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get fundingActionId(): UniqueEntityID {
    return this.props.fundingActionId;
  }

  get donorId(): UniqueEntityID {
    return this.props.donorId;
  }

  get amount(): MoneyAmount {
    return this.props.amount;
  }

  static create(data: {
    fundingActionId: UniqueEntityID;
    donorId: string;
    amount: number;
  }): Either<DonationIntentionCreationError, DonationIntention> {
    const amountOrError = MoneyAmount.create(data.amount);
    if (amountOrError.isLeft()) {
      throw new Error('Invalid amount for Donation Intention');
    }

    const donorId = UniqueEntityID.create(data.donorId);

    const props: DonationIntentionProps = {
      fundingActionId: data.fundingActionId,
      donorId,
      amount: amountOrError.value,
    };

    return right(new DonationIntention(props));
  }
}
