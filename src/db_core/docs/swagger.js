

export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ClipSphere Core API Documentation',
      version: '1.0.0',
      description: 'ClipSphere - Short Video Social Platform [DB CORE MODULE]',
      contact: {
        name: 'Database Core Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token provided by the Auth server.',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/db_core/models/*.js', './src/db_core/validators/*.js'], 
};
