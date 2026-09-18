export const formatPrice = (minorUnits, currency) =>
  new Intl.NumberFormat('en-BD', { style: 'currency', currency }).format(minorUnits / 100)
