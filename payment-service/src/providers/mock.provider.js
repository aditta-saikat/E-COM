const charge = async ({ amount, currency }) => {
  if (!amount || amount <= 0) {
    return { status: 'failed', providerReference: '', failureReason: 'Invalid amount' };
  }

  const providerReference = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  return { status: 'succeeded', providerReference, failureReason: '' };
};

module.exports = { charge };
