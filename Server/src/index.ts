import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import teamRoutes from './routes/teamRoutes';
import authRoutes from './routes/authRoutes';
import seasonRoutes from './routes/seasonRoutes';
import matchRoutes from './routes/matchRoutes';

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
    credentials: true
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/matches', matchRoutes);
app.get('/api/debug-matches', (req, res) => res.json({ message: 'Matches route system is active' }));

app.use('/api/teams', teamRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/seasons', seasonRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('BGMI Tournament API is running...');
});

// Catch-all for 404s
app.use((req, res, next) => {
    console.log(`[404] ${req.method} ${req.url} - Request not found`);
    res.status(404).json({ message: `Route ${req.method} ${req.url} not found on this server` });
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