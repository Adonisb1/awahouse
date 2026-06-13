import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { processAutoRelease, processRemindHandover, processInstalmentCharge, processScanOverdue } from './processors';

const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST;

function createConnection(): IORedis | null {
  if (redisUrl) {
    return new IORedis(redisUrl, { maxRetriesPerRequest: null });
  }
  if (redisHost) {
    return new IORedis({
      host: redisHost,
      port: Number(process.env.REDIS_PORT ?? 6379),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
    });
  }
  return null;
}

const connection = createConnection();

if (!connection) {
  console.warn('[Worker] No Redis connection configured (REDIS_URL or REDIS_HOST). Workers not starting.');
  console.warn('[Worker] Set REDIS_URL or REDIS_HOST/REDIS_PORT/REDIS_PASSWORD to enable background jobs.');
  process.exit(0);
}

console.log('[Worker] Starting Awahouse workers...');

const escrowWorker = new Worker(
  'escrow',
  async (job) => {
    console.log(`[Worker] Processing escrow job: ${job.name} (${job.id})`);

    switch (job.name) {
      case 'auto-release': {
        const { escrowId } = job.data as { escrowId: string };
        await processAutoRelease(escrowId);
        break;
      }
      case 'remind-handover': {
        const { escrowId, hoursRemaining } = job.data as { escrowId: string; hoursRemaining: number };
        await processRemindHandover(escrowId, hoursRemaining);
        break;
      }
      default:
        console.log(`[Worker] Unknown escrow job: ${job.name}`);
    }
  },
  { connection },
);

const rentWorker = new Worker(
  'rent',
  async (job) => {
    console.log(`[Worker] Processing rent job: ${job.name} (${job.id})`);

    switch (job.name) {
      case 'charge-instalment': {
        const { instalmentId } = job.data as { instalmentId: string };
        await processInstalmentCharge(instalmentId);
        break;
      }
      case 'scan-overdue': {
        await processScanOverdue();
        break;
      }
      default:
        console.log(`[Worker] Unknown rent job: ${job.name}`);
    }
  },
  { connection },
);

console.log('[Worker] Workers registered. Waiting for jobs...');

process.on('SIGTERM', async () => {
  await escrowWorker.close();
  await rentWorker.close();
  process.exit(0);
});
