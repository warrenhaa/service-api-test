import Redis from 'ioredis';

const redisClient = new Redis(process.env.REDIS_PORT, process.env.REDIS_HOST); // 192.168.1.1:6379
export default redisClient;
