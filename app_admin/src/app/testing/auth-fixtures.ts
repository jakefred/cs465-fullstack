export const testUser = { email: 'module7@example.test', name: 'Module Seven' };

// UI tests only decode this fixture. API tests separately verify real signatures.
export function testToken(expiresIn = 3600, name = testUser.name): string {
  const payload = { ...testUser, name, exp: Math.floor(Date.now() / 1000) + expiresIn };
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const encoded = btoa(String.fromCharCode(...bytes)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `e30.${encoded}.test-signature`;
}

export const testTrip = {
  _id: 'test-trip-id', code: 'M7TEST', name: 'Test Trip', length: '4 nights',
  start: '2027-01-01T00:00:00.000Z', resort: 'Test Resort', perPerson: '1000',
  image: 'reef1.jpg', description: 'Test description'
};
