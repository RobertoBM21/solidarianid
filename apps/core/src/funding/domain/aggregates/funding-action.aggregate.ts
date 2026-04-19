import {
  AggregateRoot,
  Either,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import {
  ActionCurrentAmount,
  InvalidActionCurrentAmountError,
} from '@app/shared/domain/value-objects/action-current-amount.vo';
import {
  InitiativeAlreadyClosedError,
  InitiativeStatus,
} from '@app/shared/domain/value-objects/initiative-status.vo';
import {
  InvalidMoneyAmountError,
  MoneyAmount,
} from '@app/shared/domain/value-objects/money-amount.vo';
import {
  InvalidTitleError,
  Title,
} from '@app/shared/domain/value-objects/title.vo';
import { Donation, DonationCreationError } from '../entities/donation.entity';

export interface FundingActionProps {
  title: Title;
  status: InitiativeStatus;
  causeId: UniqueEntityID;
  currentAmount: ActionCurrentAmount;
}

export type FundingActionCreationError =
  | InvalidTitleError
  | InvalidActionCurrentAmountError;

export class FundingAction extends AggregateRoot<FundingActionProps> {
  private constructor(props: FundingActionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get title(): string {
    return this.props.title.value;
  }

  get closed(): boolean {
    return this.props.status.isClosed();
  }

  get causeId(): UniqueEntityID {
    return this.props.causeId;
  }

  get currentAmountValue(): number {
    return this.props.currentAmount.value;
  }

  close(): void {
    this.props.status = InitiativeStatus.closed();
  }

  validateDonationRequest(
    amount: number,
  ): Either<InitiativeAlreadyClosedError | InvalidMoneyAmountError, void> {
    if (this.closed) {
      return left(new InitiativeAlreadyClosedError());
    }
    const amountOrError = MoneyAmount.create(amount);
    if (amountOrError.isLeft()) {
      return left(amountOrError.value);
    }
    return right(undefined);
  }

  acceptDonation(
    amount: number,
    donorId: string,
    externalPaymentId: string,
  ): Either<DonationCreationError | InvalidMoneyAmountError, Donation> {
    const newAmountOrError = this.props.currentAmount.plus(amount);
    if (newAmountOrError.isLeft()) {
      return left(newAmountOrError.value);
    }
    const donationOrError = Donation.create({
      donorId,
      fundingActionId: this.id.toString(),
      externalPaymentId,
      amount,
    });
    if (donationOrError.isLeft()) {
      return left(donationOrError.value);
    }
    this.props.currentAmount = newAmountOrError.value;
    return right(donationOrError.value);
  }

  static create(
    data: {
      title: string;
      closed?: boolean;
      causeId: string;
      currentAmount?: number;
    },
    id?: string,
  ): Either<FundingActionCreationError, FundingAction> {
    const titleOrError = Title.create(data.title);
    if (titleOrError.isLeft()) return left(titleOrError.value);

    const currentAmountOrError = ActionCurrentAmount.create(
      data.currentAmount ?? 0,
    );
    if (currentAmountOrError.isLeft()) return left(currentAmountOrError.value);

    const props: FundingActionProps = {
      title: titleOrError.value,
      status: InitiativeStatus.create(data.closed ?? false),
      causeId: UniqueEntityID.create(data.causeId),
      currentAmount: currentAmountOrError.value,
    };

    const idObj = id ? UniqueEntityID.create(id) : undefined;
    return right(new FundingAction(props, idObj));
  }
}
