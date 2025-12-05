import { Router } from 'express';
import { adminBlogController } from '../controllers/adminBlog.controller';

const router = Router();

/**
 * @openapi
 * /admin/publications/stats:
 *   get:
 *     summary: Get blog statistics (admin)
 *     description: Retrieve statistics about blog posts
 *     tags:
 *       - Admin - Publications
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved statistics
 */
router.get('/stats', adminBlogController.getStats);

/**
 * @openapi
 * /admin/publications/categories:
 *   get:
 *     summary: Get all categories (admin)
 *     description: Retrieve all blog categories
 *     tags:
 *       - Admin - Publications
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved categories
 *   post:
 *     summary: Create a new category (admin)
 *     description: Create a new blog category
 *     tags:
 *       - Admin - Publications
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created successfully
 */
router.get('/categories', adminBlogController.getCategories);
router.post('/categories', adminBlogController.createCategory);

/**
 * @openapi
 * /admin/publications/categories/{id}:
 *   put:
 *     summary: Update a category (admin)
 *     description: Update an existing blog category
 *     tags:
 *       - Admin - Publications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully
 *   delete:
 *     summary: Delete a category (admin)
 *     description: Delete a blog category
 *     tags:
 *       - Admin - Publications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully
 */
router.put('/categories/:id', adminBlogController.updateCategory);
router.delete('/categories/:id', adminBlogController.deleteCategory);

/**
 * @openapi
 * /admin/publications:
 *   get:
 *     summary: Get all blog posts (admin)
 *     description: Retrieve blog posts with advanced filtering and pagination
 *     tags:
 *       - Admin - Publications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, updated_at, published_at, title, views]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Successfully retrieved blog posts
 *   post:
 *     summary: Create a new blog post (admin)
 *     description: Create a new blog post or draft
 *     tags:
 *       - Admin - Publications
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - slug
 *               - excerpt
 *               - content
 *               - cover_image
 *               - category
 *               - author
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               author:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   avatar:
 *                     type: string
 *                   role:
 *                     type: string
 *               cover_image:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               published_at:
 *                 type: string
 *                 format: date-time
 *               reading_time:
 *                 type: integer
 *               featured:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *     responses:
 *       201:
 *         description: Blog post created successfully
 */
router.get('/', adminBlogController.getPosts);
router.post('/', adminBlogController.createPost);

/**
 * @openapi
 * /admin/publications/{id}:
 *   get:
 *     summary: Get a blog post by ID (admin)
 *     description: Retrieve a single blog post including drafts
 *     tags:
 *       - Admin - Publications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved blog post
 *       404:
 *         description: Post not found
 *   put:
 *     summary: Update a blog post (admin)
 *     description: Update an existing blog post
 *     tags:
 *       - Admin - Publications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               author:
 *                 type: object
 *               cover_image:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               published_at:
 *                 type: string
 *               reading_time:
 *                 type: integer
 *               featured:
 *                 type: boolean
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Blog post updated successfully
 *   delete:
 *     summary: Delete a blog post (admin)
 *     description: Permanently delete a blog post
 *     tags:
 *       - Admin - Publications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog post deleted successfully
 */
router.get('/:id', adminBlogController.getPostById);
router.put('/:id', adminBlogController.updatePost);
router.delete('/:id', adminBlogController.deletePost);

export default router;
