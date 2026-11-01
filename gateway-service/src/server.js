require('dotenv').config();

const app = require('./app');
const logger = require('./config/logger');

const port = Number(process.env.PORT) || 3000;

if (!process.env.JWT_SECRET) {
  logger.error('JWT_SECRET is not configured: the gateway cannot verify tokens without it');
  process.exit(1);
}

app.listen(port, () => {
  logger.info(`Gateway listening on port ${port}`);
});
