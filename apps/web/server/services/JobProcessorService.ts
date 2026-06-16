import crypto from 'crypto';
import { prisma } from '@awahouse/db';
import { notificationService } from '@/server/services/NotificationService';
import { notifyHandoverConfirmed } from '@/server/services/PaymentNotifications';
import { paymentRouter } from '@/lib/payments/router';
import { escrowService } from '@/server/services/EscrowService';
import { rentScoreService } from '@/server/services/RentScoreService';
import type { EscrowStatus } from '@awahouse/db';

async function logTransition(
  escrowId: string,
  fromStatus: EscrowStatus,
  toStatus: EscrowStatus,
  actorId: string,
  reason: string,
) {
  return prisma.transactionLog.create({
    data: { escrowId, fromStatus, toStatus, actorId, reason },
  });
}

export async function processAutoRelease(escrowId: string) {
  const escrow = await prisma.escrowTransaction.findUnique({ where: { id: escrowId } });
  if (!escrow || escrow.isDeleted) {
    console.warn(`[cron] Auto-release: escrow ${escrowId} not found`);
    return;
  }
  if (escrow.status !== 'key_handover_pending') {
    console.log(`[cron] Auto-release: escrow ${escrowId} status is ${escrow.status}, skipping`);
    return;
  }

  await prisma.escrowTransaction.update({
    where: { id: escrowId },
    data: { status: 'completed', completedAt: new Date() },
  });
  await logTransition(escrowId, 'key_handover_pending', 'completed', 'system', 'Auto-release after 48h');
  await notifyHandoverConfirmed(escrowId);
  await escrowService.payout(escrowId);

  console.log(`[cron] Auto-release: escrow ${escrowId} completed`);
}

export async function processRemindHandover(escrowId: string, hoursRemaining: number) {
  const escrow = await prisma.escrowTransaction.findUnique({ where: { id: escrowId } });
  if (!escrow || escrow.status !== 'key_handover_pending') return;

  await notificationService.sendInApp(
    escrow.tenantId,
    'Handover Reminder',
    `Please confirm key handover within ${hoursRemaining} hours, otherwise funds will be auto-released to the landlord.`,
    `/escrow/${escrowId}`,
  );

  console.log(`[cron] Reminder: escrow ${escrowId} — ${hoursRemaining}h remaining`);
}

export async function processInstalmentCharge(instalmentId: string) {
  const instalment = await prisma.rentInstalment.findUnique({
    where: { id: instalmentId },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
      escrow: { select: { id: true } },
    },
  });
  if (!instalment || instalment.status === 'paid') return;

  const tenantEmail = instalment.user.email;
  if (!tenantEmail) {
    await prisma.rentInstalment.update({
      where: { id: instalmentId },
      data: { status: 'missed' },
    });
    return;
  }

  try {
    const reference = `AWA-RENT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const tenantName = `${instalment.user.firstName ?? ''} ${instalment.user.lastName ?? ''}`.trim() || tenantEmail;
    const result = await paymentRouter.initiateTransaction({
      amountKobo: instalment.amountKobo,
      customerEmail: tenantEmail,
      customerName: tenantName,
      reference,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/rent-instalments`,
    });

    await prisma.rentInstalment.update({
      where: { id: instalmentId },
      data: { paymentReference: reference },
    });

    await notificationService.sendAll(['in_app', 'email', 'sms'], {
      userId: instalment.userId,
      title: 'InstalmentDue',
      body: `Your monthly rent instalment of ₦${(Number(instalment.amountKobo) / 100).toLocaleString()} is due. Pay now to avoid a missed payment penalty.`,
      link: '/rent-instalments',
      email: tenantEmail,
      phone: instalment.user.phone ?? undefined,
    });

    console.log(`[cron] Instalment charge initiated: ${instalmentId} — ${result.checkoutUrl}`);
  } catch (err) {
    console.error(`[cron] Instalment charge failed: ${instalmentId}`, err);
    if ((instalment.retryCount ?? 0) >= 3) {
      await prisma.rentInstalment.update({
        where: { id: instalmentId },
        data: { status: 'missed' },
      });
    } else {
      await prisma.rentInstalment.update({
        where: { id: instalmentId },
        data: { retryCount: (instalment.retryCount ?? 0) + 1 },
      });
    }
  }
}

export async function processScanOverdue() {
  console.log('[cron] Scanning overdue instalments...');
  const result = await rentScoreService.scanOverdueInstalments();
  console.log(`[cron] Overdue scan complete — ${result.processed} processed`);
}
