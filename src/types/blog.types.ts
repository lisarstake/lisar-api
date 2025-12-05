export interface BlogAuthor {
  name: string;
  avatar?: string;
  role?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // markdown
  author: BlogAuthor;
  cover_image: string;
  category: string;
  tags: string[];
  published_at?: string; // ISO 8601
  reading_time: number; // minutes
  featured?: boolean;
  status?: 'draft' | 'published' | 'archived';
  views?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  archivedPosts: number;
  featuredPosts: number;
  totalViews?: number;
}

// Query params for listing blog posts (public)
export interface BlogPostQueryParams {
  category?: string;
  tag?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

// Query params for admin publications listing
export interface AdminBlogQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
  status?: 'draft' | 'published' | 'archived';
  featured?: boolean;
  sortBy?: 'created_at' | 'updated_at' | 'published_at' | 'title' | 'views';
  sortOrder?: 'asc' | 'desc';
}

// Create/Update blog post payload
export interface CreateBlogPostPayload {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: BlogAuthor;
  cover_image: string;
  category: string;
  tags?: string[];
  published_at?: string;
  reading_time?: number;
  featured?: boolean;
  status?: 'draft' | 'published' | 'archived';
}

export interface UpdateBlogPostPayload extends Partial<CreateBlogPostPayload> {}

// Create/Update category payload
export interface CreateCategoryPayload {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> {}
