import { getEscrowQueue, getRentQueue } from '@/lib/queue';

export async function scheduleEscrowJobs(escrowId: string) {
  const queue = getEscrowQueue();
  if (!queue) {
    console.warn('[scheduler] Escrow queue unavailable — skipping job scheduling');
    return;
  }

  const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

  await Promise.all([
    queue.add('auto-release', { escrowId }, {
      delay: FORTY_EIGHT_HOURS,
      jobId: `auto-release-${escrowId}`,
    }),
    queue.add('remind-handover', { escrowId, hoursRemaining: 24 }, {
      delay: FORTY_EIGHT_HOURS - 24 * 60 * 60 * 1000,
      jobId: `remind-24h-${escrowId}`,
    }),
    queue.add('remind-handover', { escrowId, hoursRemaining: 12 }, {
      delay: FORTY_EIGHT_HOURS - 36 * 60 * 60 * 1000,
      jobId: `remind-12h-${escrowId}`,
    }),
    queue.add('remind-handover', { escrowId, hoursRemaining: 2 }, {
      delay: FORTY_EIGHT_HOURS - 46 * 60 * 60 * 1000,
      jobId: `remind-2h-${escrowId}`,
    }),
  ]);

  console.log(`[scheduler] Escrow jobs scheduled for ${escrowId}`);
}

export async function scheduleInstalmentJobs(instalmentId: string, dueDate: Date) {
  const queue = getRentQueue();
  if (!queue) {
    console.warn('[scheduler] Rent queue unavailable — skipping instalment scheduling');
    return;
  }

  const delay = Math.max(0, dueDate.getTime() - Date.now());

  await queue.add('charge-instalment', { instalmentId }, {
    delay,
    jobId: `charge-instalment-${instalmentId}`,
  });

  console.log(`[scheduler] Instalment job scheduled for ${instalmentId} (delay: ${Math.round(delay / 3600000)}h)`);
}

export async function scheduleOverdueScan() {
  const queue = getRentQueue();
  if (!queue) {
    console.warn('[scheduler] Rent queue unavailable — skipping overdue scan scheduling');
    return;
  }

  await queue.add('scan-overdue', {}, {
    repeat: { every: 60 * 60 * 1000 },
    jobId: 'scan-overdue-recurring',
  });

  console.log('[scheduler] Overdue scan scheduled (every 60 minutes)');
}
