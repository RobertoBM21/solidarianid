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
import { CauseClosedEvent } from '../../../communities/domain/events/cause-closed.event';
import { FundingActionCreatedEvent } from '../../../initiatives/domain/events/funding-action-created.event';
import { Donation, DonationCreationError } from '../entities/donation.entity';
import { DonationProcessed } from '../events/donation-processed.event';

export type FundingActionEvent =
  | FundingActionCreatedEvent
  | DonationProcessed
  | CauseClosedEvent;

export interface FundingActionData {
  title: string;
  causeId: string;
  currentAmount?: number;
  closed?: boolean;
  version?: bigint;
}

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
  private _version: bigint;

  private constructor(
    props: FundingActionProps,
    id?: UniqueEntityID,
    version = -1n,
  ) {
    super(props, id);
    this._version = version;
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

  get version(): bigint {
    return this._version;
  }

  close(): void {
    if (this.closed) return;
    this.props.status = InitiativeStatus.closed();
    this.addDomainEvent(new CauseClosedEvent(this.causeId.toString()));
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
    donationId: string,
    processedAt: Date = new Date(),
  ): Either<DonationCreationError | InvalidMoneyAmountError, Donation> {
    const amountOrError = MoneyAmount.create(amount);
    if (amountOrError.isLeft()) {
      return left(amountOrError.value);
    }

    const newAmountOrError = this.props.currentAmount.plus(amount);
    if (newAmountOrError.isLeft()) {
      return left(newAmountOrError.value);
    }

    const donationOrError = Donation.create(
      {
        donorId,
        fundingActionId: this.id.toString(),
        externalPaymentId,
        amount,
        date: processedAt,
      },
      UniqueEntityID.create(donationId),
    );
    if (donationOrError.isLeft()) {
      return left(donationOrError.value);
    }

    this.props.currentAmount = newAmountOrError.value;
    this.addDomainEvent(
      new DonationProcessed(
        donationId,
        donorId,
        amount,
        externalPaymentId,
        processedAt,
      ),
    );

    return right(donationOrError.value);
  }

  static create(
    data: FundingActionData,
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
    const action = new FundingAction(props, idObj, data.version ?? -1n);

    if (data.closed === undefined && data.currentAmount === undefined) {
      action.addDomainEvent(
        new FundingActionCreatedEvent(
          action.id.toString(),
          data.title,
          '',
          [],
          data.causeId,
          0,
        ),
      );
    }

    return right(action);
  }
}
