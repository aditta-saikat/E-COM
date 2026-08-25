const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

const userRoutes = require('./routes/user.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'ok',
		service: 'auth-service',
	});
});

app.use((req, res) => {
	res.status(404).json({ error: 'Route not found' });
});

app.use((error, req, res, next) => {
	console.error(error);
	res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
