import { Request, Response } from 'express';
import { adminValidatorService } from '../services/validator.service';
import { AdminRequest } from '../middleware/admin.middleware';

export class ValidatorController {
  async list(req: AdminRequest, res: Response) {
    const filters = {
      search: req.query.search as string,
      status: req.query.status as 'active'|'hidden',
      sortBy: req.query.sortBy as string,
      sortOrder: (req.query.sortOrder as 'asc'|'desc') || 'desc',
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };
    const result = await adminValidatorService.getAllValidators(filters);
    return res.status(result.success ? 200 : 400).json(result);
  }

  async getById(req: AdminRequest, res: Response) {
    const { id } = req.params;
    const result = await adminValidatorService.getValidatorById(id);
    return res.status(result.success ? 200 : 404).json(result);
  }

  async create(req: AdminRequest, res: Response) {
    const result = await adminValidatorService.createValidator(req.body);
    return res.status(result.success ? 201 : 400).json(result);
  }

  async update(req: AdminRequest, res: Response) {
    const { id } = req.params;
    const result = await adminValidatorService.updateValidator(id, req.body);
    return res.status(result.success ? 200 : 400).json(result);
  }

  async setStatus(req: AdminRequest, res: Response) {
    const { id } = req.params;
    const { isActive } = req.body;
    const result = await adminValidatorService.setValidatorStatus(id, !!isActive);
    return res.status(result.success ? 200 : 400).json(result);
  }
}

export const validatorController = new ValidatorController();
