import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'LISAR API',
    version: '1.0.0',
    description: 'API for fiat onramp, wallet management, and delegation for LISAR',
    contact: {
      name: 'LISAR Team',
      email: 'support@lisar.io'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Development server'
    },
    {
      url: 'https://api.lisar.io/v1',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token from Supabase authentication'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique user identifier',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'user@example.com'
          },
          email_confirmed_at: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'Email confirmation timestamp',
            example: '2023-09-27T10:30:00Z'
          },
          user_metadata: {
            type: 'object',
            properties: {
              full_name: {
                type: 'string',
                description: 'User full name',
                example: 'John Doe'
              },
              wallet_address: {
                type: 'string',
                description: 'Crypto wallet address',
                example: '0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6'
              }
            }
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'User creation timestamp',
            example: '2023-09-27T10:30:00Z'
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'User last update timestamp',
            example: '2023-09-27T10:30:00Z'
          },
          last_sign_in_at: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'Last sign in timestamp',
            example: '2023-09-27T10:30:00Z'
          }
        }
      },
      Session: {
        type: 'object',
        properties: {
          access_token: {
            type: 'string',
            description: 'JWT access token',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          refresh_token: {
            type: 'string',
            description: 'JWT refresh token',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          expires_in: {
            type: 'number',
            description: 'Token expiration time in seconds',
            example: 3600
          },
          expires_at: {
            type: 'number',
            description: 'Token expiration timestamp',
            example: 1695810600
          },
          token_type: {
            type: 'string',
            example: 'bearer'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'string',
            description: 'Error message',
            example: 'Invalid email format'
          }
        }
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            description: 'Success message',
            example: 'Operation completed successfully'
          }
        }
      }
    }
  }
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/admin/routes/*.ts'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
