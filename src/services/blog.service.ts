import { supabase } from '../config/supabase';
import { BlogPost, BlogCategory, BlogPostQueryParams } from '../types/blog.types';

export class BlogService {
  /**
   * Get all published blog posts with optional filtering
   * Public endpoint - only returns published posts
   */
  async getPosts(params: BlogPostQueryParams): Promise<{ success: boolean; data?: BlogPost[]; total?: number; error?: string }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      // Apply filters
      if (params.category) {
        query = query.eq('category', params.category);
      }

      if (params.tag) {
        query = query.contains('tags', [params.tag]);
      }

      if (params.featured !== undefined) {
        query = query.eq('featured', params.featured);
      }

      if (params.search) {
        // Full-text search on title, excerpt, and content
        query = query.or(`title.ilike.%${params.search}%,excerpt.ilike.%${params.search}%,content.ilike.%${params.search}%`);
      }

      // Apply pagination
      const limit = params.limit || 10;
      const offset = params.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;
       console.log(data);
      if (error) {
        console.error('Error fetching blog posts:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: data as BlogPost[],
        total: count || 0
      };
    } catch (error) {
      console.error('Error in getPosts:', error);
      return { success: false, error: 'Failed to fetch blog posts' };
    }
  }

  /**
   * Get a single published blog post by slug
   * Public endpoint - only returns published posts
   */
  async getPostBySlug(slug: string): Promise<{ success: boolean; data?: BlogPost; error?: string }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Post not found' };
        }
        console.error('Error fetching blog post:', error);
        return { success: false, error: error.message };
      }

      // Increment view count asynchronously (don't wait for it)
      this.incrementViewCount(data.id).catch(err => 
        console.error('Failed to increment view count:', err)
      );

      return { success: true, data: data as BlogPost };
    } catch (error) {
      console.error('Error in getPostBySlug:', error);
      return { success: false, error: 'Failed to fetch blog post' };
    }
  }

  /**
   * Increment view count for a blog post
   */
  private async incrementViewCount(postId: string): Promise<void> {
    if (!supabase) return;

    try {
      // Get current views and increment
      const { data: post } = await supabase
        .from('blog_posts')
        .select('views')
        .eq('id', postId)
        .single();

      if (post) {
        await supabase
          .from('blog_posts')
          .update({ views: (post.views || 0) + 1 })
          .eq('id', postId);
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  /**
   * Get all blog categories
   * Public endpoint
   */
  async getCategories(): Promise<{ success: boolean; data?: BlogCategory[]; error?: string }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as BlogCategory[] };
    } catch (error) {
      console.error('Error in getCategories:', error);
      return { success: false, error: 'Failed to fetch categories' };
    }
  }
}

export const blogService = new BlogService();
