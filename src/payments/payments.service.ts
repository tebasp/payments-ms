import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { envs } from '../config';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.STRIPE_SECRET_KEY);

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { orderId, currency, items } = paymentSessionDto;

    const lineItems = items.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item?.name,
        },
        unit_amount: Math.round(item?.price * 100),
      },
      quantity: item?.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      // Send the orderID
      payment_intent_data: {
        metadata: {
          orderId,
        },
      },

      line_items: lineItems,

      mode: 'payment',
      success_url: envs.STRIPE_SUCCESS_URL,
      cancel_url: envs.STRIPE_CANCEL_URL,
    });

    return session;
  }

  async webhookHandler(req: Request, res: Response) {
    const endpointSecret = envs.STRIPE_SECRET_KEY;

    const sig = req.headers['stripe-signature'];

    console.log('Webhook received! sig:', sig);

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        sig,
        endpointSecret,
      );
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    switch (event.type) {
      case 'charge.succeeded':
        const chargeSucceeded = event.data.object;

        console.log('Payment was successful:', {
          metadata: chargeSucceeded.metadata,
        });
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    console.log('Webhook Event:', event);

    res.status(200).json({ sig });
  }
}
