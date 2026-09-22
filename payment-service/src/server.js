require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./config/logger');

const port = Number(process.env.PORT) || 3005;

const startServer = async () => {
	await connectDB();

	app.listen(port, () => {
		logger.info(`Payment service listening on port ${port}`);
	});
};

startServer().catch((error) => {
	logger.error({ err: error }, 'Unable to start payment service');
	process.exit(1);
});
