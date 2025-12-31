import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User Id is required'],
    },
    tableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
        required: [true, 'Table Id is required'],
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
    },
    startTime: {
        type: String,
        required: [true, 'Please add start time'],
    },
    endTime: {
        type: String,
        required: [true, 'Please add end time'],
    },
    guestCount: {
        type: Number,
        required: true,
        default: 1
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'completed'],
        default: 'confirmed'
    },
    notes: {
        type: String,
        default: ''
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

const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', ReservationSchema);

export { Reservation };

