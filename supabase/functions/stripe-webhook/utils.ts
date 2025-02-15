
export function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const tokenLength = 32;
  let token = '';
  
  const array = new Uint8Array(tokenLength);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < tokenLength; i++) {
    token += chars[array[i] % chars.length];
  }
  
  return token;
}
