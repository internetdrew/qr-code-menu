export const generateQRFilePath = (menuId: number) => {
  return `menu/${menuId}/qr_${menuId}-${Date.now()}.png`;
};
