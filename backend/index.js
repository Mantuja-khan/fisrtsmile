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
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Global Preflight & CORS Override Layer
const allowedOrigins = [
    'https://toyhaat.com',
    'https://www.toyhaat.com',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (origin && origin.includes('toyhaat.com')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        // Fallback to a default explicit origin if origin is not set or unknown
        res.setHeader('Access-Control-Allow-Origin', 'https://toyhaat.com');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Dynamic CORS Configuration fallback
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || origin.includes('toyhaat.com')) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With']
};

// Apply CORS
app.use(cors(corsOptions));



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

import { fileURLToPath } from 'url';

// Derive current __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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