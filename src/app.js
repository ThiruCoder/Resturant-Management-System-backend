import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { DatabaseConnection } from './config/DatebaseConnection.js';
import { centralizeRouter } from './controllers/Centralizer.js';


const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
    origin: function (origin, callback) {

        const allowedOrigins = process.env.FRONTEND_URL ?? 'https://resturant-management-system-ruddy.vercel.app'

        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS not allowed for origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cookieParser());

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        status: 'error',
        success: false,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    })
})
// app.set('redisClient', getRedisClient());

app.get('/', async (req, res) => {
    const dbStatus = 'connected';

    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        services: {
            database: dbStatus,
            server: 'running',
            success: true
        }
    });
});

const startServer = async () => {
    try {

        await DatabaseConnection();

        // await connectRedis();

        app.use('/v1', centralizeRouter);

        app.use((req, res) => {
            res.status(404).json({
                error: 'Route not found!',
                success: false
            });
        });

        app.use((err, req, res, next) => {
            console.error('Error:', err.stack);
            res.status(500).json({
                message: 'Internal server error',
                success: false,
                ...(process.env.NODE_ENV === 'development' && { error: err.message })
            });
        });

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// process.on('SIGINT', async () => {
//     console.log('\nShutting down gracefully...');
//     const redisClient = getRedisClient();
//     if (redisClient.isOpen) {
//         await redisClient.quit();
//         console.log('Redis connection closed');
//     }
//     console.log('Server shutdown complete');
//     process.exit(0);
// });

startServer();