import { Request, Response } from 'express';
import { adminBlogService } from '../services/adminBlog.service';
import { AdminBlogQueryParams, CreateBlogPostPayload, UpdateBlogPostPayload, CreateCategoryPayload, UpdateCategoryPayload } from '../../types/blog.types';

export class AdminBlogController {
  /**
   * Get all blog posts with filtering (admin)
   * GET /admin/publications
   * Query params: page?, limit?, category?, tag?, search?, status?, featured?, sortBy?, sortOrder?
   */
  async getPosts(req: Request, res: Response): Promise<void> {
    try {
      console.log('=== AdminBlogController.getPosts DEBUG ===');
      console.log('Raw query params:', req.query);
      
      const params: AdminBlogQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        category: req.query.category as string,
        tag: req.query.tag as string,
        search: req.query.search as string,
        status: req.query.status as 'draft' | 'published' | 'archived',
        featured: req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      };

      console.log('Parsed params:', JSON.stringify(params, null, 2));

      const result = await adminBlogService.getPosts(params);

      console.log('Service result - success:', result.success, 'total:', result.total, 'data length:', result.data?.length);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error
        });
        return;
      }

      const page = params.page || 1;
      const limit = params.limit || 10;

      console.log('Response - page:', page, 'limit:', limit, 'total:', result.total);
      console.log('=== END CONTROLLER DEBUG ===');

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil((result.total || 0) / limit)
        }
      });
    } catch (error) {
      console.error('Error in getPosts (admin):', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get a single blog post by ID (admin)
   * GET /admin/publications/:id
   */
  async getPostById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Post ID is required'
        });
        return;
      }

      const result = await adminBlogService.getPostById(id);

      if (!result.success) {
        res.status(result.error === 'Post not found' ? 404 : 400).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Error in getPostById:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Create a new blog post (admin)
   * POST /admin/publications
   */
  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const payload: CreateBlogPostPayload = req.body;

      // Basic validation
      if (!payload.title || !payload.slug || !payload.excerpt || !payload.content || !payload.cover_image || !payload.category) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: title, slug, excerpt, content, cover_image, category'
        });
        return;
      }

      if (!payload.author || !payload.author.name) {
        res.status(400).json({
          success: false,
          error: 'Author name is required'
        });
        return;
      }

      const result = await adminBlogService.createPost(payload);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Blog post created successfully',
        data: result.data
      });
    } catch (error) {
      console.error('Error in createPost:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update an existing blog post (admin)
   * PUT /admin/publications/:id
   */
  async updatePost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payload: UpdateBlogPostPayload = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Post ID is required'
        });
        return;
      }

      // Validate author if provided
      if (payload.author && !payload.author.name) {
        res.status(400).json({
          success: false,
          error: 'Author name is required'
        });
        return;
      }

      const result = await adminBlogService.updatePost(id, payload);

      if (!result.success) {
        res.status(result.error === 'Post not found' ? 404 : 400).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        message: 'Blog post updated successfully',
        data: result.data
      });
    } catch (error) {
      console.error('Error in updatePost:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Delete a blog post (admin)
   * DELETE /admin/publications/:id
   */
  async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Post ID is required'
        });
        return;
      }

      const result = await adminBlogService.deletePost(id);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        message: 'Blog post deleted successfully'
      });
    } catch (error) {
      console.error('Error in deletePost:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get blog statistics (admin)
   * GET /admin/publications/stats
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const result = await adminBlogService.getStats();

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Error in getStats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get all categories (admin)
   * GET /admin/publications/categories
   */
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const result = await adminBlogService.getCategories();

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Error in getCategories:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Create a new category (admin)
   * POST /admin/publications/categories
   */
  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const payload: CreateCategoryPayload = req.body;

      if (!payload.name || !payload.slug) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: name, slug'
        });
        return;
      }

      const result = await adminBlogService.createCategory(payload);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: result.data
      });
    } catch (error) {
      console.error('Error in createCategory:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update a category (admin)
   * PUT /admin/publications/categories/:id
   */
  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payload: UpdateCategoryPayload = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Category ID is required'
        });
        return;
      }

      const result = await adminBlogService.updateCategory(id, payload);

      if (!result.success) {
        res.status(result.error === 'Category not found' ? 404 : 400).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: result.data
      });
    } catch (error) {
      console.error('Error in updateCategory:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Delete a category (admin)
   * DELETE /admin/publications/categories/:id
   */
  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Category ID is required'
        });
        return;
      }

      const result = await adminBlogService.deleteCategory(id);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export const adminBlogController = new AdminBlogController();
