import { Worker } from 'bullmq';

const connection = {
  host: process.env.UPSTASH_REDIS_REST_URL ?? 'localhost',
  port: 6379,
};

console.log('[Worker] Starting Awahouse workers...');

const escrowWorker = new Worker(
  'escrow',
  async (job) => {
    console.log(`[Worker] Processing escrow job: ${job.name} (${job.id})`);
  },
  { connection },
);

const rentWorker = new Worker(
  'rent',
  async (job) => {
    console.log(`[Worker] Processing rent job: ${job.name} (${job.id})`);
  },
  { connection },
);

console.log('[Worker] Workers registered. Waiting for jobs...');

process.on('SIGTERM', async () => {
  await escrowWorker.close();
  await rentWorker.close();
  process.exit(0);
});
