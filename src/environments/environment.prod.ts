export const environment = {
  production: true,
  apiUrl: 'https://your-production-api-url.com',
  oauth: {
    clientId: 'your_production_client_id',
    redirectUri: 'https://your-production-url.com/auth/callback',
    scopes: ['read', 'write', 'admin', 'user_management'],
    authorizationUrl: 'https://your-production-api-url.com/oauth/authorize',
    tokenUrl: 'https://your-production-api-url.com/oauth/token',
    introspectUrl: 'https://your-production-api-url.com/oauth/introspect',
    revokeUrl: 'https://your-production-api-url.com/oauth/revoke'
  },
  app: {
    name: 'OAuth SEMOVI',
    version: '1.0.0',
    description: 'Sistema de Autenticación OAuth 2.0 para SEMOVI'
  }
};
