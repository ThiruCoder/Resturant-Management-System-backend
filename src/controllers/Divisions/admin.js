import { Reservation } from '../../models/ReservationModel.js';
import { Table } from '../../models/TableModel.js';
import mongoose from "mongoose";

const GetAllReservations = async (req, res, next) => {
    const { role } = req.user;

    try {
        if (role !== "admin") {
            return res.status(403).json({
                message: "Forbidden: Admins only",
                success: false
            });
        }

        const reservations = await Reservation.aggregate([
            {
                $lookup: {
                    from: "tables",
                    localField: "tableId",
                    foreignField: "_id",
                    as: "table"
                }
            },
            { $unwind: "$table" },

            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },

            {
                $project: {
                    date: 1,
                    startTime: 1,
                    endTime: 1,
                    guestCount: 1,
                    status: 1,
                    notes: 1,
                    "table.table_number": 1,
                    "table.capacity": 1,
                    "table.is_active": 1,
                    "user.username": 1,
                    "user.email": 1,
                    "user.role": 1
                }
            }
        ]);

        if (!reservations.length) {
            return res.status(200).json({
                data: [],
                message: "No reservations found",
                success: true
            });
        }

        return res.status(200).json({
            data: reservations,
            message: "Reservations fetched successfully",
            success: true
        });
    } catch (error) {
        next(error);
    }
};
const GetReservationsByDate = (req, res, next) => {
    try {
        console.log('Hi');

    } catch (error) {
        next(error)
    }
}
const UpdateReservationById = (req, res, next) => {
    try {
        console.log('Hi');

    } catch (error) {
        next(error)
    }
}
const DeleteReservationById = (req, res, next) => {
    try {
        console.log('Hi');

    } catch (error) {
        next(error)
    }
}
const CreateTable = async (req, res, next) => {
    const { table_number, capacity, is_active } = req.body;

    try {
        if (!table_number || capacity === undefined || is_active === undefined) {
            let error = new Error('All Table fields are required!');
            error.statusCode = 400;
            return next(error);
        }

        const tableNumber = Number(table_number);
        const tableCapacity = Number(capacity);
        const isActive = Boolean(is_active);

        const existingTable = await Table.findOne({ table_number: tableNumber });
        if (existingTable) {
            let error = new Error(`Table number ${tableNumber} already exists`);
            error.statusCode = 409;
            return next(error);
        }
        const tableExist = await Table.findOne({ table_number: tableNumber })
        if (tableExist) {
            return res.status(500).json({
                message: 'Table number is already existed.',
                success: false
            })
        }
        const table = await Table.create({
            table_number: tableNumber,
            capacity: tableCapacity,
            is_active: isActive
        });

        return res.status(201).json({
            message: 'Table created successfully',
            data: table,
            success: true
        });

    } catch (error) {
        console.log(error);

        next(error);
    }
};
const UpdateTable = (req, res, next) => {
    try {
        console.log('Hi');

    } catch (error) {
        next(error)
    }
}

export {
    GetReservationsByDate,
    UpdateReservationById,
    DeleteReservationById,
    CreateTable,
    UpdateTable,
    GetAllReservations
}