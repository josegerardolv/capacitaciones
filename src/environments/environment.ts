export const environment = {
  production: false,
  apiUrl: 'http://192.168.1.204:3000',
  oauth: {
    clientId: 'client_Rrj33R_Ia1H9dOOGFKfxlC6IMnj2jOOflBF7ReLmfEA',
    redirectUri: 'http://localhost:4200/callback',
    scopes: ['read', 'write', 'admin'],
    authorizationUrl: 'http://localhost:3000/oauth/authorize',
    tokenUrl: 'http://192.168.1.204:3000/oauth/token',
    revokeUrl: 'http://192.168.1.204:3000/oauth/revoke',
    introspectUrl: 'http://192.168.1.204:3000/oauth/introspect'
  }
};
