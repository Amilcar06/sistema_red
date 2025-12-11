import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Phone, Mail, Filter, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { TableSkeleton } from './Skeleton';
import { EmptyClients } from './EmptyState';
import clientService, { Client, CreateClientData } from '../services/client.service';
import { toast } from 'sonner';

interface ClientFormData {
  nombre: string;
  paterno: string;
  materno: string;
  telefono: string;
  correo: string;
  plan: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
}

const INITIAL_FORM_DATA: ClientFormData = {
  nombre: '',
  paterno: '',
  materno: '',
  telefono: '',
  correo: '',
  plan: '',
  estado: 'ACTIVO',
};

export function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientFormData>(INITIAL_FORM_DATA);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Cargar clientes
  const loadClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (filterStatus !== 'all') filters.estado = filterStatus;

      const response = await clientService.findAll(filters);
      setClients(response.data || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar clientes';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar planes
  const loadPlans = async () => {
    try {
      const data = await clientService.getPlans();
      setPlans(data);
    } catch (err) {
      console.error('Error al cargar planes:', err);
    }
  };

  useEffect(() => {
    loadClients();
    loadPlans();
  }, [searchTerm, filterStatus]);

  // Manejar búsqueda con debounce
  const [searchTimeout, setSearchTimeout] = useState<any>(null);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      loadClients();
    }, 500);
    setSearchTimeout(timeout);
  };

  // Mapear estado del backend al frontend
  const getStatusBadge = (estado: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      'ACTIVO': { label: 'Activo', className: 'bg-primary/10 text-primary border-primary/20 border' },
      'INACTIVO': { label: 'Inactivo', className: 'bg-muted text-muted-foreground border-muted-foreground/30 border' },
      'SUSPENDIDO': { label: 'Suspendido', className: 'bg-destructive/10 text-destructive border-destructive/20 border' },
      'active': { label: 'Activo', className: 'bg-primary/10 text-primary border-primary/20 border' },
      'inactive': { label: 'Inactivo', className: 'bg-muted text-muted-foreground border-muted-foreground/30 border' },
    };

    const status = statusMap[estado] || { label: estado, className: 'bg-muted text-muted-foreground' };
    return status;
  };

  // Abrir diálogo para agregar nuevo cliente
  const handleOpenDialog = () => {
    setEditingClient(null);
    setFormData(INITIAL_FORM_DATA);
    setIsDialogOpen(true);
  };

  // Abrir diálogo para editar cliente
  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setFormData({
      nombre: client.nombre,
      paterno: client.paterno,
      materno: client.materno || '',
      telefono: client.telefono,
      correo: client.correo || '',
      plan: client.plan || '',
      estado: client.estado as 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO',
    });
    setIsDialogOpen(true);
  };

  // Guardar cliente
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const clientData: CreateClientData = {
        nombre: formData.nombre,
        paterno: formData.paterno,
        materno: formData.materno || undefined,
        telefono: formData.telefono,
        correo: formData.correo || undefined,
        plan: formData.plan,
        estado: formData.estado,
      };

      if (editingClient) {
        await clientService.update(editingClient.id, clientData);
        toast.success('Cliente actualizado correctamente');
      } else {
        await clientService.create(clientData);
        toast.success('Cliente creado correctamente');
      }

      setIsDialogOpen(false);
      setFormData(INITIAL_FORM_DATA);
      setEditingClient(null);
      await loadClients();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al guardar cliente';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar cliente
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      return;
    }

    try {
      await clientService.delete(id);
      toast.success('Cliente eliminado correctamente');
      await loadClients();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar cliente';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2 font-bold tracking-tight">Gestión de Clientes</h1>
          <p className="text-muted-foreground">Administra tu base de clientes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleOpenDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          {/* ... Dialog Content ... */}
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}
              </DialogTitle>
              <DialogDescription>
                Complete el formulario para {editingClient ? 'editar el' : 'agregar un nuevo'} cliente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* ... Form Inputs ... */}
              {/* Note: I'm skipping listing all inputs here for brevity, but they should generally be clean or use semantic colors if they had overrides */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Juan"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="paterno">Apellido Paterno</Label>
                  <Input
                    id="paterno"
                    placeholder="Ej: Pérez"
                    value={formData.paterno}
                    onChange={(e) => setFormData({ ...formData, paterno: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="materno">Apellido Materno (Opcional)</Label>
                <Input
                  id="materno"
                  placeholder="Ej: López"
                  value={formData.materno || ''}
                  onChange={(e) => setFormData({ ...formData, materno: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  placeholder="+52 55 1234 5678"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="correo">Email</Label>
                <Input
                  id="correo"
                  type="email"
                  placeholder="cliente@email.com"
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="plan">Plan</Label>
                <Select
                  value={formData.plan}
                  onValueChange={(value) => setFormData({ ...formData, plan: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan} value={plan}>
                        {plan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO') =>
                    setFormData({ ...formData, estado: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVO">Activo</SelectItem>
                    <SelectItem value="INACTIVO">Inactivo</SelectItem>
                    <SelectItem value="SUSPENDIDO">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cliente'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Buscar por nombre, teléfono o email..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="px-4 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-ring"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos los Estados</option>
              {['ACTIVO', 'INACTIVO', 'SUSPENDIDO'].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes ({clients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : clients.length === 0 ? (
            <EmptyClients onCreate={() => setIsDialogOpen(true)} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Contacto</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Plan</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Estado</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Fecha de Registro</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => {
                    const status = getStatusBadge(client.estado);
                    return (
                      <tr key={client.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-foreground">
                            {client.nombre} {client.paterno} {client.materno}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <span>{client.telefono}</span>
                            </div>
                            {client.correo && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="w-4 h-4" />
                                <span>{client.correo}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="border-border text-foreground">{client.plan}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={status.className}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(client.fechaRegistro || client.fechaCreacion).toLocaleDateString('es-MX')}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => handleEditClient(client)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                              onClick={() => handleDelete(client.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
