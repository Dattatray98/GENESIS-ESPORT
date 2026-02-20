import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import teamRoutes from './routes/teamRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/teams', teamRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('BGMI Tournament API is running...');
});

// Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('Global Error Handler:', err);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
        message: err.message || 'An internal server error occurred',
        error: process.env.NODE_ENV === 'development' ? (err.message || err) : 'Check server logs'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});