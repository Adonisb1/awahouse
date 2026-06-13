import { prisma } from '@awahouse/db';
import { notificationService } from './NotificationService';

function formatKobo(amountKobo: bigint): string {
  return `₦${(Number(amountKobo) / 100).toLocaleString()}`;
}

async function loadEscrow(escrowId: string) {
  return prisma.escrowTransaction.findUnique({
    where: { id: escrowId },
    include: {
      tenant: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
      landlord: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
      property: { select: { id: true, title: true } },
    },
  });
}

export async function notifyPaymentReceived(escrowId: string) {
  const escrow = await loadEscrow(escrowId);
  if (!escrow) return;

  const amount = formatKobo(escrow.amountKobo);
  const propertyTitle = escrow.property.title;

  await Promise.allSettled([
    notificationService.sendAll(['in_app', 'email'], {
      userId: escrow.tenantId,
      title: 'EscrowReceived',
      body: `Your payment of ${amount} for "${propertyTitle}" has been received and secured in escrow.`,
      link: `/escrow/${escrowId}`,
      email: escrow.tenant.email ?? undefined,
    }),
    notificationService.sendAll(['in_app', 'email'], {
      userId: escrow.landlordId,
      title: 'PaymentReceived',
      body: `A tenant has paid ${amount} for "${propertyTitle}". Funds are held securely in escrow.`,
      link: `/landlord/escrow/${escrowId}`,
      email: escrow.landlord.email ?? undefined,
    }),
  ]);
}

export async function notifyRefunded(escrowId: string) {
  const escrow = await loadEscrow(escrowId);
  if (!escrow) return;

  const amount = formatKobo(escrow.amountKobo);
  const propertyTitle = escrow.property.title;

  await Promise.allSettled([
    notificationService.sendAll(['in_app', 'email'], {
      userId: escrow.tenantId,
      title: 'EscrowRefunded',
      body: `Your escrow of ${amount} for "${propertyTitle}" has been refunded. Please allow 1-3 business days to reflect.`,
      link: `/escrow/${escrowId}`,
      email: escrow.tenant.email ?? undefined,
    }),
    notificationService.sendAll(['in_app'], {
      userId: escrow.landlordId,
      title: 'EscrowRefunded',
      body: `The escrow of ${amount} for "${propertyTitle}" has been refunded to the tenant.`,
      link: `/landlord/escrow/${escrowId}`,
    }),
  ]);
}

export async function notifyDisputeRaised(escrowId: string, reason: string) {
  const escrow = await loadEscrow(escrowId);
  if (!escrow) return;

  const propertyTitle = escrow.property.title;

  await Promise.allSettled([
    notificationService.sendAll(['in_app', 'email'], {
      userId: escrow.tenantId,
      title: 'DisputeRaised',
      body: `Your dispute for "${propertyTitle}" has been submitted: "${reason}". Our team will review it shortly.`,
      link: `/escrow/${escrowId}`,
      email: escrow.tenant.email ?? undefined,
    }),
    notificationService.sendAll(['in_app', 'email'], {
      userId: escrow.landlordId,
      title: 'DisputeRaised',
      body: `A dispute has been raised on escrow for "${propertyTitle}": "${reason}". Funds are frozen until resolved.`,
      link: `/landlord/escrow/${escrowId}`,
      email: escrow.landlord.email ?? undefined,
    }),
  ]);
}

export async function notifyHandoverConfirmed(escrowId: string) {
  const escrow = await loadEscrow(escrowId);
  if (!escrow) return;

  const amount = formatKobo(escrow.amountKobo);
  const propertyTitle = escrow.property.title;

  await Promise.allSettled([
    notificationService.sendAll(['in_app', 'email'], {
      userId: escrow.tenantId,
      title: 'HandoverConfirmed',
      body: `You have confirmed key handover for "${propertyTitle}". Thank you!`,
      link: `/escrow/${escrowId}`,
      email: escrow.tenant.email ?? undefined,
    }),
    notificationService.sendAll(['in_app', 'email'], {
      userId: escrow.landlordId,
      title: 'FundsReleased',
      body: `Funds of ${amount} for "${propertyTitle}" have been released to your account.`,
      link: `/landlord/escrow/${escrowId}`,
      email: escrow.landlord.email ?? undefined,
    }),
  ]);
}
