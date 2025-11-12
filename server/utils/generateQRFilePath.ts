export const generateQRFilePath = (restaurantId: string) => {
  return `restaurants/${restaurantId}/qr-${restaurantId}-${Date.now()}.png`;
};
