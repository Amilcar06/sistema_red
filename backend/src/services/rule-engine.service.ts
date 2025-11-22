import prisma from '../config/database';
import { AppError } from '../utils/errors';

interface RuleCondition {
  field: string;
  operator: 'equals' | 'greaterThan' | 'lessThan' | 'contains' | 'in';
  value: any;
}

interface RuleAction {
  type: 'applyDiscount' | 'sendNotification' | 'schedulePromotion';
  params: any;
}

class RuleEngineService {
  /**
   * Evalúa si un cliente es elegible para una promoción
   */
  async evaluateEligibility(
    clienteId: string,
    promocionId: string
  ): Promise<boolean> {
    const promocion = await prisma.promocion.findUnique({
      where: { id: promocionId },
      include: {
        reglas: {
          include: {
            regla: true,
          },
        },
      },
    });

    if (!promocion) {
      throw new AppError('Promoción no encontrada', 404);
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      throw new AppError('Cliente no encontrado', 404);
    }

    // Si no hay reglas, todos son elegibles
    if (promocion.reglas.length === 0) {
      return true;
    }

    // Evaluar cada regla
    for (const promocionRegla of promocion.reglas) {
      const regla = promocionRegla.regla;

      if (!regla.activa) continue;

      const condiciones = regla.condiciones as unknown as RuleCondition[];

      // Evaluar condiciones
      const isEligible = this.evaluateConditions(condiciones, cliente);

      if (!isEligible) {
        return false; // Si alguna regla falla, no es elegible
      }
    }

    return true;
  }

  /**
   * Evalúa condiciones de una regla
   */
  private evaluateConditions(
    condiciones: RuleCondition[],
    cliente: any
  ): boolean {
    for (const condicion of condiciones) {
      const valorCampo = this.getFieldValue(cliente, condicion.field);
      const resultado = this.compareValues(
        valorCampo,
        condicion.operator,
        condicion.value
      );

      if (!resultado) {
        return false;
      }
    }

    return true;
  }

  /**
   * Obtiene el valor de un campo del cliente
   */
  private getFieldValue(cliente: any, campo: string): any {
    const campos = campo.split('.');
    let valor = cliente;

    for (const f of campos) {
      valor = valor?.[f];
    }

    return valor;
  }

  /**
   * Compara valores según el operador
   */
  private compareValues(
    valorCampo: any,
    operador: string,
    valorEsperado: any
  ): boolean {
    switch (operador) {
      case 'equals':
        return valorCampo === valorEsperado;
      case 'greaterThan':
        return valorCampo > valorEsperado;
      case 'lessThan':
        return valorCampo < valorEsperado;
      case 'contains':
        return String(valorCampo).includes(String(valorEsperado));
      case 'in':
        return Array.isArray(valorEsperado) && valorEsperado.includes(valorCampo);
      default:
        return false;
    }
  }

  /**
   * Ejecuta acciones de una regla
   */
  async executeActions(ruleId: string, context: any) {
    const regla = await prisma.reglaNegocio.findUnique({
      where: { id: ruleId },
    });

    if (!regla || !regla.activa) {
      return;
    }

    const acciones = regla.acciones as unknown as RuleAction[];

    for (const accion of acciones) {
      await this.executeAction(accion, context);
    }
  }

  private async executeAction(action: RuleAction, context: any) {
    switch (action.type) {
      case 'applyDiscount':
        // Lógica para aplicar descuento
        break;
      case 'sendNotification':
        // Lógica para enviar notificación
        break;
      case 'schedulePromotion':
        // Lógica para programar promoción
        break;
    }
  }
}

export default new RuleEngineService();

