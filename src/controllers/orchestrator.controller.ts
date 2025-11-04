import { Request, Response } from 'express';
import { orchestratorService } from '../services/orchestrator.service';
import { GET_ALL_TRANSCODERS_QUERY } from '../queries/subgraph.queries';

export class OrchestratorController {
  async querySubgraph(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = '1',
        limit = '10',
        sortBy = 'apy',
        sortOrder = 'desc',
        minApy,
        maxApy,
        minStake,
        maxStake,
        active
      } = req.query;

      const queryParams = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        filters: {
          minApy: minApy ? parseFloat(minApy as string) : undefined,
          maxApy: maxApy ? parseFloat(maxApy as string) : undefined,
          minStake: minStake ? parseFloat(minStake as string) : undefined,
          maxStake: maxStake ? parseFloat(maxStake as string) : undefined,
          active: active ? active === 'true' : undefined
        }
      };

      const { data, total, page: currentPage, totalPages } = 
        await orchestratorService.fetchFromSubgraph(GET_ALL_TRANSCODERS_QUERY, queryParams);

      res.status(200).json({
        success: true,
        data,
        pagination: {
          total,
          page: currentPage,
          totalPages,
          limit: queryParams.limit
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Calculate APY for a single orchestrator
   * GET /orchestrator/:id/apy
   */
  async calculateApy(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, error: 'Orchestrator id is required' });
        return;
      }

      const { principle, timeHorizon, inflationChange, factors } = req.query;

      const options: any = {};
      if (principle) options.principle = Number(principle);
      if (timeHorizon) options.timeHorizon = String(timeHorizon);
      if (inflationChange) options.inflationChange = String(inflationChange);
      if (factors) options.factors = String(factors);

      const result = await orchestratorService.calculateApyFor(id, options);

      res.status(200).json({ success: true, ...result });
    } catch (error) {
      console.error('Calculate APY error:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}

export const orchestratorController = new OrchestratorController();
