/**
 * Validation utilities
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidGameTitle = (title: string): boolean => {
  return title.length >= 1 && title.length <= 255;
};

export const isValidPrice = (price: number): boolean => {
  return price >= 0 && !isNaN(price);
};

export const isValidDiscount = (discount: number): boolean => {
  return discount >= 0 && discount <= 100 && !isNaN(discount);
};
