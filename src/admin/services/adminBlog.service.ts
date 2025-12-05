import { supabase } from '../../config/supabase';
import {
  BlogPost,
  BlogCategory,
  BlogStats,
  AdminBlogQueryParams,
  CreateBlogPostPayload,
  UpdateBlogPostPayload,
  CreateCategoryPayload,
  UpdateCategoryPayload
} from '../../types/blog.types';

export class AdminBlogService {
  /**
   * Get all blog posts with advanced filtering and pagination (admin)
   */
  async getPosts(params: AdminBlogQueryParams): Promise<{ success: boolean; data?: BlogPost[]; total?: number; error?: string }> {
    try {
      console.log('=== AdminBlogService.getPosts DEBUG ===');
      console.log('Input params:', JSON.stringify(params, null, 2));
      
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' });

      // Apply filters
      if (params.status) {
        console.log('Applying status filter:', params.status);
        query = query.eq('status', params.status);
      }

      if (params.category) {
        console.log('Applying category filter:', params.category);
        query = query.eq('category', params.category);
      }

      if (params.tag) {
        console.log('Applying tag filter:', params.tag);
        query = query.contains('tags', [params.tag]);
      }

      if (params.featured !== undefined) {
        console.log('Applying featured filter:', params.featured);
        query = query.eq('featured', params.featured);
      }

      if (params.search) {
        console.log('Applying search filter:', params.search);
        query = query.or(`title.ilike.%${params.search}%,excerpt.ilike.%${params.search}%,content.ilike.%${params.search}%`);
      }

      // Apply sorting
      const sortBy = params.sortBy || 'created_at';
      const sortOrder = params.sortOrder || 'desc';
      console.log('Sorting by:', sortBy, 'order:', sortOrder);
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 10;
      const offset = (page - 1) * limit;
      console.log('Pagination - page:', page, 'limit:', limit, 'offset:', offset);
      console.log('Range will be:', offset, 'to', offset + limit - 1);
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      console.log('Query result - count:', count, 'data length:', data?.length);
      console.log('Data:', JSON.stringify(data, null, 2));

      if (error) {
        console.error('Error fetching blog posts (admin):', error);
        return { success: false, error: error.message };
      }

      console.log('=== END DEBUG ===');
      return {
        success: true,
        data: data as BlogPost[],
        total: count || 0
      };
    } catch (error) {
      console.error('Error in getPosts (admin):', error);
      return { success: false, error: 'Failed to fetch blog posts' };
    }
  }

  /**
   * Get a single blog post by ID (admin)
   */
  async getPostById(id: string): Promise<{ success: boolean; data?: BlogPost; error?: string }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Post not found' };
        }
        console.error('Error fetching blog post:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as BlogPost };
    } catch (error) {
      console.error('Error in getPostById:', error);
      return { success: false, error: 'Failed to fetch blog post' };
    }
  }

  /**
   * Create a new blog post (admin)
   */
  async createPost(payload: CreateBlogPostPayload): Promise<{ success: boolean; data?: BlogPost; error?: string }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      // Check if slug already exists
      const { data: existing } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', payload.slug)
        .single();

      if (existing) {
        return { success: false, error: 'A post with this slug already exists' };
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          title: payload.title,
          slug: payload.slug,
          excerpt: payload.excerpt,
          content: payload.content,
          author: payload.author,
          cover_image: payload.cover_image,
          category: payload.category,
          tags: payload.tags || [],
          published_at: payload.published_at || null,
          reading_time: payload.reading_time || 5,
          featured: payload.featured || false,
          status: payload.status || 'draft'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating blog post:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as BlogPost };
    } catch (error) {
      console.error('Error in createPost:', error);
      return { success: false, error: 'Failed to create blog post' };
    }
  }

  /**
   * Update an existing blog post (admin)
   */
  async updatePost(id: string, payload: UpdateBlogPostPayload): Promise<{ success: boolean; data?: BlogPost; error?: string }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      // Check if post exists
      const { data: existing } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('id', id)
        .single();

      if (!existing) {
        return { success: false, error: 'Post not found' };
      }

      // If slug is being updated, check for duplicates
      if (payload.slug) {
        const { data: slugExists } = await supabase
          .from('blog_posts')
          .select('id')
          .eq('slug', payload.slug)
          .neq('id', id)
          .single();

        if (slugExists) {
          return { success: false, error: 'A post with this slug already exists' };
        }
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating blog post:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as BlogPost };
    } catch (error) {
      console.error('Error in updatePost:', error);
      return { success: false, error: 'Failed to update blog post' };
    }
  }

  /**
   * Delete a blog post (admin)
   */
  async deletePost(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting blog post:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deletePost:', error);
      return { success: false, error: 'Failed to delete blog post' };
    }
  }

  /**
   * Get blog statistics (admin)
   */
  async getStats(): Promise<{ success: boolean; data?: BlogStats; error?: string }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      // Get total posts
      const { count: totalPosts } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true });

      // Get published posts
      const { count: publishedPosts } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      // Get draft posts
      const { count: draftPosts } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft');

      // Get archived posts
      const { count: archivedPosts } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'archived');

      // Get featured posts
      const { count: featuredPosts } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('featured', true);

      // Get total views
      const { data: viewsData } = await supabase
        .from('blog_posts')
        .select('views');

      const totalViews = viewsData?.reduce((sum, post) => sum + (post.views || 0), 0) || 0;

      return {
        success: true,
        data: {
          totalPosts: totalPosts || 0,
          publishedPosts: publishedPosts || 0,
          draftPosts: draftPosts || 0,
          archivedPosts: archivedPosts || 0,
          featuredPosts: featuredPosts || 0,
          totalViews
        }
      };
    } catch (error) {
      console.error('Error in getStats:', error);
      return { success: false, error: 'Failed to fetch blog statistics' };
    }
  }

  /**
   * Get all categories (admin)
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

  /**
   * Create a new category (admin)
   */
  async createCategory(payload: CreateCategoryPayload): Promise<{ success: boolean; data?: BlogCategory; error?: string }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      // Check if slug already exists
      const { data: existing } = await supabase
        .from('blog_categories')
        .select('id')
        .eq('slug', payload.slug)
        .single();

      if (existing) {
        return { success: false, error: 'A category with this slug already exists' };
      }

      const { data, error } = await supabase
        .from('blog_categories')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as BlogCategory };
    } catch (error) {
      console.error('Error in createCategory:', error);
      return { success: false, error: 'Failed to create category' };
    }
  }

  /**
   * Update a category (admin)
   */
  async updateCategory(id: string, payload: UpdateCategoryPayload): Promise<{ success: boolean; data?: BlogCategory; error?: string }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      // Check if category exists
      const { data: existing } = await supabase
        .from('blog_categories')
        .select('id')
        .eq('id', id)
        .single();

      if (!existing) {
        return { success: false, error: 'Category not found' };
      }

      // If slug is being updated, check for duplicates
      if (payload.slug) {
        const { data: slugExists } = await supabase
          .from('blog_categories')
          .select('id')
          .eq('slug', payload.slug)
          .neq('id', id)
          .single();

        if (slugExists) {
          return { success: false, error: 'A category with this slug already exists' };
        }
      }

      const { data, error } = await supabase
        .from('blog_categories')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating category:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as BlogCategory };
    } catch (error) {
      console.error('Error in updateCategory:', error);
      return { success: false, error: 'Failed to update category' };
    }
  }

  /**
   * Delete a category (admin)
   */
  async deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      const { error } = await supabase
        .from('blog_categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting category:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      return { success: false, error: 'Failed to delete category' };
    }
  }
}

export const adminBlogService = new AdminBlogService();
