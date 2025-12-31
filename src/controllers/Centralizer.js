import express from 'express';
import {
    GetUserDetails,
    CreateReservation,
    CancelReservation,
    GetTables,
    GetReservationData,
    UpdateReservation
} from './Divisions/customer.js';
import {
    GetReservationsByDate,
    DeleteReservationById,
    CreateTable,
    UpdateTable,
    GetAllReservations,
} from './Divisions/admin.js';
import { GetCurrentUser, LoginController, LogOutController, RegisterController } from './Authentication/RouterFunctions.js';
import { refreshTokenController } from '../middleware/refreshToken.js';
import { Is_Authenticated } from '../middleware/Is_Authenticated.js';
import { verifyTokenMiddleware } from '../utils/JWT_Utilities.js';


const centralizeRouter = express.Router();

// Authentication Routes
centralizeRouter.post('/register', RegisterController);
centralizeRouter.post('/login', LoginController);
centralizeRouter.get('/currentUser', GetCurrentUser);
centralizeRouter.post('/refresh', refreshTokenController);
centralizeRouter.get('/logout', LogOutController);
centralizeRouter.post('/isAuthenticated', Is_Authenticated);

// Customer Routes
centralizeRouter.get('/getUserDetails', verifyTokenMiddleware, GetUserDetails);
centralizeRouter.post('/createReservation', verifyTokenMiddleware, CreateReservation);
centralizeRouter.put('/updateReservation/:id', verifyTokenMiddleware, UpdateReservation);
centralizeRouter.delete('/cancelReservation/:id', verifyTokenMiddleware, CancelReservation);
centralizeRouter.get('/getTables', verifyTokenMiddleware, GetTables);
centralizeRouter.get('/getReservations', verifyTokenMiddleware, GetReservationData);

// Admin Routes
centralizeRouter.get('/getAllReservations', verifyTokenMiddleware, GetAllReservations);
centralizeRouter.get('/getReservationsByDate', verifyTokenMiddleware, GetReservationsByDate);
centralizeRouter.delete('/deleteReservationById', verifyTokenMiddleware, DeleteReservationById);

centralizeRouter.post('/createTable', verifyTokenMiddleware, CreateTable);
centralizeRouter.put('/updateTableById', verifyTokenMiddleware, UpdateTable);



export { centralizeRouter }