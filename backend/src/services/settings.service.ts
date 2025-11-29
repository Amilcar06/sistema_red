import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SettingInput {
    clave: string;
    valor: any;
    categoria: string;
}

class SettingsService {
    async getAll() {
        const settings = await prisma.configuracionSistema.findMany({
            where: { activa: true }
        });

        // Convertir array a objeto agrupado por categoría o clave
        return settings.reduce((acc: any, curr) => {
            acc[curr.clave] = curr.valor;
            return acc;
        }, {});
    }

    async getByCategory(categoria: string) {
        const settings = await prisma.configuracionSistema.findMany({
            where: {
                categoria,
                activa: true
            }
        });

        return settings.reduce((acc: any, curr) => {
            acc[curr.clave] = curr.valor;
            return acc;
        }, {});
    }

    async update(clave: string, valor: any, categoria: string) {
        return await prisma.configuracionSistema.upsert({
            where: { clave },
            update: {
                valor,
                categoria, // Actualizar categoría si cambia
                activa: true
            },
            create: {
                clave,
                valor,
                categoria,
                activa: true
            }
        });
    }

    async bulkUpdate(settings: SettingInput[]) {
        const results = [];
        for (const setting of settings) {
            const result = await this.update(setting.clave, setting.valor, setting.categoria);
            results.push(result);
        }
        return results;
    }
}

export default new SettingsService();
