const mockedStripeCreate = jest.fn();
const mockedStripeRetrieve = jest.fn();

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: mockedStripeCreate,
        retrieve: mockedStripeRetrieve,
      },
    },
  }));
});

import { UniqueEntityID } from '@app/shared/domain';
import { Test } from '@nestjs/testing';
import { v4 } from 'uuid';
import { DonationIntention } from '../../../initiatives/domain/entities/donation-intention.entity';
import { PaymentsGatewaryError } from '../../application/ports/payments-gateway.port';
import stripeConfig from '../config/stripe.config';
import { StripeAdapter } from './stripe.adapter';

describe('StripeAdapter', () => {
  const secret = 'sk_test_abc';
  let adapter: StripeAdapter;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        StripeAdapter,
        { provide: stripeConfig.KEY, useValue: { secretKey: secret } },
      ],
    }).compile();

    adapter = module.get(StripeAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePaymentLink', () => {
    it('generates a payment link on success', async () => {
      const fundingActionId = UniqueEntityID.create();
      const donorId = v4();
      const amount = 25;

      const intentionOr = DonationIntention.create({
        fundingActionId,
        donorId,
        amount,
      });
      if (intentionOr.isLeft()) throw new Error('failed to create intention');
      const intention = intentionOr.value;

      const url = 'https://checkout.stripe.test/session/1';
      mockedStripeCreate.mockResolvedValueOnce({ url });

      const res = await adapter.generatePaymentLink(
        intention,
        'https://api.test',
      );
      expect(res.isRight()).toBe(true);
      if (res.isRight()) expect(res.value).toEqual(url);
    });

    it('returns left when stripe checkout session has no url', async () => {
      const fundingActionId = UniqueEntityID.create();
      const donorId = v4();
      const intentionOr = DonationIntention.create({
        fundingActionId,
        donorId,
        amount: 10,
      });
      if (intentionOr.isLeft()) throw new Error('failed to create intention');
      const intention = intentionOr.value;

      mockedStripeCreate.mockResolvedValueOnce({});

      const res = await adapter.generatePaymentLink(
        intention,
        'https://api.test',
      );
      expect(res.isLeft()).toBe(true);
      if (res.isLeft()) expect(res.value).toBeInstanceOf(PaymentsGatewaryError);
    });

    it('returns left when stripe throws an error', async () => {
      const fundingActionId = UniqueEntityID.create();
      const donorId = v4();
      const intentionOr = DonationIntention.create({
        fundingActionId,
        donorId,
        amount: 10,
      });
      if (intentionOr.isLeft()) throw new Error('failed to create intention');
      const intention = intentionOr.value;

      mockedStripeCreate.mockRejectedValueOnce(new Error('stripe error'));

      const res = await adapter.generatePaymentLink(
        intention,
        'https://api.test',
      );
      expect(res.isLeft()).toBe(true);
      if (res.isLeft()) expect(res.value).toBeInstanceOf(PaymentsGatewaryError);
    });
  });

  describe('verifyPayment', () => {
    it('verifies payment and returns payment data on success', async () => {
      const fundingActionId = v4();
      const donorId = v4();
      const session = {
        payment_status: 'paid',
        amount_total: 5000,
        metadata: { fundingActionId, donorId },
      } as any;

      mockedStripeRetrieve.mockResolvedValueOnce(session);

      const res = await adapter.verifyPayment('checkout_1');
      expect(res.isRight()).toBe(true);
      if (res.isRight()) {
        expect(res.value.amount).toEqual(50);
        expect(res.value.fundingActionId).toEqual(fundingActionId);
        expect(res.value.donorId).toEqual(donorId);
      }
    });

    it('returns left when payment not paid', async () => {
      const session = { payment_status: 'unpaid', amount_total: 1000 } as any;
      mockedStripeRetrieve.mockResolvedValueOnce(session);

      const res = await adapter.verifyPayment('checkout_2');
      expect(res.isLeft()).toBe(true);
      if (res.isLeft()) expect(res.value).toBeInstanceOf(PaymentsGatewaryError);
    });

    it('returns left when stripe retrieve throws', async () => {
      mockedStripeRetrieve.mockRejectedValueOnce(new Error('not found'));

      const res = await adapter.verifyPayment('bad_id');
      expect(res.isLeft()).toBe(true);
      if (res.isLeft()) expect(res.value).toBeInstanceOf(PaymentsGatewaryError);
    });

    it('returns left when metadata is missing IDs', async () => {
      const session = {
        payment_status: 'paid',
        amount_total: 2000,
        metadata: {},
      } as any;
      mockedStripeRetrieve.mockResolvedValueOnce(session);

      const res = await adapter.verifyPayment('checkout_3');
      expect(res.isLeft()).toBe(true);
      if (res.isLeft()) expect(res.value).toBeInstanceOf(PaymentsGatewaryError);
    });
  });
});
