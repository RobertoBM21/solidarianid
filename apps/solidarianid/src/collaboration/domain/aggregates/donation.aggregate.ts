import {
  AggregateRoot,
  Either,
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
import { DonationCreated } from '../events/donation-created.event';

export interface DonationProps {
  amount: MoneyAmount;
  donorId: UniqueEntityID;
  fundingActionId: UniqueEntityID;
  createdAt: CreationDate;
}

export type DonationCreationError = InvalidMoneyAmountError | InvalidDateError;

export class Donation extends AggregateRoot<DonationProps> {
  private constructor(props: DonationProps, id?: UniqueEntityID) {
    super(props, id);
    if (!id) {
      const ev = new DonationCreated(
        this.props.fundingActionId.toString(),
        this.props.amount.value,
      );
      this.addDomainEvent(ev);
    }
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

  get createdAt(): Date {
    return this.props.createdAt.value;
  }

  static create(
    data: {
      donorId: string;
      fundingActionId: string;
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
      amount: amountOrError.value,
      createdAt: createdAtOrError.value,
    };
    return right(new Donation(props, id));
  }
}
