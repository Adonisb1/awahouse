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

export async function notifyEscrowInitiated(escrowId: string) {
  const escrow = await loadEscrow(escrowId);
  if (!escrow) return;

  const propertyTitle = escrow.property.title;

  await Promise.allSettled([
    notificationService.sendAll(['in_app', 'email'], {
      userId: escrow.tenantId,
      title: 'PaymentAgreement',
      body: `Your escrow for "${propertyTitle}" has been initiated. Complete payment to proceed.`,
      link: `/escrow/${escrowId}`,
      email: escrow.tenant.email ?? undefined,
    }),
    notificationService.sendAll(['in_app', 'email'], {
      userId: escrow.landlordId,
      title: 'PaymentAgreement',
      body: `A tenant has initiated escrow for "${propertyTitle}". You will be notified once payment is confirmed.`,
      link: `/landlord/escrow/${escrowId}`,
      email: escrow.landlord.email ?? undefined,
    }),
  ]);
}

export async function notifyCancelled(escrowId: string) {
  const escrow = await loadEscrow(escrowId);
  if (!escrow) return;

  const propertyTitle = escrow.property.title;

  await Promise.allSettled([
    notificationService.sendAll(['in_app', 'email'], {
      userId: escrow.tenantId,
      title: 'EscrowRefunded',
      body: `Your escrow for "${propertyTitle}" has been cancelled.`,
      link: `/escrow/${escrowId}`,
      email: escrow.tenant.email ?? undefined,
    }),
    notificationService.sendAll(['in_app'], {
      userId: escrow.landlordId,
      title: 'EscrowRefunded',
      body: `The escrow for "${propertyTitle}" has been cancelled.`,
      link: `/landlord/escrow/${escrowId}`,
    }),
  ]);
}

export async function notifyDocsVerified(escrowId: string) {
  const escrow = await loadEscrow(escrowId);
  if (!escrow) return;

  const propertyTitle = escrow.property.title;

  await Promise.allSettled([
    notificationService.sendAll(['in_app', 'email'], {
      userId: escrow.tenantId,
      title: 'DocumentsVerified',
      body: `Property documents for "${propertyTitle}" have been verified by our team.`,
      link: `/escrow/${escrowId}`,
      email: escrow.tenant.email ?? undefined,
    }),
    notificationService.sendAll(['in_app', 'email'], {
      userId: escrow.landlordId,
      title: 'DocumentsVerified',
      body: `Your documents for "${propertyTitle}" have been verified. Next step: key handover.`,
      link: `/landlord/escrow/${escrowId}`,
      email: escrow.landlord.email ?? undefined,
    }),
  ]);
}

export async function notifyHandoverPending(escrowId: string) {
  const escrow = await loadEscrow(escrowId);
  if (!escrow) return;

  const propertyTitle = escrow.property.title;

  await Promise.allSettled([
    notificationService.sendAll(['in_app', 'email'], {
      userId: escrow.tenantId,
      title: 'KeyHandoverPending',
      body: `Key handover for "${propertyTitle}" is ready. Please confirm handover when you receive the keys.`,
      link: `/escrow/${escrowId}`,
      email: escrow.tenant.email ?? undefined,
    }),
    notificationService.sendAll(['in_app', 'email'], {
      userId: escrow.landlordId,
      title: 'KeyHandoverPending',
      body: `Key handover for "${propertyTitle}" is now pending. The tenant has 48 hours to confirm.`,
      link: `/landlord/escrow/${escrowId}`,
      email: escrow.landlord.email ?? undefined,
    }),
  ]);
}

export async function notifyDisputeResolved(escrowId: string, outcome: 'completed' | 'refunded') {
  const escrow = await loadEscrow(escrowId);
  if (!escrow) return;

  const amount = formatKobo(escrow.amountKobo);
  const propertyTitle = escrow.property.title;

  if (outcome === 'completed') {
    await Promise.allSettled([
      notificationService.sendAll(['in_app', 'email'], {
        userId: escrow.tenantId,
        title: 'DisputeRaised',
        body: `The dispute for "${propertyTitle}" has been resolved in the landlord's favour. Funds of ${amount} have been released.`,
        link: `/escrow/${escrowId}`,
        email: escrow.tenant.email ?? undefined,
      }),
      notificationService.sendAll(['in_app', 'email'], {
        userId: escrow.landlordId,
        title: 'DisputeRaised',
        body: `The dispute for "${propertyTitle}" has been resolved in your favour. Funds of ${amount} have been released.`,
        link: `/landlord/escrow/${escrowId}`,
        email: escrow.landlord.email ?? undefined,
      }),
    ]);
  } else {
    await Promise.allSettled([
      notificationService.sendAll(['in_app', 'email'], {
        userId: escrow.tenantId,
        title: 'EscrowRefunded',
        body: `The dispute for "${propertyTitle}" has been resolved in your favour. ${amount} has been refunded.`,
        link: `/escrow/${escrowId}`,
        email: escrow.tenant.email ?? undefined,
      }),
      notificationService.sendAll(['in_app', 'email'], {
        userId: escrow.landlordId,
        title: 'EscrowRefunded',
        body: `The dispute for "${propertyTitle}" has been resolved in the tenant's favour. ${amount} has been refunded.`,
        link: `/landlord/escrow/${escrowId}`,
        email: escrow.landlord.email ?? undefined,
      }),
    ]);
  }
}
