import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@awahouse/db';
import type { EscrowStatus } from '@awahouse/db';

function validateSignature(body: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY ?? '';
  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');
  return hash === signature;
}

function logTransition(escrowId: string, fromStatus: EscrowStatus, toStatus: EscrowStatus, actorId: string, reason: string) {
  return prisma.transactionLog.create({
    data: { escrowId, fromStatus, toStatus, actorId, reason },
  });
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-paystack-signature') ?? '';
  const body = await request.text();

  if (!validateSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: { event: string; data: { reference?: string; amount?: number; status?: string; transfer_code?: string } };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!event.data.reference) {
    return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
  }

  const existing = await prisma.escrowTransaction.findFirst({
    where: { paymentReference: event.data.reference },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
  }

  if (existing.paymentProvider !== 'paystack') {
    return NextResponse.json({ error: 'Not a Paystack transaction' }, { status: 400 });
  }

  const status = existing.status as EscrowStatus;

  switch (event.event) {
    case 'charge.success': {
      if (status !== 'pending_payment') {
        return NextResponse.json({ status: 'already_processed' });
      }
      await prisma.escrowTransaction.update({
        where: { id: existing.id },
        data: { status: 'funds_held' },
      });
      await logTransition(existing.id, 'pending_payment', 'funds_held', existing.tenantId, 'Paystack charge.success webhook');
      break;
    }

    case 'transfer.success': {
      await logTransition(existing.id, status, status, 'system', 'Paystack transfer.success');
      break;
    }

    case 'transfer.failed': {
      await logTransition(existing.id, status, status, 'system', `Paystack transfer.failed: ${event.data.status ?? 'unknown'}`);
      break;
    }

    case 'refund.processed': {
      if (status !== 'funds_held' && status !== 'disputed') {
        return NextResponse.json({ status: 'cannot_refund' });
      }
      await prisma.escrowTransaction.update({
        where: { id: existing.id },
        data: { status: 'refunded' },
      });
      await logTransition(existing.id, status, 'refunded', 'system', 'Paystack refund.processed webhook');
      break;
    }

    default:
      return NextResponse.json({ status: 'unhandled_event' });
  }

  return NextResponse.json({ status: 'ok' });
}
