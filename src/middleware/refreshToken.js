// backend/controllers/refreshTokenController.js
import { signAccessToken, verifyRefreshToken } from "../utils/JWT_Utilities.js";
import { getRedisClient } from "../utils/Redis_client.js";

const refreshTokenController = async (req, res, next) => {
    try {
        // Try to get token from cookies first, then from body
        let refreshToken = req.cookies.refreshToken

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is required!"
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        if (!decoded || !decoded.userId || !decoded.deviceId) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        // Get Redis client with auto-reconnection
        const redisClient = await getRedisClient();

        // Check if token exists in Redis
        const redisKey = `refresh:${decoded.userId}:${decoded.deviceId}`;
        const storedToken = await redisClient.get(redisKey);

        if (!storedToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token expired or invalid"
            });
        }

        if (storedToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token has been revoked"
            });
        }

        // Generate new access token
        const newAccessToken = signAccessToken({
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            deviceId: decoded.deviceId
        });

        return res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            access_token: newAccessToken
        });

    } catch (error) {
        console.error('Refresh token error:', error);

        // Handle Redis connection errors specifically
        if (error.message.includes('closed') || error.message.includes('not open')) {
            return res.status(503).json({
                success: false,
                message: 'Authentication service temporarily unavailable. Please try again.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Refresh token expired'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        next(error);
    }
}

export { refreshTokenController }