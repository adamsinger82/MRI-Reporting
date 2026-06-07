import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Credit packages available for purchase
const PACKAGES = {
  starter:    { credits: 1, price_cents: 14900, label: '1 job post' },
  value:      { credits: 3, price_cents: 39900, label: '3 job posts' },
  pro:        { credits: 5, price_cents: 59900, label: '5 job posts' },
};

export async function POST(req) {
  try {
    const { packageId, recruiterId, recruiterEmail } = await req.json();

    if (!packageId || !recruiterId || !recruiterEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pkg = PACKAGES[packageId];
    if (!pkg) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: recruiterEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `LucidMSK Job Post Credits — ${pkg.label}`,
              description: `Post ${pkg.credits} MSK radiology job listing${pkg.credits > 1 ? 's' : ''} on LucidMSK. Posts go live after admin review.`,
            },
            unit_amount: pkg.price_cents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        recruiter_id: recruiterId,
        credits: String(pkg.credits),
        package_id: packageId,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/recruiter?checkout=success&credits=${pkg.credits}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL}/recruiter?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('create-checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
