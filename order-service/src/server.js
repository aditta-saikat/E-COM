require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./config/logger');

const port = Number(process.env.PORT) || 3004;

const startServer = async () => {
	await connectDB();

	app.listen(port, () => {
		logger.info(`Order service listening on port ${port}`);
	});
};

startServer().catch((error) => {
	logger.error({ err: error }, 'Unable to start order service');
	process.exit(1);
});
