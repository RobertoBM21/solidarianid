import {
  Either,
  Entity,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import {
  CreationDate,
  InvalidDateError,
} from '@app/shared/domain/value-objects/creation-date.vo';
import {
  InvalidMoneyAmountError,
  MoneyAmount,
} from '@app/shared/domain/value-objects/money-amount.vo';

export interface DonationProps {
  amount: MoneyAmount;
  donorId: UniqueEntityID;
  fundingActionId: UniqueEntityID;
  externalPaymentId: string;
  createdAt: CreationDate;
}

export type DonationCreationError = InvalidMoneyAmountError | InvalidDateError;

export class Donation extends Entity<DonationProps> {
  private constructor(props: DonationProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get amount(): number {
    return this.props.amount.value;
  }

  get donorId(): string {
    return this.props.donorId.toString();
  }

  get fundingActionId(): string {
    return this.props.fundingActionId.toString();
  }

  get externalPaymentId(): string {
    return this.props.externalPaymentId;
  }

  get createdAt(): Date {
    return this.props.createdAt.value;
  }

  static create(
    data: {
      donorId: string;
      fundingActionId: string;
      externalPaymentId: string;
      amount: number;
      date?: Date;
    },
    id?: UniqueEntityID,
  ): Either<DonationCreationError, Donation> {
    const amountOrError = MoneyAmount.create(data.amount);
    if (amountOrError.isLeft()) {
      return left(amountOrError.value);
    }

    const donorId = UniqueEntityID.create(data.donorId);
    const fundingActionId = UniqueEntityID.create(data.fundingActionId);

    const createdAtOrError = CreationDate.create(data.date);
    if (createdAtOrError.isLeft()) {
      return left(createdAtOrError.value);
    }

    const props: DonationProps = {
      donorId,
      fundingActionId,
      externalPaymentId: data.externalPaymentId,
      amount: amountOrError.value,
      createdAt: createdAtOrError.value,
    };
    return right(new Donation(props, id));
  }
}
