const setUserRole = async (userId, role) => {
  const response = await fetch(`${process.env.AUTH_SERVICE_URL}/api/users/${userId}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Api-Key': process.env.INTERNAL_API_KEY,
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    throw new Error(`auth-service role update failed with status ${response.status}`);
  }

  return response.json();
};

module.exports = { setUserRole };
