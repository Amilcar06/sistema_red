import { Request, Response, NextFunction } from 'express';
import settingsService from '../services/settings.service';

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { categoria } = req.query;

        let data;
        if (categoria && typeof categoria === 'string') {
            data = await settingsService.getByCategory(categoria);
        } else {
            data = await settingsService.getAll();
        }

        res.json({
            status: 'success',
            data
        });
    } catch (error) {
        next(error);
    }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const settings = req.body; // Espera un objeto { clave: valor } o array de objetos

        // Si es un array de configuraciones con categoría explícita
        if (Array.isArray(settings)) {
            const updated = await settingsService.bulkUpdate(settings);
            res.json({
                status: 'success',
                data: updated,
                message: 'Configuraciones actualizadas correctamente'
            });
            return;
        }

        // Si es un objeto simple, asumimos categoría 'general' por defecto si no se especifica
        // Pero para robustez, el frontend debería enviar array o estructura definida.
        // Vamos a soportar un formato { settings: [{ key, value, category }] }

        if (settings.settings && Array.isArray(settings.settings)) {
            const updated = await settingsService.bulkUpdate(settings.settings);
            res.json({
                status: 'success',
                data: updated,
                message: 'Configuraciones actualizadas correctamente'
            });
            return;
        }

        res.status(400).json({
            status: 'error',
            message: 'Formato de configuración inválido'
        });
    } catch (error) {
        next(error);
    }
};
