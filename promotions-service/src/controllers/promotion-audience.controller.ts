import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import promotionService from '../services/promotion.service';
import { catchAsync } from '../utils/helpers';

class PromotionAudienceController {
    addClient = catchAsync(async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        const { clienteId } = req.body;

        if (!clienteId) {
            throw new Error('Cliente ID es requerido');
        }

        const result = await promotionService.addClient(id, clienteId);

        res.status(201).json({
            status: 'success',
            data: result,
            message: 'Cliente asignado correctamente',
        });
    });

    removeClient = catchAsync(async (req: AuthRequest, res: Response) => {
        const { id, clienteId } = req.params;

        await promotionService.removeClient(id, clienteId);

        res.status(200).json({
            status: 'success',
            data: null,
            message: 'Cliente removido correctamente',
        });
    });

    getAudience = catchAsync(async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        const audience = await promotionService.getAudience(id);

        res.json({
            status: 'success',
            data: audience,
        });
    });
}

export default new PromotionAudienceController();
