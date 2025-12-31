import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        minlength: [3, "Username must be at least 3 characters long"],
        maxlength: [30, "Username cannot exceed 30 characters"]
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters long'],
        default: null
    },
    isActive: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export { User };