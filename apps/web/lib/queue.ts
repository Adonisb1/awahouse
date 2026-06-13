import { Queue } from 'bullmq';
import IORedis from 'ioredis';

let connection: IORedis | null = null;

function getConnection(): IORedis | null {
  if (connection) return connection;

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
    return connection;
  }

  const host = process.env.REDIS_HOST;
  if (host) {
    connection = new IORedis({
      host,
      port: Number(process.env.REDIS_PORT ?? 6379),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
    });
    return connection;
  }

  return null;
}

let escrowQueue: Queue | null = null;
let rentQueue: Queue | null = null;

export function getEscrowQueue(): Queue | null {
  if (escrowQueue) return escrowQueue;
  const conn = getConnection();
  if (!conn) {
    console.warn('[queue] No Redis connection — escrow queue unavailable');
    return null;
  }
  escrowQueue = new Queue('escrow', { connection: conn });
  return escrowQueue;
}

export function getRentQueue(): Queue | null {
  if (rentQueue) return rentQueue;
  const conn = getConnection();
  if (!conn) {
    console.warn('[queue] No Redis connection — rent queue unavailable');
    return null;
  }
  rentQueue = new Queue('rent', { connection: conn });
  return rentQueue;
}
