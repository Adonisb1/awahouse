import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@awahouse/db';
import { monnifyClient } from '@/lib/monnify/client';
import { notifyPaymentReceived, notifyRefunded } from '@/server/services/PaymentNotifications';
import type { EscrowStatus } from '@awahouse/db';

function validateSignature(body: string, signature: string): boolean {
  return monnifyClient.validateWebhookSignature(body, signature);
}

function logTransition(escrowId: string, fromStatus: EscrowStatus, toStatus: EscrowStatus, actorId: string, reason: string) {
  return prisma.transactionLog.create({
    data: { escrowId, fromStatus, toStatus, actorId, reason },
  });
}

function extractPaymentReference(data: Record<string, unknown>): string | null {
  if (data.eventData && typeof data.eventData === 'object') {
    const eventData = data.eventData as Record<string, unknown>;
    return (eventData.paymentReference as string) ?? null;
  }
  return (data.paymentReference as string) ?? null;
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('monnify-signature') ?? '';
  const body = await request.text();

  if (!validateSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const paymentReference = extractPaymentReference(payload);
  if (!paymentReference) {
    return NextResponse.json({ error: 'Missing payment reference' }, { status: 400 });
  }

  const existing = await prisma.escrowTransaction.findFirst({
    where: { paymentReference },
  });

  if (!existing) {
    const instalment = await prisma.rentInstalment.findFirst({
      where: { paymentReference },
    });
    if (!instalment) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    if (instalment.status === 'paid') {
      return NextResponse.json({ status: 'already_processed' });
    }
    await prisma.rentInstalment.update({
      where: { id: instalment.id },
      data: { status: 'paid', paidAt: new Date() },
    });
    return NextResponse.json({ status: 'ok' });
  }

  if (existing.paymentProvider !== 'monnify') {
    return NextResponse.json({ error: 'Not a Monnify transaction' }, { status: 400 });
  }

  const eventType = (payload.eventType as string) ?? '';
  const eventData = (payload.eventData ?? payload) as Record<string, unknown>;
  const paymentStatus = (eventData.paymentStatus as string) ?? '';
  const status = existing.status as EscrowStatus;

  if (eventType === 'SUCCESSFUL_COLLECTION' || paymentStatus === 'PAID') {
    if (status !== 'pending_payment') {
      return NextResponse.json({ status: 'already_processed' });
    }
    await prisma.escrowTransaction.update({
      where: { id: existing.id },
      data: { status: 'funds_held' },
    });
    await logTransition(existing.id, 'pending_payment', 'funds_held', existing.tenantId, 'Monnify payment webhook');
    await notifyPaymentReceived(existing.id);
    return NextResponse.json({ status: 'ok' });
  }

  if (eventType === 'SUCCESSFUL_REFUND' || paymentStatus === 'REFUNDED') {
    if (status !== 'funds_held' && status !== 'disputed') {
      return NextResponse.json({ status: 'cannot_refund' });
    }
    await prisma.escrowTransaction.update({
      where: { id: existing.id },
      data: { status: 'refunded' },
    });
    await logTransition(existing.id, status, 'refunded', 'system', 'Monnify refund webhook');
    await notifyRefunded(existing.id);
    return NextResponse.json({ status: 'ok' });
  }

  if (eventType === 'SUCCESSFUL_DISBURSEMENT') {
    await logTransition(existing.id, status, status, 'system', 'Monnify disbursement success');
    return NextResponse.json({ status: 'ok' });
  }

  if (eventType === 'FAILED_DISBURSEMENT') {
    await logTransition(existing.id, status, status, 'system', 'Monnify disbursement failed');
    return NextResponse.json({ status: 'ok' });
  }

  return NextResponse.json({ status: 'unhandled_event' });
}
