import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import dashboardService from '../services/dashboard.service';
import { catchAsync } from '../utils/helpers';

class DashboardController {
    getStats = catchAsync(async (req: AuthRequest, res: Response) => {
        const stats = await dashboardService.getStats();
        res.json({
            status: 'success',
            data: stats,
        });
    });
}

export default new DashboardController();
