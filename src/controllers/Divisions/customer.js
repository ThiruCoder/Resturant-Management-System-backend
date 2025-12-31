import { Reservation } from "../../models/ReservationModel.js";
import { Table } from "../../models/TableModel.js";
import mongoose from "mongoose";

const GetUserDetails = (req, res, next) => {
    try {
        console.log('Hi');

    } catch (error) {
        next(error)
    }
}

const CreateReservation = async (req, res, next) => {
    try {
        const { date, guestCount, tableId, notes, startTime, endTime } = req.body;
        const { userId } = req.user;
        try {

            if (!date || guestCount === undefined || !tableId || !startTime || !endTime) {
                let error = new Error('All Reservation fields are required!');
                error.statusCode = 404
                return next(error);
            }
            const table_number = tableId.split(' ')[1]
            const tableNumber = await Table.findOne({ table_number });

            const reservation = await Reservation.create({
                date, guestCount, notes, startTime, endTime,
                tableId: tableNumber._id, userId
            });
            return res.status(201).json({
                message: 'Reservation data is successfully created',
                data: reservation,
                success: true
            })
        } catch (error) {
            next(error)
        }


    } catch (error) {
        next(error)
    }
}

const UpdateReservation = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Reservation ID is required'
            });
        }

        const cleanPayload = Object.fromEntries(
            Object.entries(req.body).filter(([_, v]) => v !== undefined)
        );

        const updatedReservation = await Reservation.findByIdAndUpdate(
            id,
            { $set: cleanPayload },
            { new: true, runValidators: true }
        );

        if (!updatedReservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Reservation updated successfully',
            data: updatedReservation
        });

    } catch (error) {
        next(error);
    }
};



const GetReservationData = async (req, res, next) => {
    const { userId } = req.user;

    try {
        const reservations = await Reservation.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: 'tables',
                    localField: 'tableId',
                    foreignField: '_id',
                    as: 'table'
                }
            },
            {
                $unwind: '$table'
            },
            {
                $project: {
                    date: 1,
                    startTime: 1,
                    endTime: 1,
                    guestCount: 1,
                    status: 1,
                    notes: 1,
                    'table.table_number': 1,
                    'table.capacity': 1,
                    'table.is_active': 1
                }
            }
        ]);

        if (!reservations.length) {
            return res.status(404).json({
                message: 'No reservations found',
                success: false
            });
        }

        return res.status(200).json({
            data: reservations,
            message: 'Reservation data successfully fetched',
            success: true
        });

    } catch (error) {
        next(error);
    }

}

const CancelReservation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.user;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reservation ID'
            });
        }

        const query =
            role === 'admin'
                ? { _id: id }
                : { _id: id, userId };

        const reservation = await Reservation.findOneAndUpdate(
            query,
            {
                status: 'cancelled'
            },
            {
                new: true
            }
        );

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found or not authorized'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Reservation cancelled successfully',
            data: reservation
        });

    } catch (error) {
        next(error);
    }
};


const GetTables = async (req, res, next) => {
    try {
        const table = await Table.find({});
        if (!table) {
            let error = new Error('Table data is not found')
            error.statusCode = 404
            return next(error)
        }
        return res.status(200).json({
            data: table,
            message: 'Table data is successfully fetched',
            success: true
        })
    } catch (error) {
        next(error)
    }
}

export {
    GetUserDetails,
    CreateReservation,
    CancelReservation,
    GetTables,
    GetReservationData,
    UpdateReservation
}