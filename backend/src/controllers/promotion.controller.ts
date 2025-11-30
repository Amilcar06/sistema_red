import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import promotionService from '../services/promotion.service';
import { catchAsync } from '../utils/helpers';

class PromotionController {
  create = catchAsync(async (req: AuthRequest, res: Response) => {
    const promotion = await promotionService.create(req.body);
    res.status(201).json({
      status: 'success',
      data: promotion,
    });
  });

  findAll = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await promotionService.findAll(req.query);
    res.json({
      status: 'success',
      ...result,
    });
  });

  findById = catchAsync(async (req: AuthRequest, res: Response) => {
    const promotion = await promotionService.findById(req.params.id);
    res.json({
      status: 'success',
      data: promotion,
    });
  });

  activate = catchAsync(async (req: AuthRequest, res: Response) => {
    const promotion = await promotionService.activate(req.params.id);
    res.json({
      status: 'success',
      data: promotion,
    });
  });

  pause = catchAsync(async (req: AuthRequest, res: Response) => {
    const promotion = await promotionService.pause(req.params.id);
    res.json({
      status: 'success',
      data: promotion,
    });
  });

  getStatistics = catchAsync(async (req: AuthRequest, res: Response) => {
    const statistics = await promotionService.getStatistics(req.params.id);
    res.json({
      status: 'success',
      data: statistics,
    });
  });

  update = catchAsync(async (req: AuthRequest, res: Response) => {
    const promotion = await promotionService.update(req.params.id, req.body);
    res.json({
      status: 'success',
      data: promotion,
    });
  });

  delete = catchAsync(async (req: AuthRequest, res: Response) => {
    await promotionService.delete(req.params.id);
    res.status(200).json({
      status: 'success',
      data: null,
    });
  });
}

export default new PromotionController();

