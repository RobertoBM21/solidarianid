import { DomainEventsPort, left, right } from '@app/shared/domain';
import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 } from 'uuid';
import { DonationRepository } from '../../domain/repositories/donation.repository';
import { CreateDonationDto } from '../dtos/create-donation.dto';
import { DonationDto } from '../dtos/donation.dto';
import { PaymentDto } from '../dtos/payment.dto';
import { PaymentsGatewaryPort } from '../ports/payments-gateway.port';
import { DonationsService } from './donations.service';

describe('DonationsService', () => {
  let service: DonationsService;

  const domainEvents = { dispatch: jest.fn() };
  const donationRepository = { save: jest.fn() };
  const queryBus = { execute: jest.fn() };
  const paymentsGateway = {
    generatePaymentLink: jest.fn(),
    verifyPayment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationsService,
        { provide: DomainEventsPort, useValue: domainEvents },
        { provide: DonationRepository, useValue: donationRepository },
        { provide: QueryBus, useValue: queryBus },
        { provide: PaymentsGatewaryPort, useValue: paymentsGateway },
      ],
    }).compile();

    service = module.get<DonationsService>(DonationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('startDonation', () => {
    const createDto = {
      fundingActionId: v4(),
      amount: 100,
    } as CreateDonationDto;
    const userId = v4();
    const apiUrl = 'https://api.test/';

    it('returns left when GetDonationIntentionQuery fails', async () => {
      const intentionError = { reason: 'no-intention' };
      queryBus.execute.mockResolvedValueOnce(left(intentionError));
      const res = await service.startDonation(createDto, userId, apiUrl);
      expect(res.isLeft()).toBe(true);
      expect(res.value).toEqual(intentionError);
    });

    it('returns left when payments gateway generatePaymentLink fails', async () => {
      const intention = { id: 'int-1' };
      const gwError = { code: 'gw-fail' };
      queryBus.execute.mockResolvedValueOnce(right(intention));
      paymentsGateway.generatePaymentLink.mockResolvedValueOnce(left(gwError));
      const res = await service.startDonation(createDto, userId, apiUrl);
      expect(res.isLeft()).toBe(true);
      expect(res.value).toEqual(gwError);
    });

    it('returns right with PaymentDto when succeeds', async () => {
      const intention = { id: 'int-1' };
      const paymentLink = 'https://pay.test/checkout/123';
      queryBus.execute.mockResolvedValueOnce(right(intention));
      paymentsGateway.generatePaymentLink.mockResolvedValueOnce(
        right(paymentLink),
      );
      const res = await service.startDonation(createDto, userId, apiUrl);
      expect(res.isRight()).toBe(true);
      expect(res.value).toBeInstanceOf(PaymentDto);
      expect((res.value as PaymentDto).url).toEqual(paymentLink);
    });
  });

  describe('completeDonation', () => {
    it('returns left when payments gateway verifyPayment fails', async () => {
      const gwError = { code: 'verify-fail' };
      paymentsGateway.verifyPayment.mockResolvedValueOnce(left(gwError));
      const externalId = v4();
      const res = await service.completeDonation(externalId);
      expect(res.isLeft()).toBe(true);
      expect(res.value).toEqual(gwError);
      expect(donationRepository.save).not.toHaveBeenCalled();
      expect(domainEvents.dispatch).not.toHaveBeenCalled();
    });

    it('saves, dispatches and returns DonationDto when succeeds', async () => {
      const paymentData = {
        donorId: v4(),
        fundingActionId: v4(),
        amount: 50,
      };
      paymentsGateway.verifyPayment.mockResolvedValueOnce(right(paymentData));
      const externalId = v4();
      const res = await service.completeDonation(externalId);
      expect(res.isRight()).toBe(true);
      expect(donationRepository.save).toHaveBeenCalled();
      expect(domainEvents.dispatch).toHaveBeenCalled();
      expect(res.value).toBeInstanceOf(DonationDto);
      expect((res.value as DonationDto).donorId).toEqual(paymentData.donorId);
    });

    it('returns left when Donation creation fails', async () => {
      const paymentData = {
        donorId: v4(),
        fundingActionId: v4(),
        amount: -2, // invalid amount to trigger creation failure
      };
      paymentsGateway.verifyPayment.mockResolvedValueOnce(right(paymentData));
      const externalId = v4();
      const res = await service.completeDonation(externalId);
      expect(res.isLeft()).toBe(true);
      expect(donationRepository.save).not.toHaveBeenCalled();
      expect(domainEvents.dispatch).not.toHaveBeenCalled();
    });
  });
});
