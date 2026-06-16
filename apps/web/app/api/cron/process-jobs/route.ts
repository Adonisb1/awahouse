import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@awahouse/db';
import {
  processAutoRelease,
  processRemindHandover,
  processInstalmentCharge,
  processScanOverdue,
} from '@/server/services/JobProcessorService';

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

async function hasLog(escrowId: string, reasonPrefix: string): Promise<boolean> {
  const existing = await prisma.transactionLog.findFirst({
    where: { escrowId, reason: { startsWith: reasonPrefix } },
  });
  return !!existing;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: string[] = [];
  const now = Date.now();

  // 1. Auto-release — escrows past 48h in key_handover_pending
  const autoReleaseCandidates = await prisma.escrowTransaction.findMany({
    where: {
      status: 'key_handover_pending',
      isDeleted: false,
      createdAt: { lte: new Date(now - FORTY_EIGHT_HOURS_MS) },
    },
    select: { id: true },
  });

  for (const escrow of autoReleaseCandidates) {
    const alreadyReleased = await hasLog(escrow.id, 'Auto-release');
    if (alreadyReleased) continue;
    try {
      await processAutoRelease(escrow.id);
      results.push(`auto-release:${escrow.id}`);
    } catch (err) {
      console.error(`[cron] Auto-release failed for ${escrow.id}:`, err);
      results.push(`auto-release:${escrow.id}:failed`);
    }
  }

  // 2. Reminders — escrows still in key_handover_pending near thresholds
  const reminderCandidates = await prisma.escrowTransaction.findMany({
    where: { status: 'key_handover_pending', isDeleted: false },
    select: { id: true, createdAt: true },
  });

  for (const escrow of reminderCandidates) {
    const elapsedHours = (now - escrow.createdAt.getTime()) / (60 * 60 * 1000);
    const remainingHours = 48 - elapsedHours;

    const reminderChecks: { thresholdHours: number; logPrefix: string }[] = [
      { thresholdHours: 24, logPrefix: '24h handover reminder' },
      { thresholdHours: 12, logPrefix: '12h handover reminder' },
      { thresholdHours: 2, logPrefix: '2h handover reminder' },
    ];

    for (const check of reminderChecks) {
      const lower = check.thresholdHours - 2;
      const upper = check.thresholdHours + 2;
      if (remainingHours >= lower && remainingHours <= upper) {
        const alreadySent = await hasLog(escrow.id, check.logPrefix);
        if (alreadySent) continue;
        const hoursInt = Math.round(remainingHours);
        try {
          await processRemindHandover(escrow.id, hoursInt);
          await prisma.transactionLog.create({
            data: {
              escrowId: escrow.id,
              fromStatus: 'key_handover_pending',
              toStatus: 'key_handover_pending',
              actorId: 'system',
              reason: `${check.logPrefix} (${hoursInt}h remaining)`,
            },
          });
          results.push(`reminder:${escrow.id}:${hoursInt}h`);
        } catch (err) {
          console.error(`[cron] Reminder failed for ${escrow.id}:`, err);
        }
      }
    }
  }

  // 3. Instalment charges — scheduled past due
  const dueInstalments = await prisma.rentInstalment.findMany({
    where: { status: 'scheduled', dueDate: { lte: new Date() } },
    select: { id: true },
  });

  for (const inst of dueInstalments) {
    try {
      await processInstalmentCharge(inst.id);
      results.push(`instalment-charge:${inst.id}`);
    } catch (err) {
      console.error(`[cron] Instalment charge failed for ${inst.id}:`, err);
      results.push(`instalment-charge:${inst.id}:failed`);
    }
  }

  // 4. Overdue scan
  try {
    await processScanOverdue();
    results.push('scan-overdue:ok');
  } catch (err) {
    console.error('[cron] Overdue scan failed:', err);
    results.push('scan-overdue:failed');
  }

  return NextResponse.json({ ok: true, processed: results.length, results });
}
