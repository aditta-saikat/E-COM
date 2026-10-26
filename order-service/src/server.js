require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');
const orderService = require('./services/order.service');
const logger = require('./config/logger');

const port = Number(process.env.PORT) || 3004;

const startServer = async () => {
	await connectDB();

	app.listen(port, () => {
		logger.info(`Order service listening on port ${port}`);
	});

	// Release stock held by orders whose customer never finished paying on a redirect gateway.
	setInterval(() => {
		orderService.expireStaleOrders().catch((error) => logger.error({ err: error }, 'Expiring stale orders failed'));
	}, 5 * 60 * 1000);
};

startServer().catch((error) => {
	logger.error({ err: error }, 'Unable to start order service');
	process.exit(1);
});
