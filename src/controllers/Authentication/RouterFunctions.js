import bcrypt from 'bcryptjs';
import { User } from '../../models/UserModel.js'
import redisClient from '../../utils/Redis_client.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/JWT_Utilities.js';

const RegisterController = async (req, res, next) => {
    try {
        const { email, password, fullName, deviceId } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required!'
            });
        }

        const isEmailExist = await User.findOne({ email });
        if (isEmailExist) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists!'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            email,
            password: hashPassword,
            username: fullName,
            role: 'user',
            isActive: true
        });

        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            deviceId
        };

        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        await redisClient.set(
            `refresh:${user._id}:${deviceId}`,
            refreshToken,
            { EX: 7 * 24 * 60 * 60 }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const userResponse = {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt
        };

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: userResponse,
            access_token: accessToken,
            refresh_token: refreshToken
        });

    } catch (error) {
        console.error('Registration error:', error);
        next(error);
    }
}

const LoginController = async (req, res, next) => {
    try {
        const { email, password, deviceId } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required!'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        user.lastLogin = new Date();
        await user.save();

        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            deviceId
        };

        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        await redisClient.set(
            `refresh:${user._id}:${deviceId}`,
            refreshToken,
            { EX: 7 * 24 * 60 * 60 }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const userResponse = {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
            isActive: user.isActive,
            lastLogin: user.lastLogin
        };

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: userResponse,
            access_token: accessToken,
            refresh_token: refreshToken
        });

    } catch (error) {
        console.error('Login error:', error);
        next(error);
    }
}

const LogOutController = async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(204).json({
            message: "Successfully logged out!",
            success: false
        })
    }
    try {
        const decode = verifyRefreshToken(refreshToken);
        await redisClient.del(`refresh:${decode.userId}:${decode.deviceId}`);
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none'
        });
        return res.status(204).json({
            message: "Successfully logged out!",
            success: false
        })
    } catch (error) {
        next(error)
    }
}


const GetCurrentUser = async (req, res, next) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Get current user error:', error);
        next(error);
    }
}

export { RegisterController, LoginController, GetCurrentUser, LogOutController }