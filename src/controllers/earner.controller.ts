import { Request, Response } from 'express';
import { earnerService } from '../services/earner.service';

class EarnerController {
  /**
   * Get earner leaderboard (filtered by registered users only, with optional time filtering)
   */
  async getEarnerLeaderboard(req: Request, res: Response): Promise<Response> {
    try {
      const {
        limit = 100,
        offset = 0,
        orderBy = 'bondedAmount',
        orderDirection = 'desc',
        timePeriod,
        startDate,
        endDate
      } = req.query;

      // Validate parameters
      const validOrderBy = ['bondedAmount', 'lifetimeReward', 'delegatedAmount', 'periodRewards', 'periodBondingActivity'];
      const validOrderDirection = ['asc', 'desc'];
      const validTimePeriods = ['daily', 'weekly', 'monthly', 'custom'];

      if (!validOrderBy.includes(orderBy as string)) {
        return res.status(400).json({
          success: false,
          error: `Invalid orderBy parameter. Must be one of: ${validOrderBy.join(', ')}`
        });
      }

      if (!validOrderDirection.includes(orderDirection as string)) {
        return res.status(400).json({
          success: false,
          error: `Invalid orderDirection parameter. Must be one of: ${validOrderDirection.join(', ')}`
        });
      }

      // Validate time period if provided
      if (timePeriod && !validTimePeriods.includes(timePeriod as string)) {
        return res.status(400).json({
          success: false,
          error: `Invalid timePeriod parameter. Must be one of: ${validTimePeriods.join(', ')}`
        });
      }

      // Validate custom date range if using custom time period
      if (timePeriod === 'custom') {
        if (!startDate || !endDate) {
          return res.status(400).json({
            success: false,
            error: 'startDate and endDate are required for custom time period'
          });
        }

        const startDateTime = new Date(startDate as string);
        const endDateTime = new Date(endDate as string);

        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)'
          });
        }

        if (startDateTime >= endDateTime) {
          return res.status(400).json({
            success: false,
            error: 'startDate must be before endDate'
          });
        }

        // Limit custom range to 1 year
        const oneYearMs = 365 * 24 * 60 * 60 * 1000;
        if (endDateTime.getTime() - startDateTime.getTime() > oneYearMs) {
          return res.status(400).json({
            success: false,
            error: 'Custom date range cannot exceed 1 year'
          });
        }
      }

      const limitNum = parseInt(limit as string, 10);
      const offsetNum = parseInt(offset as string, 10);

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
        return res.status(400).json({
          success: false,
          error: 'Invalid limit parameter. Must be between 1 and 1000'
        });
      }

      if (isNaN(offsetNum) || offsetNum < 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid offset parameter. Must be 0 or greater'
        });
      }

      const result = await earnerService.getEarnerLeaderboard({
        limit: limitNum,
        offset: offsetNum,
        orderBy: orderBy as 'bondedAmount' | 'lifetimeReward' | 'delegatedAmount' | 'periodRewards' | 'periodBondingActivity',
        orderDirection: orderDirection as 'asc' | 'desc',
        timePeriod: timePeriod as 'daily' | 'weekly' | 'monthly' | 'custom',
        startDate: startDate as string,
        endDate: endDate as string
      });

      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        return res.status(404).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in getEarnerLeaderboard:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get top earners by recent rewards
   */
  async getTopEarnersByRewards(req: Request, res: Response): Promise<Response> {
    try {
      const { limit = 50 } = req.query;
      const limitNum = parseInt(limit as string, 10);

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          error: 'Invalid limit parameter. Must be between 1 and 100'
        });
      }

      const result = await earnerService.getTopEarnersByRewards(limitNum);

      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        return res.status(404).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in getTopEarnersByRewards:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get earner statistics
   */
  async getEarnerStats(req: Request, res: Response): Promise<Response> {
    try {
      const result = await earnerService.getEarnerStats();

      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        return res.status(404).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in getEarnerStats:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export const earnerController = new EarnerController();
