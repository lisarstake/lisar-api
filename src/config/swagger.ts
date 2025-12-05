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
      },
      BlogAuthor: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Author name',
            example: 'LISAR Team'
          },
          avatar: {
            type: 'string',
            description: 'Author avatar URL',
            example: 'https://example.com/avatar.jpg',
            nullable: true
          },
          role: {
            type: 'string',
            description: 'Author role',
            example: 'Content Writer',
            nullable: true
          }
        },
        required: ['name']
      },
      BlogPost: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Blog post ID',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          title: {
            type: 'string',
            description: 'Blog post title',
            example: 'Getting Started with Livepeer Staking'
          },
          slug: {
            type: 'string',
            description: 'URL-friendly slug',
            example: 'getting-started-with-livepeer-staking'
          },
          excerpt: {
            type: 'string',
            description: 'Short summary of the post',
            example: 'Learn how to start staking LPT tokens and earn rewards'
          },
          content: {
            type: 'string',
            description: 'Full post content in markdown',
            example: '# Introduction\n\nThis is a comprehensive guide...'
          },
          author: {
            $ref: '#/components/schemas/BlogAuthor'
          },
          cover_image: {
            type: 'string',
            description: 'Cover image URL',
            example: 'https://example.com/cover.jpg'
          },
          category: {
            type: 'string',
            description: 'Post category',
            example: 'Tutorials'
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Post tags',
            example: ['staking', 'tutorial', 'defi']
          },
          published_at: {
            type: 'string',
            format: 'date-time',
            description: 'Publication timestamp',
            example: '2025-12-04T10:00:00Z',
            nullable: true
          },
          reading_time: {
            type: 'integer',
            description: 'Estimated reading time in minutes',
            example: 5
          },
          featured: {
            type: 'boolean',
            description: 'Whether post is featured',
            example: false
          },
          status: {
            type: 'string',
            enum: ['draft', 'published', 'archived'],
            description: 'Post status (admin only)',
            example: 'published'
          },
          views: {
            type: 'integer',
            description: 'View count',
            example: 1250
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
            example: '2025-12-04T09:00:00Z'
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
            example: '2025-12-04T09:30:00Z'
          }
        },
        required: ['title', 'slug', 'excerpt', 'content', 'author', 'cover_image', 'category']
      },
      BlogCategory: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Category ID',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          name: {
            type: 'string',
            description: 'Category name',
            example: 'Technology'
          },
          slug: {
            type: 'string',
            description: 'URL-friendly slug',
            example: 'technology'
          },
          description: {
            type: 'string',
            description: 'Category description',
            example: 'Latest tech trends and innovations',
            nullable: true
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            example: '2025-12-04T09:00:00Z'
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            example: '2025-12-04T09:00:00Z'
          }
        },
        required: ['name', 'slug']
      },
      BlogStats: {
        type: 'object',
        properties: {
          totalPosts: {
            type: 'integer',
            description: 'Total number of posts',
            example: 25
          },
          publishedPosts: {
            type: 'integer',
            description: 'Number of published posts',
            example: 20
          },
          draftPosts: {
            type: 'integer',
            description: 'Number of draft posts',
            example: 3
          },
          archivedPosts: {
            type: 'integer',
            description: 'Number of archived posts',
            example: 2
          },
          featuredPosts: {
            type: 'integer',
            description: 'Number of featured posts',
            example: 5
          },
          totalViews: {
            type: 'integer',
            description: 'Total views across all posts',
            example: 15000
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
