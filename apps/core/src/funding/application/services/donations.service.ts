import { Either, UniqueEntityID, left, right } from '@app/shared/domain';
import { InitiativeAlreadyClosedError } from '@app/shared/domain/value-objects/initiative-status.vo';
import { InvalidMoneyAmountError } from '@app/shared/domain/value-objects/money-amount.vo';
import { Injectable } from '@nestjs/common';
import { DonationCreationError } from '../../domain/entities/donation.entity';
import { DonationRepository } from '../../domain/repositories/donation.repository';
import {
  FundingActionNotFoundError,
  FundingActionRepository,
} from '../../domain/repositories/funding-action.repository';
import { CreateDonationDto } from '../dtos/create-donation.dto';
import { DonationDto } from '../dtos/donation.dto';
import { PaymentDto } from '../dtos/payment.dto';
import { DonationsPort } from '../ports/donations.port';
import {
  PaymentsGatewaryError,
  PaymentsGatewaryPort,
} from '../ports/payments-gateway.port';

@Injectable()
export class DonationsService implements DonationsPort {
  constructor(
    private readonly donationRepository: DonationRepository,
    private readonly fundingActionRepository: FundingActionRepository,
    private readonly paymentsGateway: PaymentsGatewaryPort,
  ) {}

  async startDonation(
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
  > {
    const actionId = UniqueEntityID.create(data.fundingActionId);
    const actionOrError = await this.fundingActionRepository.findById(actionId);
    if (actionOrError.isLeft()) {
      return left(actionOrError.value);
    }

    const validationResult = actionOrError.value.validateDonationRequest(
      data.amount,
    );
    if (validationResult.isLeft()) {
      return left(validationResult.value);
    }

    const paymentLinkOrError = await this.paymentsGateway.generatePaymentLink({
      fundingActionId: data.fundingActionId,
      donorId: userId,
      amount: data.amount,
    });
    if (paymentLinkOrError.isLeft()) {
      return left(paymentLinkOrError.value);
    }

    return right(new PaymentDto(paymentLinkOrError.value));
  }

  async completeDonation(
    externalPaymentId: string,
  ): Promise<
    Either<
      | PaymentsGatewaryError
      | DonationCreationError
      | FundingActionNotFoundError
      | InvalidMoneyAmountError,
      DonationDto
    >
  > {
    const paymentData =
      await this.paymentsGateway.verifyPayment(externalPaymentId);
    if (paymentData.isLeft()) {
      return left(paymentData.value);
    }

    const existingDonation =
      await this.donationRepository.findByExternalPaymentId(externalPaymentId);
    if (existingDonation) {
      return right(new DonationDto(existingDonation));
    }

    const { fundingActionId, donorId, amount } = paymentData.value;

    const actionOrError = await this.fundingActionRepository.findById(
      UniqueEntityID.create(fundingActionId),
    );
    if (actionOrError.isLeft()) {
      return left(actionOrError.value);
    }

    const donationId = UniqueEntityID.create().toString();
    const donationOrError = actionOrError.value.acceptDonation(
      amount,
      donorId,
      externalPaymentId,
      donationId,
    );
    if (donationOrError.isLeft()) {
      return left(donationOrError.value);
    }

    await this.donationRepository.save(donationOrError.value);
    await this.fundingActionRepository.save(actionOrError.value);

    return right(new DonationDto(donationOrError.value));
  }
}
