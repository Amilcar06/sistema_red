import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Play, Pause, Calendar, Loader2, Users, Search, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import clientService, { Client } from '../services/client.service';
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
  const [segments, setSegments] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState<PromotionFormData>(INITIAL_FORM_DATA);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [campaignData, setCampaignData] = useState({
    channel: 'WHATSAPP',
    messageTemplate: '',
  });
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  // Audience Management State
  const [isAudienceDialogOpen, setIsAudienceDialogOpen] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientSearchResults, setClientSearchResults] = useState<Client[]>([]);
  const [audienceList, setAudienceList] = useState<any[]>([]);
  const [isSearchingClients, setIsSearchingClients] = useState(false);
  const [isAudienceLoading, setIsAudienceLoading] = useState(false);

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

  const loadSegments = async () => {
    try {
      const segmentsData = await promotionService.getSegments();
      setSegments(segmentsData);
    } catch (error) {
      console.error('Error fetching segments:', error);
    }
  };

  const loadStatuses = async () => {
    try {
      const statusesData = await promotionService.getStatuses();
      setStatuses(statusesData);
    } catch (error) {
      console.error('Error fetching statuses:', error);
    }
  };

  useEffect(() => {
    loadPromotions();
    loadProducts();
    loadSegments();
    loadStatuses();
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

        // Si hay datos de campaña, intentar lanzarla
        if (campaignData.messageTemplate) {
          try {
            await promotionService.launch(
              editingPromotion.id,
              campaignData.channel,
              campaignData.messageTemplate
            );
            toast.success('Campaña lanzada exitosamente');
            setIsCampaignDialogOpen(false);
            setCampaignData({
              channel: 'WHATSAPP',
              messageTemplate: '',
            });
          } catch (launchError: any) {
            console.error('Error launching campaign:', launchError);
            toast.error('Promoción actualizada, pero error al lanzar campaña: ' + launchError.message);
          }
        }
      } else {
        await promotionService.create(promotionData);
        toast.success('Promoción creada correctamente');
      }

      setIsDialogOpen(false);
      setFormData(INITIAL_FORM_DATA);
      setEditingPromotion(null);
      await loadPromotions();
      loadSegments();
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
      loadSegments();
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
    return `Bs ${promotion.valorDescuento}`;
  };

  // Calcular tasa de conversión
  const getConversionRate = (promotion: Promotion) => {
    if (promotion.totalEnviados === 0) return 0;
    return ((promotion.totalConvertidos / promotion.totalEnviados) * 100).toFixed(1);
  };

  // Audience Management Handlers
  const handleOpenAudienceDialog = async (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsAudienceDialogOpen(true);
    setClientSearchQuery('');
    setClientSearchResults([]);
    await handleLoadAudience(promotion.id);
  };

  const handleLoadAudience = async (promotionId: string) => {
    try {
      setIsAudienceLoading(true);
      const audience = await promotionService.getAudience(promotionId);
      setAudienceList(audience);
    } catch (error) {
      console.error('Error loading audience:', error);
      toast.error('Error al cargar la audiencia');
    } finally {
      setIsAudienceLoading(false);
    }
  };

  const handleSearchClients = async () => {
    if (!clientSearchQuery.trim()) return;

    try {
      setIsSearchingClients(true);
      const response = await clientService.findAll({
        search: clientSearchQuery,
        limit: 5
      });
      setClientSearchResults(response.data);
    } catch (error) {
      console.error('Error searching clients:', error);
      toast.error('Error al buscar clientes');
    } finally {
      setIsSearchingClients(false);
    }
  };

  const handleAddClient = async (client: Client) => {
    if (!selectedPromotion) return;

    try {
      await promotionService.addClient(selectedPromotion.id, client.id);
      toast.success('Cliente agregado correctamente');
      await handleLoadAudience(selectedPromotion.id);
      // Limpiar búsqueda
      setClientSearchResults([]);
      setClientSearchQuery('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al agregar cliente';
      toast.error(errorMessage);
    }
  };

  const handleRemoveClient = async (clientId: string) => {
    if (!selectedPromotion) return;

    try {
      await promotionService.removeClient(selectedPromotion.id, clientId);
      toast.success('Cliente removido correctamente');
      await handleLoadAudience(selectedPromotion.id);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al remover cliente';
      toast.error(errorMessage);
    }
  };

  // Estadísticas
  const activePromotions = promotions.filter((p) => p.estado === 'ACTIVA').length;
  const totalSent = promotions.reduce((acc, p) => acc + p.totalEnviados, 0);
  const totalConverted = promotions.reduce((acc, p) => acc + p.totalConvertidos, 0);

  // Formatear segmento
  const formatSegment = (segment: string | undefined) => {
    if (!segment) return 'Todos';

    try {
      // Intentar parsear si es JSON
      const parsed = JSON.parse(segment);

      // Si es un objeto, formatearlo
      if (typeof parsed === 'object' && parsed !== null) {
        return Object.entries(parsed).map(([key, value]) => {
          const label = key.charAt(0).toUpperCase() + key.slice(1);
          const val = Array.isArray(value) ? value.join(', ') : String(value);
          return `${label}: ${val}`;
        }).join(' | ');
      }

      return segment;
    } catch (e) {
      // Si no es JSON válido, devolver el texto original
      return segment;
    }
  };

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
              <DialogDescription>
                Complete el formulario para {editingPromotion ? 'editar la' : 'crear una nueva'} promoción.
              </DialogDescription>
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
                    {formData.tipoDescuento === 'PORCENTAJE' ? 'Porcentaje (%)' : formData.tipoDescuento === 'MONTO_FIJO' ? 'Monto (Bs)' : 'Valor'}
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
                    {segments.map((segment) => (
                      <SelectItem key={segment} value={segment}>
                        {segment}
                      </SelectItem>
                    ))}
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
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Todos los Estados</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
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
                      <div>{formatSegment(promo.segmentoObjetivo)}</div>
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
                        onClick={() => handleOpenAudienceDialog(promo)}
                        title="Gestionar Audiencia"
                      >
                        <Users className="w-4 h-4" />
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

      {/* Audience Management Dialog */}
      <Dialog open={isAudienceDialogOpen} onOpenChange={setIsAudienceDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestionar Audiencia: {selectedPromotion?.nombre}</DialogTitle>
            <DialogDescription>
              Agrega o remueve clientes de esta promoción manualmente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Search Section */}
            <div className="space-y-2">
              <Label>Buscar Cliente</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nombre, teléfono o correo..."
                  value={clientSearchQuery}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchClients()}
                />
                <Button onClick={handleSearchClients} disabled={isSearchingClients}>
                  {isSearchingClients ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>

              {/* Search Results */}
              {clientSearchResults.length > 0 && (
                <div className="border rounded-md p-2 mt-2 bg-gray-50">
                  <p className="text-sm font-medium text-gray-500 mb-2">Resultados de búsqueda:</p>
                  <div className="space-y-2">
                    {clientSearchResults.map(client => (
                      <div key={client.id} className="flex items-center justify-between bg-white p-2 rounded border">
                        <div>
                          <p className="font-medium">{client.nombre} {client.paterno}</p>
                          <p className="text-xs text-gray-500">{client.telefono} - {client.plan}</p>
                        </div>
                        <Button size="sm" onClick={() => handleAddClient(client)}>
                          <Plus className="w-4 h-4 mr-1" /> Agregar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Current Audience List */}
            <div>
              <h3 className="font-medium mb-2">Audiencia Actual ({audienceList.length})</h3>
              {isAudienceLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : audienceList.length === 0 ? (
                <div className="text-center p-4 border rounded-md border-dashed text-gray-500">
                  No hay clientes asignados manualmente.
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Nombre</th>
                        <th className="px-4 py-2 text-left">Teléfono</th>
                        <th className="px-4 py-2 text-left">Estado</th>
                        <th className="px-4 py-2 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {audienceList.map((client) => (
                        <tr key={client.id}>
                          <td className="px-4 py-2">{client.nombre} {client.paterno}</td>
                          <td className="px-4 py-2">{client.telefono}</td>
                          <td className="px-4 py-2">
                            <Badge variant="outline" className={
                              client.estadoPromocion === 'PENDIENTE' ? 'bg-yellow-50 text-yellow-700' :
                                client.estadoPromocion === 'ENVIADA' ? 'bg-blue-50 text-blue-700' :
                                  'bg-gray-50'
                            }>
                              {client.estadoPromocion}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              onClick={() => handleRemoveClient(client.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
