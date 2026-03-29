import { DomainEventsPort, Either, left, right } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetDonationIntentionQuery } from '../../../initiatives/application/queries/get-donation-intention.query';
import { DonationIntentionCreationError } from '../../../initiatives/domain/entities/donation-intention.entity';
import {
  Donation,
  DonationCreationError,
} from '../../domain/aggregates/donation.aggregate';
import { DonationRepository } from '../../domain/repositories/donation.repository';
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
    private readonly domainEvents: DomainEventsPort,
    private readonly donationRepository: DonationRepository,
    private readonly queryBus: QueryBus,
    private readonly paymentsGateway: PaymentsGatewaryPort,
  ) {}

  async startDonation(
    data: CreateDonationDto,
    userId: string,
    apiUrl: string,
  ): Promise<
    Either<PaymentsGatewaryError | DonationIntentionCreationError, PaymentDto>
  > {
    const query = new GetDonationIntentionQuery(
      data.fundingActionId,
      userId,
      data.amount,
    );
    const intentionOrError = await this.queryBus.execute(query);
    if (intentionOrError.isLeft()) {
      return left(intentionOrError.value);
    }

    const paymentLinkOrError = await this.paymentsGateway.generatePaymentLink(
      intentionOrError.value,
      apiUrl,
    );
    if (paymentLinkOrError.isLeft()) {
      return left(paymentLinkOrError.value);
    }

    const paymentDto = new PaymentDto(paymentLinkOrError.value);
    return right(paymentDto);
  }

  async completeDonation(
    externalPaymentId: string,
  ): Promise<
    Either<PaymentsGatewaryError | DonationCreationError, DonationDto>
  > {
    const paymentData =
      await this.paymentsGateway.verifyPayment(externalPaymentId);
    if (paymentData.isLeft()) {
      return left(paymentData.value);
    }

    const donation = Donation.create({
      donorId: paymentData.value.donorId,
      fundingActionId: paymentData.value.fundingActionId,
      amount: paymentData.value.amount,
    });
    if (donation.isLeft()) {
      return left(donation.value);
    }

    await this.donationRepository.save(donation.value);
    await this.domainEvents.dispatch(donation.value);

    const dto = new DonationDto(donation.value);
    return right(dto);
  }
}
