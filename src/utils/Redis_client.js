import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

const redisConfig = {
    url: `redis://:${REDIS_PASSWORD}@redis-14843.c246.us-east-1-4.ec2.cloud.redislabs.com:14843`,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.log('Too many retries on Redis. Connection terminated');
                return new Error('Too many retries');
            }
            return Math.min(retries * 100, 3000);
        },
        keepAlive: 5000
    }
};

// Create the client
let redisClient = null;
let isConnecting = false;

const createRedisClient = () => {
    const client = createClient(redisConfig);

    client.on('error', (err) => {
        console.error('Redis Error:', err.message);
    });

    client.on('connect', () => {
        console.log('🔗 Connecting to Redis...');
        isConnecting = true;
    });

    client.on('ready', () => {
        console.log('✅ Redis connected successfully');
        isConnecting = false;
    });

    client.on('end', () => {
        console.log('Redis connection ended');
        isConnecting = false;
    });

    return client;
};

// Initialize the client
redisClient = createRedisClient();

// Connection function with better error handling
export const connectRedis = async () => {
    try {
        if (!redisClient.isOpen && !isConnecting) {
            console.log('Attempting to connect to Redis...');
            await redisClient.connect();
            console.log('✅ Redis connection established');

            // Test the connection
            try {
                const testKey = 'connection:test:' + Date.now();
                await redisClient.set(testKey, 'Redis is working!', { EX: 60 });
                const testResult = await redisClient.get(testKey);
                console.log('Redis test successful:', testResult);
                await redisClient.del(testKey);
            } catch (testError) {
                console.log('Redis test failed but connection is open:', testError.message);
            }

            return true;
        }
        return true;
    } catch (error) {
        console.error('❌ Redis connection failed:', error.message);
        return false;
    }
};

// Modified getRedisClient to handle reconnection
export const getRedisClient = async () => {
    try {
        if (!redisClient.isOpen) {
            console.log('⚠️ Redis client not open, attempting to reconnect...');
            await connectRedis();
        }
        return redisClient;
    } catch (error) {
        console.error('Failed to get Redis client:', error.message);
        throw error;
    }
};

export const checkRedisHealth = async () => {
    try {
        const client = await getRedisClient();
        await client.ping();
        return { healthy: true, message: 'Redis is healthy' };
    } catch (error) {
        return { healthy: false, message: error.message };
    }
};

// Auto-reconnect
setInterval(async () => {
    try {
        if (!redisClient.isOpen && !isConnecting) {
            console.log('🔄 Auto-reconnecting to Redis...');
            await connectRedis();
        }
    } catch (error) {
        console.error('Auto-reconnect failed:', error.message);
    }
}, 30000);

// Graceful shutdown
process.on('SIGTERM', () => {
    if (redisClient.isOpen) {
        redisClient.quit();
    }
});

process.on('SIGINT', () => {
    if (redisClient.isOpen) {
        redisClient.quit();
    }
});

export default redisClient;