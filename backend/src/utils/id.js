export const generateCode = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
