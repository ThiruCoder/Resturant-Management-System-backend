import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongodb_uri = process.env.MONGODB_URI;

if (!mongodb_uri) {
    throw new Error('MongoDB URI not found in environment variables');
}

const DatabaseConnection = async () => {

    try {
        await mongoose.connect(mongodb_uri);
        console.log('MongoDB is connected successfully');

    } catch (error) {
        console.log(`MongoDB connection error ${error.message}`);
        process.exit(0);
    }
}

export { DatabaseConnection }