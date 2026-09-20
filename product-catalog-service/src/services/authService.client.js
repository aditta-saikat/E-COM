const logger = require('../config/logger');

const setUserRole = async (userId, role) => {
  logger.debug({ userId, role }, 'Calling auth-service to update user role');

  const response = await fetch(`${process.env.AUTH_SERVICE_URL}/api/users/${userId}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Api-Key': process.env.INTERNAL_API_KEY,
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    logger.error({ userId, role, status: response.status }, 'auth-service role update failed');
    throw new Error(`auth-service role update failed with status ${response.status}`);
  }

  logger.info({ userId, role }, 'auth-service role update succeeded');

  return response.json();
};

module.exports = { setUserRole };
