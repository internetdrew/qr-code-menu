export const generateQRFilePath = (placeId: string) => {
  return `place/${placeId}/qr_${placeId}-${Date.now()}.png`;
};
