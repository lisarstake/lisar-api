import { Request, Response } from 'express';
import { orchestratorService } from '../services/orchestrator.service';
import { GET_ALL_TRANSCODERS_QUERY } from '../queries/subgraph.queries';

export class OrchestratorController {
  async querySubgraph(req: Request, res: Response): Promise<void> {
    try {
      // Hardcoded to fetch all transcoders
      const data = await orchestratorService.fetchFromSubgraph(GET_ALL_TRANSCODERS_QUERY);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}

export const orchestratorController = new OrchestratorController();
