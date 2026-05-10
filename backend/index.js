import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';

import path from 'path';

// Load env vars
dotenv.config();

// Connect DB
connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS Configuration
const corsOptions = {
    origin: [
        'https://bbci.co.in',
        'https://www.bbci.co.in',
        'http://localhost:3000',
        'http://localhost:8080'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS
app.use(cors(corsOptions));

// FIXED FOR EXPRESS 5
app.options(/.*/, cors(corsOptions));

// Default Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/banners', bannerRoutes);

// Static Upload Folder
const __dirname = path.resolve();

app.use(
    '/uploads',
    express.static(path.join(__dirname, 'uploads'))
);

// Port
const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
    console.log(
        `Server running in ${process.env.NODE_ENV || 'development'
        } mode on port ${PORT}`
    );
});