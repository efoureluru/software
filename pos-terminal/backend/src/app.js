const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Swagger Config
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ETHREE API',
            version: '1.0.0',
            description: 'API Documentation for ETHREE App',
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production'
                    ? 'https://your-production-url.vercel.app'
                    : 'http://localhost:5001',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: [path.join(__dirname, './routes/*.js'), path.join(__dirname, './models/*.js')],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/rides', require('./routes/rideRoutes'));
app.use('/restaurants', require('./routes/diningRoutes'));
app.use('/events', require('./routes/eventRoutes'));
app.use('/', require('./routes/bookingRoutes')); // Includes /bookings and /payments/demo
app.use('/users', require('./routes/userRoutes'));
app.use('/meta', require('./routes/metaRoutes'));

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to ETHREE API' });
});

module.exports = app;
