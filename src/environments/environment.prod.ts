export const environment = {
  production: true,
  apiUrl: 'https://api.dev.capa.semovi.dev',
  oauth: {
    clientId: 'client_Rrj33R_Ia1H9dOOGFKfxlC6IMnj2jOOflBF7ReLmfEA',
    redirectUri: 'https://dev.capa.semovi.dev/callback',
    scopes: ['read', 'write', 'admin'],
    authorizationUrl: 'https://api.dev.capa.semovi.dev/oauth/authorize',
    tokenUrl: 'https://api.dev.capa.semovi.dev/oauth/token',
    revokeUrl: 'https://api.dev.capa.semovi.dev/oauth/revoke',
    introspectUrl: 'https://api.dev.capa.semovi.dev/oauth/introspect'
  },
  app: {
    name: 'Capacitaciones SEMOVI',
    version: '0.8.5',
    description: 'Sistema de Capacitaciones para SEMOVI'
  }
};