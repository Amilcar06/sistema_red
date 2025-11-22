import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Play, Pause, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import promotionService, { Promotion, CreatePromotionData } from '../services/promotion.service';
import productService from '../services/product.service';
import { toast } from 'sonner';

interface PromotionFormData {
  nombre: string;
  descripcion: string;
  tipoDescuento: 'PORCENTAJE' | 'MONTO_FIJO' | 'GRATIS';
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  segmentoObjetivo: string;
  plantillaMensaje: string;
  productIds: string[];
}

const INITIAL_FORM_DATA: PromotionFormData = {
  nombre: '',
  descripcion: '',
  tipoDescuento: 'PORCENTAJE',
  valorDescuento: 0,
  fechaInicio: '',
  fechaFin: '',
  segmentoObjetivo: '',
  plantillaMensaje: '',
  productIds: [],
};

export function PromotionManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState<PromotionFormData>(INITIAL_FORM_DATA);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Cargar promociones
  const loadPromotions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const filters: any = {};
      if (filterStatus !== 'all') filters.estado = filterStatus;
      
      const response = await promotionService.findAll(filters);
      setPromotions(response.data || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar promociones';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar productos
  const loadProducts = async () => {
    try {
      const response = await productService.findAll();
      setProducts(response.data || []);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      // Silenciar el error ya que los productos son opcionales para promociones
    }
  };

  useEffect(() => {
    loadPromotions();
    loadProducts();
  }, [filterStatus]);

  // Mapear estado del backend al frontend
  const getStatusBadge = (estado: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      'ACTIVA': { label: 'Activa', className: 'bg-green-100 text-green-800' },
      'PAUSADA': { label: 'Pausada', className: 'bg-yellow-100 text-yellow-800' },
      'FINALIZADA': { label: 'Finalizada', className: 'bg-gray-100 text-gray-800' },
      'BORRADOR': { label: 'Borrador', className: 'bg-blue-100 text-blue-800' },
      'CANCELADA': { label: 'Cancelada', className: 'bg-red-100 text-red-800' },
      'active': { label: 'Activa', className: 'bg-green-100 text-green-800' },
      'paused': { label: 'Pausada', className: 'bg-yellow-100 text-yellow-800' },
      'ended': { label: 'Finalizada', className: 'bg-gray-100 text-gray-800' },
    };
    
    const status = statusMap[estado] || { label: estado, className: 'bg-gray-100 text-gray-800' };
    return status;
  };

  // Abrir diálogo para nueva promoción
  const handleOpenDialog = () => {
    setEditingPromotion(null);
    setFormData(INITIAL_FORM_DATA);
    setIsDialogOpen(true);
  };

  // Abrir diálogo para editar promoción
  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      nombre: promotion.nombre,
      descripcion: promotion.descripcion || '',
      tipoDescuento: promotion.tipoDescuento,
      valorDescuento: Number(promotion.valorDescuento),
      fechaInicio: promotion.fechaInicio.split('T')[0],
      fechaFin: promotion.fechaFin.split('T')[0],
      segmentoObjetivo: promotion.segmentoObjetivo || '',
      plantillaMensaje: promotion.plantillaMensaje || '',
      productIds: promotion.productos?.map((p: any) => p.producto?.id || p.id) || [],
    });
    setIsDialogOpen(true);
  };

  // Guardar promoción
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const promotionData: CreatePromotionData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        tipoDescuento: formData.tipoDescuento,
        valorDescuento: formData.valorDescuento,
        fechaInicio: new Date(formData.fechaInicio).toISOString(),
        fechaFin: new Date(formData.fechaFin).toISOString(),
        segmentoObjetivo: formData.segmentoObjetivo || undefined,
        plantillaMensaje: formData.plantillaMensaje || undefined,
        productIds: formData.productIds.length > 0 ? formData.productIds : undefined,
      };

      if (editingPromotion) {
        await promotionService.update(editingPromotion.id, promotionData);
        toast.success('Promoción actualizada correctamente');
      } else {
        await promotionService.create(promotionData);
        toast.success('Promoción creada correctamente');
      }

      setIsDialogOpen(false);
      setFormData(INITIAL_FORM_DATA);
      setEditingPromotion(null);
      await loadPromotions();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al guardar promoción';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar promoción
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta promoción?')) {
      return;
    }

    try {
      await promotionService.delete(id);
      toast.success('Promoción eliminada correctamente');
      await loadPromotions();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar promoción';
      toast.error(errorMessage);
    }
  };

  // Activar promoción
  const handleActivate = async (id: string) => {
    try {
      await promotionService.activate(id);
      toast.success('Promoción activada correctamente');
      await loadPromotions();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al activar promoción';
      toast.error(errorMessage);
    }
  };

  // Pausar promoción
  const handlePause = async (id: string) => {
    try {
      await promotionService.pause(id);
      toast.success('Promoción pausada correctamente');
      await loadPromotions();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al pausar promoción';
      toast.error(errorMessage);
    }
  };

  // Formatear descuento
  const formatDiscount = (promotion: Promotion) => {
    if (promotion.tipoDescuento === 'GRATIS') {
      return 'Gratis';
    }
    if (promotion.tipoDescuento === 'PORCENTAJE') {
      return `${promotion.valorDescuento}%`;
    }
    return `$${promotion.valorDescuento}`;
  };

  // Calcular tasa de conversión
  const getConversionRate = (promotion: Promotion) => {
    if (promotion.totalEnviados === 0) return 0;
    return ((promotion.totalConvertidos / promotion.totalEnviados) * 100).toFixed(1);
  };

  // Estadísticas
  const activePromotions = promotions.filter((p) => p.estado === 'ACTIVA').length;
  const totalSent = promotions.reduce((acc, p) => acc + p.totalEnviados, 0);
  const totalConverted = promotions.reduce((acc, p) => acc + p.totalConvertidos, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Gestión de Promociones</h1>
          <p className="text-gray-600">Crea y administra campañas promocionales</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleOpenDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Promoción
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPromotion ? 'Editar Promoción' : 'Crear Nueva Promoción'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="nombre">Nombre de la Promoción</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Plan Premium 50% OFF"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe los beneficios de la promoción"
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipoDescuento">Tipo de Descuento</Label>
                  <Select
                    value={formData.tipoDescuento}
                    onValueChange={(value: 'PORCENTAJE' | 'MONTO_FIJO' | 'GRATIS') =>
                      setFormData({ ...formData, tipoDescuento: value })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PORCENTAJE">Porcentaje</SelectItem>
                      <SelectItem value="MONTO_FIJO">Monto Fijo</SelectItem>
                      <SelectItem value="GRATIS">Gratis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="valorDescuento">
                    {formData.tipoDescuento === 'PORCENTAJE' ? 'Porcentaje (%)' : formData.tipoDescuento === 'MONTO_FIJO' ? 'Monto ($)' : 'Valor'}
                  </Label>
                  <Input
                    id="valorDescuento"
                    type="number"
                    min="0"
                    step={formData.tipoDescuento === 'PORCENTAJE' ? '1' : '0.01'}
                    placeholder="Ej: 50"
                    value={formData.valorDescuento || ''}
                    onChange={(e) => setFormData({ ...formData, valorDescuento: parseFloat(e.target.value) || 0 })}
                    required
                    disabled={isSubmitting || formData.tipoDescuento === 'GRATIS'}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="segmentoObjetivo">Segmento Objetivo</Label>
                <Select
                  value={formData.segmentoObjetivo}
                  onValueChange={(value) => setFormData({ ...formData, segmentoObjetivo: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona segmento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los clientes</SelectItem>
                    <SelectItem value="basic">Clientes Básico</SelectItem>
                    <SelectItem value="Premium">Clientes Premium</SelectItem>
                    <SelectItem value="Premium Plus">Clientes Premium Plus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="fechaFin">Fecha Fin</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="plantillaMensaje">Plantilla de Mensaje</Label>
                <Textarea
                  id="plantillaMensaje"
                  placeholder="Hola {nombre}, tenemos una oferta especial para ti..."
                  rows={4}
                  value={formData.plantillaMensaje}
                  onChange={(e) => setFormData({ ...formData, plantillaMensaje: e.target.value })}
                  disabled={isSubmitting}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Variables disponibles: {'{nombre}'}, {'{plan}'}, {'{descuento}'}
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  editingPromotion ? 'Actualizar Promoción' : 'Crear Promoción'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-gray-600 text-sm mb-1">Promociones Activas</div>
            <div className="text-3xl">{activePromotions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-gray-600 text-sm mb-1">Total Mensajes Enviados</div>
            <div className="text-3xl">{totalSent.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-gray-600 text-sm mb-1">Total Conversiones</div>
            <div className="text-3xl">{totalConverted.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-6">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="BORRADOR">Borrador</SelectItem>
              <SelectItem value="ACTIVA">Activa</SelectItem>
              <SelectItem value="PAUSADA">Pausada</SelectItem>
              <SelectItem value="FINALIZADA">Finalizada</SelectItem>
              <SelectItem value="CANCELADA">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Promotions List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          </CardContent>
        </Card>
      ) : promotions.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-gray-500">
              No se encontraron promociones
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {promotions.map((promo) => {
            const status = getStatusBadge(promo.estado);
            const conversionRate = getConversionRate(promo);
            return (
              <Card key={promo.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="mb-2">{promo.nombre}</CardTitle>
                      {promo.descripcion && (
                        <p className="text-gray-600">{promo.descripcion}</p>
                      )}
                    </div>
                    <Badge className={status.className}>{status.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <div className="text-gray-600 text-sm mb-1">Descuento</div>
                      <div className="text-xl text-blue-600">{formatDiscount(promo)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-sm mb-1">Segmento</div>
                      <div>{promo.segmentoObjetivo || 'Todos'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-sm mb-1">Enviados</div>
                      <div>{promo.totalEnviados.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-sm mb-1">Conversiones</div>
                      <div>{promo.totalConvertidos.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-sm mb-1">Tasa Conversión</div>
                      <div>{conversionRate}%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(promo.fechaInicio).toLocaleDateString('es-MX')} -{' '}
                          {new Date(promo.fechaFin).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {promo.estado === 'BORRADOR' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActivate(promo.id)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Activar
                        </Button>
                      )}
                      {promo.estado === 'ACTIVA' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePause(promo.id)}
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          Pausar
                        </Button>
                      )}
                      {promo.estado === 'PAUSADA' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActivate(promo.id)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Reanudar
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPromotion(promo)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(promo.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
