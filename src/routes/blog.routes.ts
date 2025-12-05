import { Router } from 'express';
import { blogController } from '../controllers/blog.controller';

const router = Router();

/**
 * @openapi
 * /blog/posts:
 *   get:
 *     summary: Get all published blog posts
 *     description: Retrieve a list of published blog posts with optional filtering
 *     tags:
 *       - Blog
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, excerpt, and content
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter by featured posts
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of posts to skip
 *     responses:
 *       200:
 *         description: Successfully retrieved blog posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BlogPost'
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 */
router.get('/posts', blogController.getPosts);

/**
 * @openapi
 * /blog/posts/{slug}:
 *   get:
 *     summary: Get a blog post by slug
 *     description: Retrieve a single published blog post by its slug
 *     tags:
 *       - Blog
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The slug of the blog post
 *     responses:
 *       200:
 *         description: Successfully retrieved blog post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BlogPost'
 *       404:
 *         description: Post not found
 */
router.get('/posts/:slug', blogController.getPostBySlug);

/**
 * @openapi
 * /blog/categories:
 *   get:
 *     summary: Get all blog categories
 *     description: Retrieve a list of all blog categories
 *     tags:
 *       - Blog
 *     responses:
 *       200:
 *         description: Successfully retrieved categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BlogCategory'
 */
router.get('/categories', blogController.getCategories);

export default router;
