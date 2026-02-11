export const environment = {
  production: false,
  apiUrl: 'https://capacitacion.p1.ws.semovi.dev',
  oauth: {
    clientId: 'client_Rrj33R_Ia1H9dOOGFKfxlC6IMnj2jOOflBF7ReLmfEA',
    redirectUri: 'http://localhost:4200/callback',
    scopes: ['read', 'write', 'admin'],
    authorizationUrl: 'https://capacitacion.p1.ws.semovi.dev/oauth/authorize',
    tokenUrl: 'https://capacitacion.p1.ws.semovi.dev/oauth/token',
    revokeUrl: 'https://capacitacion.p1.ws.semovi.dev/oauth/revoke',
    introspectUrl: 'https://capacitacion.p1.ws.semovi.dev/oauth/introspect'
  },
  useMockAuth: true
};
