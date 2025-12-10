import { Redis } from 'ioredis'
import { PrismaClient } from '@prisma/client'

const QUEUE_KEY = 'wisher:queue'

export function startSyncWorker(redis: Redis, prisma: PrismaClient) {
  // Run a periodic drain of the queue
  setInterval(async () => {
    try {
      while (true) {
        const item = await redis.rpop(QUEUE_KEY)
        if (!item) break
        const parsed = JSON.parse(item)
        const { action, data } = parsed
        if (action === 'create') {
          await prisma.wish.create({ data: {
            id: data.id,
            name: data.name,
            item: data.item,
            price: data.price,
            bought: data.bought,
            boughtBy: data.boughtBy,
            revealDate: data.revealDate ? new Date(data.revealDate) : null
          }})
        } else if (action === 'update') {
          await prisma.wish.update({ where: { id: data.id }, data: {
            bought: data.bought,
            boughtBy: data.boughtBy
          }})
        }
      }
    } catch (err) {
      console.error('Sync worker error:', err)
    }
  }, 5000)
}
