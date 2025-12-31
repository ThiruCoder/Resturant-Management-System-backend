import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SCRETE_KEY || '6953626eb228448751asd9f9917';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export const signAccessToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY
    });
};

// Sign refresh token
export const signRefreshToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY
    });
};

// Verify access token
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Middleware to verify access token
export const verifyTokenMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access token is required'
        });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired access token'
        });
    }

    req.user = decoded;
    next();
};