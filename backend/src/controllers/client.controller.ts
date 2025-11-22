import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import clientService from '../services/client.service';
import { catchAsync } from '../utils/helpers';

class ClientController {
  create = catchAsync(async (req: AuthRequest, res: Response) => {
    const client = await clientService.create(req.body);
    res.status(201).json({
      status: 'success',
      data: client,
    });
  });

  findAll = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await clientService.findAll(req.query);
    res.json({
      status: 'success',
      ...result,
    });
  });

  findById = catchAsync(async (req: AuthRequest, res: Response) => {
    const client = await clientService.findById(req.params.id);
    res.json({
      status: 'success',
      data: client,
    });
  });

  update = catchAsync(async (req: AuthRequest, res: Response) => {
    const client = await clientService.update(req.params.id, req.body);
    res.json({
      status: 'success',
      data: client,
    });
  });

  delete = catchAsync(async (req: AuthRequest, res: Response) => {
    await clientService.delete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

  getStatistics = catchAsync(async (req: AuthRequest, res: Response) => {
    const statistics = await clientService.getStatistics();
    res.json({
      status: 'success',
      data: statistics,
    });
  });
}

export default new ClientController();

