import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import ruleService from '../services/rule.service';
import ruleEngineService from '../services/rule-engine.service';
import { catchAsync } from '../utils/helpers';

class RuleController {
  create = catchAsync(async (req: AuthRequest, res: Response) => {
    const rule = await ruleService.create(req.body);
    res.status(201).json({
      status: 'success',
      data: rule,
    });
  });

  findAll = catchAsync(async (req: AuthRequest, res: Response) => {
    const rules = await ruleService.findAll(req.query);
    res.json({
      status: 'success',
      data: rules,
    });
  });

  getTypes = catchAsync(async (req: Request, res: Response) => {
    const types = ['ELEGIBILIDAD', 'DESCUENTO', 'NOTIFICACION', 'PROGRAMACION'];
    res.json({
      status: 'success',
      data: types
    });
  });

  findById = catchAsync(async (req: AuthRequest, res: Response) => {
    const rule = await ruleService.findById(req.params.id);
    res.json({
      status: 'success',
      data: rule,
    });
  });

  update = catchAsync(async (req: AuthRequest, res: Response) => {
    const rule = await ruleService.update(req.params.id, req.body);
    res.json({
      status: 'success',
      data: rule,
    });
  });

  delete = catchAsync(async (req: AuthRequest, res: Response) => {
    await ruleService.delete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

  assignToPromotion = catchAsync(async (req: AuthRequest, res: Response) => {
    const { reglaId, promocionId } = req.body;
    const asignacion = await ruleService.assignToPromotion(reglaId, promocionId);
    res.status(201).json({
      status: 'success',
      data: asignacion,
    });
  });

  evaluateEligibility = catchAsync(async (req: AuthRequest, res: Response) => {
    const { clienteId, promocionId } = req.params;
    const esElegible = await ruleEngineService.evaluateEligibility(clienteId, promocionId);
    res.json({
      status: 'success',
      data: { esElegible },
    });
  });
}

export default new RuleController();

