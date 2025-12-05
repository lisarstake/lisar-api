import { Request, Response } from 'express';
import { blogService } from '../services/blog.service';
import { BlogPostQueryParams } from '../types/blog.types';

export class BlogController {
  /**
   * Get all published blog posts
   * GET /blog/posts
   * Query params: category?, tag?, search?, featured?, limit?, offset?
   */
  async getPosts(req: Request, res: Response): Promise<void> {
    try {
      const params: BlogPostQueryParams = {
        category: req.query.category as string,
        tag: req.query.tag as string,
        search: req.query.search as string,
        featured: req.query.featured === 'true',
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      };

      const result = await blogService.getPosts(params);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data,
        total: result.total,
        limit: params.limit || 10,
        offset: params.offset || 0
      });
    } catch (error) {
      console.error('Error in getPosts:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get a single published blog post by slug
   * GET /blog/posts/:slug
   */
  async getPostBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      if (!slug) {
        res.status(400).json({
          success: false,
          error: 'Slug is required'
        });
        return;
      }

      const result = await blogService.getPostBySlug(slug);

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
      console.error('Error in getPostBySlug:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get all blog categories
   * GET /blog/categories
   */
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const result = await blogService.getCategories();

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
}

export const blogController = new BlogController();
