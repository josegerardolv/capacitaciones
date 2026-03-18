export const environment = {
  production: true,
  apiUrl: 'https://capacitacion.p1.ws.semovi.dev',
  oauth: {
    clientId: 'client_Rrj33R_Ia1H9dOOGFKfxlC6IMnj2jOOflBF7ReLmfEA',
    redirectUri: 'https://qa.capa.semovi.dev/callback',
    scopes: ['read', 'write', 'admin'],
    authorizationUrl: 'https://capacitacion.p1.ws.semovi.dev/oauth/authorize',
    tokenUrl: 'https://capacitacion.p1.ws.semovi.dev/oauth/token',
    revokeUrl: 'https://capacitacion.p1.ws.semovi.dev/oauth/revoke',
    introspectUrl: 'https://capacitacion.p1.ws.semovi.dev/oauth/introspect'
  },
  app: {
    name: 'Capacitaciones SEMOVI',
    version: '0.8.0',
    description: 'Sistema de Capacitaciones para SEMOVI'
  }
};