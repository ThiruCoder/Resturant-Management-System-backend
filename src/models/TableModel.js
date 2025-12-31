import mongoose from "mongoose";

const TableSchema = new mongoose.Schema({
    table_number: {
        type: Number,
        unique: true,
        required: [true, "Table number is required"],
    },
    capacity: {
        type: String,
        enum: [2, 4, 6, 8],
        default: 2
    },
    is_active: {
        type: Boolean,
        default: false
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

const Table = mongoose.models.Table || mongoose.model('Table', TableSchema);

export { Table };