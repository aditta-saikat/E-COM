require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');

const port = Number(process.env.PORT) || 3001;

const startServer = async () => {
	await connectDB();

	app.listen(port, () => {
		console.log(`Auth service listening on port ${port}`);
	});
};

startServer().catch((error) => {
	console.error('Unable to start auth service:', error.message);
	process.exit(1);
});
