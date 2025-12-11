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
      'ACTIVA': { label: 'Activa', className: 'bg-primary/10 text-primary border-primary/20 border' },
      'PAUSADA': { label: 'Pausada', className: 'bg-orange-500/10 text-orange-600 border-orange-500/20 border' },
      'FINALIZADA': { label: 'Finalizada', className: 'bg-muted text-muted-foreground border-muted-foreground/30 border' },
      'BORRADOR': { label: 'Borrador', className: 'bg-secondary/10 text-secondary border-secondary/20 border' },
      'CANCELADA': { label: 'Cancelada', className: 'bg-destructive/10 text-destructive border-destructive/20 border' },
      'active': { label: 'Activa', className: 'bg-primary/10 text-primary border-primary/20 border' },
      'paused': { label: 'Pausada', className: 'bg-orange-500/10 text-orange-600 border-orange-500/20 border' },
      'ended': { label: 'Finalizada', className: 'bg-muted text-muted-foreground border-muted-foreground/30 border' },
    };

    const status = statusMap[estado] || { label: estado, className: 'bg-muted text-muted-foreground' };
    return status;
  };

  // Estadísticas derivadas
  const activePromotions = promotions.filter((p) => p.estado === 'ACTIVA').length;
  const totalSent = promotions.reduce((acc, curr) => acc + (curr.totalEnviados || 0), 0);
  const totalConverted = promotions.reduce((acc, curr) => acc + (curr.totalConvertidos || 0), 0);

  // Helpers
  const formatDiscount = (promo: Promotion) => {
    switch (promo.tipoDescuento) {
      case 'PORCENTAJE':
        return `${promo.valorDescuento}%`;
      case 'MONTO_FIJO':
        return `$${promo.valorDescuento}`;
      case 'GRATIS':
        return 'Gratis';
      default:
        return `${promo.valorDescuento}`;
    }
  };

  const formatSegment = (segment?: string) => {
    if (!segment || segment === 'all') return 'Todos los clientes';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const getConversionRate = (promo: Promotion) => {
    if (!promo.totalEnviados || promo.totalEnviados === 0) return 0;
    return ((promo.totalConvertidos / promo.totalEnviados) * 100).toFixed(1);
  };

  // Handlers
  const handleOpenDialog = () => {
    setEditingPromotion(null);
    setFormData(INITIAL_FORM_DATA);
    setIsDialogOpen(true);
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      nombre: promotion.nombre,
      descripcion: promotion.descripcion || '',
      tipoDescuento: promotion.tipoDescuento as 'PORCENTAJE' | 'MONTO_FIJO' | 'GRATIS',
      valorDescuento: promotion.valorDescuento,
      fechaInicio: promotion.fechaInicio.split('T')[0],
      fechaFin: promotion.fechaFin.split('T')[0],
      segmentoObjetivo: promotion.segmentoObjetivo || 'all',
      plantillaMensaje: promotion.plantillaMensaje || '',
      productIds: promotion.productos ? promotion.productos.map(p => p.producto.id) : [],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data: CreatePromotionData = {
        ...formData,
        productIds: formData.productIds.length > 0 ? formData.productIds : undefined,
      };

      if (editingPromotion) {
        await promotionService.update(editingPromotion.id, data);
        toast.success('Promoción actualizada correctamente');
      } else {
        await promotionService.create(data);
        toast.success('Promoción creada correctamente');
      }

      setIsDialogOpen(false);
      loadPromotions();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar la promoción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta promoción?')) return;
    try {
      await promotionService.delete(id);
      toast.success('Promoción eliminada');
      loadPromotions();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await promotionService.activate(id);
      toast.success('Promoción activada');
      loadPromotions();
    } catch (err: any) {
      toast.error(err.message || 'Error al activar');
    }
  };

  const handlePause = async (id: string) => {
    try {
      await promotionService.pause(id);
      toast.success('Promoción pausada');
      loadPromotions();
    } catch (err: any) {
      toast.error(err.message || 'Error al pausar');
    }
  };

  // Audience Handlers
  const handleOpenAudienceDialog = async (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setAudienceList([]); // Reset list initially or load from backend if available
    setIsAudienceDialogOpen(true);
    // TODO: Load actual audience if API supports it
  };

  const handleSearchClients = async () => {
    if (!clientSearchQuery.trim()) return;
    setIsSearchingClients(true);
    try {
      // Mock search or use real service if available
      const response = await clientService.findAll({ search: clientSearchQuery });
      setClientSearchResults(response.data);
    } catch (err) {
      toast.error('Error al buscar clientes');
    } finally {
      setIsSearchingClients(false);
    }
  };

  const handleAddClient = (client: Client) => {
    // Add to local state for now, in a real app this might call an API endpoint to add to the promotion's audience
    if (audienceList.find(c => c.id === client.id)) {
      toast.error('El cliente ya está en la lista');
      return;
    }
    const clientWithStatus = { ...client, estadoPromocion: 'PENDIENTE' };
    setAudienceList([...audienceList, clientWithStatus]);
    toast.success('Cliente agregado a la audiencia');
  };

  const handleRemoveClient = (clientId: string) => {
    setAudienceList(audienceList.filter(c => c.id !== clientId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2 font-bold tracking-tight">Gestión de Promociones</h1>
          <p className="text-muted-foreground">Crea y administra campañas promocionales</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleOpenDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Promoción
            </Button>
          </DialogTrigger>
          {/* ... Dialog Content ... */}
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
              {/* ... Form Inputs (updated manually above or use generic replacement for text-gray-500 -> text-muted-foreground below) ... */}
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
                <p className="text-sm text-muted-foreground mt-2">
                  Variables disponibles: {'{nombre}'}, {'{plan}'}, {'{descuento}'}
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
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
            <div className="text-muted-foreground text-sm mb-1">Promociones Activas</div>
            <div className="text-3xl font-bold text-foreground">{activePromotions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-muted-foreground text-sm mb-1">Total Mensajes Enviados</div>
            <div className="text-3xl font-bold text-foreground">{totalSent.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-muted-foreground text-sm mb-1">Total Conversiones</div>
            <div className="text-3xl font-bold text-foreground">{totalConverted.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-6">
          <select
            className="px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-ring"
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
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      ) : promotions.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-muted-foreground">
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
                        <p className="text-muted-foreground">{promo.descripcion}</p>
                      )}
                    </div>
                    <Badge className={status.className}>{status.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <div className="text-muted-foreground text-sm mb-1">Descuento</div>
                      <div className="text-xl text-primary font-bold">{formatDiscount(promo)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm mb-1">Segmento</div>
                      <div className="text-foreground">{formatSegment(promo.segmentoObjetivo)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm mb-1">Enviados</div>
                      <div className="text-foreground">{promo.totalEnviados.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm mb-1">Conversiones</div>
                      <div className="text-foreground">{promo.totalConvertidos.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm mb-1">Tasa Conversión</div>
                      <div className="text-foreground">{conversionRate}%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                        onClick={() => handleDelete(promo.id)}
                      >
                        <Trash2 className="w-4 h-4" />
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
                <Button onClick={handleSearchClients} disabled={isSearchingClients} className="bg-primary hover:bg-primary/90">
                  {isSearchingClients ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>

              {/* Search Results */}
              {clientSearchResults.length > 0 && (
                <div className="border border-border rounded-md p-2 mt-2 bg-muted/30">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Resultados de búsqueda:</p>
                  <div className="space-y-2">
                    {clientSearchResults.map(client => (
                      <div key={client.id} className="flex items-center justify-between bg-card p-2 rounded border border-border">
                        <div>
                          <p className="font-medium text-foreground">{client.nombre} {client.paterno}</p>
                          <p className="text-xs text-muted-foreground">{client.telefono} - {client.plan}</p>
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
              <h3 className="font-medium mb-2 text-foreground">Audiencia Actual ({audienceList.length})</h3>
              {isAudienceLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : audienceList.length === 0 ? (
                <div className="text-center p-4 border rounded-md border-dashed text-muted-foreground">
                  No hay clientes asignados manualmente.
                </div>
              ) : (
                <div className="border border-border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Nombre</th>
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Teléfono</th>
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Estado</th>
                        <th className="px-4 py-2 text-right font-medium text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
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
