import { Either, left, right } from '@app/shared/domain';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import Stripe from 'stripe';
import { DonationIntention } from '../../../initiatives/domain/entities/donation-intention.entity';
import {
  PaymentData,
  PaymentsGatewaryError,
  PaymentsGatewaryPort,
} from '../../application/ports/payments-gateway.port';
import stripeConfig from '../config/stripe.config';

const PAYMENT_CONCEPT = 'SolidarianID contribution';

@Injectable()
export class StripeAdapter implements PaymentsGatewaryPort {
  private readonly logger = new Logger(StripeAdapter.name);

  private readonly stripe: Stripe;

  constructor(
    @Inject(stripeConfig.KEY)
    private readonly config: ConfigType<typeof stripeConfig>,
  ) {
    this.stripe = new Stripe(this.config.secretKey);
  }

  async generatePaymentLink(
    intention: DonationIntention,
    apiUrl: string,
  ): Promise<Either<PaymentsGatewaryError, string>> {
    const amountCents = Math.round(intention.amount.value * 100);
    const metadata = {
      fundingActionId: intention.fundingActionId.toString(),
      donorId: intention.donorId.toString(),
    };
    const data: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      metadata,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: PAYMENT_CONCEPT,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${apiUrl}/donations/complete/{CHECKOUT_SESSION_ID}`,
    };
    try {
      const checkoutSession = await this.stripe.checkout.sessions.create(data);
      if (!checkoutSession.url) {
        return left(
          new PaymentsGatewaryError('Failed to create checkout session'),
        );
      }
      return right(checkoutSession.url);
    } catch (error) {
      this.logger.error(
        'Error creating payment link',
        (error as Error).message,
      );
      return left(
        new PaymentsGatewaryError(
          'Error creating payment link: ' + (error as Error).message,
        ),
      );
    }
  }

  async verifyPayment(
    externalPaymentId: string,
  ): Promise<Either<PaymentsGatewaryError, PaymentData>> {
    const sessionOrError = await this.getStripeSession(externalPaymentId);
    if (sessionOrError.isLeft()) {
      return left(sessionOrError.value);
    }

    const session = sessionOrError.value;
    if (session.payment_status !== 'paid' || !session.amount_total) {
      return left(new PaymentsGatewaryError('Payment has not been paid'));
    }

    const { fundingActionId, donorId } = session.metadata ?? {};
    if (!fundingActionId || !donorId) {
      return left(
        new PaymentsGatewaryError('Payment metadata is missing required IDs'),
      );
    }

    const paymentData: PaymentData = {
      amount: session.amount_total / 100,
      fundingActionId,
      donorId,
    };

    return right(paymentData);
  }

  private async getStripeSession(
    checkoutId: string,
  ): Promise<Either<PaymentsGatewaryError, Stripe.Checkout.Session>> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(checkoutId);
      return right(session);
    } catch (error) {
      return left(new PaymentsGatewaryError((error as Error).message));
    }
  }
}
