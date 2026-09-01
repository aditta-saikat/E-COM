require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');

const port = Number(process.env.PORT) || 3002;

const startServer = async () => {
	await connectDB();

	app.listen(port, () => {
		console.log(`Product catalog service listening on port ${port}`);
	});
};

startServer().catch((error) => {
	console.error('Unable to start product catalog service:', error.message);
	process.exit(1);
});
