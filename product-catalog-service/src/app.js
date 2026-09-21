const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const pinoHttp = require('pino-http');

const logger = require('./config/logger');
const productRoutes = require('./routes/product.routes');
const shopRoutes = require('./routes/shop.routes');

const app = express();

app.use(pinoHttp({
  logger,
  autoLogging: { ignore: (req) => req.url === '/health' },
}));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/shops', shopRoutes);

app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'ok',
		service: 'product-catalog-service',
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
