const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const pinoHttp = require('pino-http');

const logger = require('./config/logger');
const orderRoutes = require('./routes/order.routes');

const app = express();

app.use(pinoHttp({
  logger,
  autoLogging: { ignore: (req) => req.url === '/health' },
}));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/orders', orderRoutes);

app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'ok',
		service: 'order-service',
	});
});

app.use((req, res) => {
	res.status(404).json({ error: 'Route not found' });
});

app.use((error, req, res, next) => {
	req.log.error({ err: error }, 'Unhandled error');
	res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
