import { left, right, UniqueEntityID } from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { FundingAction } from '../../domain/aggregates/funding-action.aggregate';
import { Donation } from '../../domain/entities/donation.entity';
import { DonationRepository } from '../../domain/repositories/donation.repository';
import {
  FundingActionNotFoundError,
  FundingActionRepository,
} from '../../domain/repositories/funding-action.repository';
import { DonationDto } from '../dtos/donation.dto';
import {
  PaymentsGatewaryError,
  PaymentsGatewaryPort,
} from '../ports/payments-gateway.port';
import { DonationsService } from './donations.service';

const ACTION_ID = UniqueEntityID.create().toString();
const USER_ID = UniqueEntityID.create().toString();
const EXTERNAL_PAYMENT_ID = 'cs_test_checkout_session_abc';

const CAUSE_ID = UniqueEntityID.create().toString();

const makeOpenAction = () =>
  FundingAction.create({
    title: 'Test Action',
    causeId: CAUSE_ID,
  }).value as FundingAction;

describe('DonationsService', () => {
  let service: DonationsService;
  let fundingActionRepo: jest.Mocked<
    Pick<FundingActionRepository, 'findById' | 'save'>
  >;
  let donationRepo: jest.Mocked<
    Pick<DonationRepository, 'save' | 'findByExternalPaymentId'>
  >;
  let paymentsGateway: jest.Mocked<
    Pick<PaymentsGatewaryPort, 'generatePaymentLink' | 'verifyPayment'>
  >;

  beforeEach(async () => {
    fundingActionRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    donationRepo = {
      save: jest.fn(),
      findByExternalPaymentId: jest.fn(),
    };
    paymentsGateway = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationsService,
        { provide: FundingActionRepository, useValue: fundingActionRepo },
        { provide: DonationRepository, useValue: donationRepo },
        { provide: PaymentsGatewaryPort, useValue: paymentsGateway },
      ],
    }).compile();

    service = module.get(DonationsService);
  });

  afterEach(jest.clearAllMocks);

  describe('startDonation', () => {
    it('should return a payment link when everything is valid', async () => {
      const action = makeOpenAction();
      fundingActionRepo.findById.mockResolvedValue(right(action));
      paymentsGateway.generatePaymentLink.mockResolvedValue(
        right('https://checkout.stripe.com/session/123'),
      );

      const result = await service.startDonation(
        { fundingActionId: ACTION_ID, amount: 50 },
        USER_ID,
      );

      expect(result.isRight()).toBe(true);
      expect(paymentsGateway.generatePaymentLink).toHaveBeenCalledWith({
        fundingActionId: ACTION_ID,
        donorId: USER_ID,
        amount: 50,
      });
    });

    it('should return error when funding action is not found', async () => {
      fundingActionRepo.findById.mockResolvedValue(
        left(new FundingActionNotFoundError(ACTION_ID)),
      );

      const result = await service.startDonation(
        { fundingActionId: ACTION_ID, amount: 50 },
        USER_ID,
      );

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(FundingActionNotFoundError);
    });

    it('should return error when action is closed', async () => {
      const closedAction = FundingAction.create({
        title: 'Closed',
        causeId: CAUSE_ID,
        closed: true,
      }).value as FundingAction;
      fundingActionRepo.findById.mockResolvedValue(right(closedAction));

      const result = await service.startDonation(
        { fundingActionId: ACTION_ID, amount: 50 },
        USER_ID,
      );

      expect(result.isLeft()).toBe(true);
    });

    it('should return error when payment gateway fails', async () => {
      const action = makeOpenAction();
      fundingActionRepo.findById.mockResolvedValue(right(action));
      paymentsGateway.generatePaymentLink.mockResolvedValue(
        left(new PaymentsGatewaryError('Gateway down')),
      );

      const result = await service.startDonation(
        { fundingActionId: ACTION_ID, amount: 50 },
        USER_ID,
      );

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(PaymentsGatewaryError);
    });
  });

  describe('completeDonation', () => {
    it('should complete a donation and return dto', async () => {
      const action = makeOpenAction();
      paymentsGateway.verifyPayment.mockResolvedValue(
        right({ fundingActionId: ACTION_ID, donorId: USER_ID, amount: 75 }),
      );
      donationRepo.findByExternalPaymentId.mockResolvedValue(null);
      fundingActionRepo.findById.mockResolvedValue(right(action));

      const result = await service.completeDonation(EXTERNAL_PAYMENT_ID);

      expect(result.isRight()).toBe(true);
      const dto = result.value as DonationDto;
      expect(dto.amount).toBe(75);
      expect(donationRepo.save).toHaveBeenCalledTimes(1);
      expect(fundingActionRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should return existing donation when already processed (idempotent)', async () => {
      const existingDonation = Donation.create({
        donorId: USER_ID,
        fundingActionId: ACTION_ID,
        externalPaymentId: EXTERNAL_PAYMENT_ID,
        amount: 75,
      }).value as Donation;
      paymentsGateway.verifyPayment.mockResolvedValue(
        right({ fundingActionId: ACTION_ID, donorId: USER_ID, amount: 75 }),
      );
      donationRepo.findByExternalPaymentId.mockResolvedValue(existingDonation);

      const result = await service.completeDonation(EXTERNAL_PAYMENT_ID);

      expect(result.isRight()).toBe(true);
      expect(donationRepo.save).not.toHaveBeenCalled();
      expect(fundingActionRepo.save).not.toHaveBeenCalled();
      expect(fundingActionRepo.findById).not.toHaveBeenCalled();
    });

    it('should return error when payment verification fails', async () => {
      paymentsGateway.verifyPayment.mockResolvedValue(
        left(new PaymentsGatewaryError('Invalid session')),
      );

      const result = await service.completeDonation(EXTERNAL_PAYMENT_ID);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(PaymentsGatewaryError);
    });

    it('should return error when funding action not found', async () => {
      paymentsGateway.verifyPayment.mockResolvedValue(
        right({ fundingActionId: ACTION_ID, donorId: USER_ID, amount: 50 }),
      );
      donationRepo.findByExternalPaymentId.mockResolvedValue(null);
      fundingActionRepo.findById.mockResolvedValue(
        left(new FundingActionNotFoundError(ACTION_ID)),
      );

      const result = await service.completeDonation(EXTERNAL_PAYMENT_ID);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(FundingActionNotFoundError);
    });
  });
});
