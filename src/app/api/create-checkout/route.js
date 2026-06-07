import { NextResponse } from 'next/server';

export async function POST(req) {
  return NextResponse.json(
    { error: 'Stripe not yet configured. Contact admin to purchase credits.' },
    { status: 503 }
  );
}