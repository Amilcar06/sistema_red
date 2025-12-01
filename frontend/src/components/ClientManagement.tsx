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
  telefono: string;
  correo: string;
  plan: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
}

const INITIAL_FORM_DATA: ClientFormData = {
  nombre: '',
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
      'ACTIVO': { label: 'Activo', className: 'bg-green-100 text-green-800' },
      'INACTIVO': { label: 'Inactivo', className: 'bg-gray-100 text-gray-800' },
      'SUSPENDIDO': { label: 'Suspendido', className: 'bg-red-100 text-red-800' },
      'active': { label: 'Activo', className: 'bg-green-100 text-green-800' },
      'inactive': { label: 'Inactivo', className: 'bg-gray-100 text-gray-800' },
    };

    const status = statusMap[estado] || { label: estado, className: 'bg-gray-100 text-gray-800' };
    return status;
  };

  // Abrir diálogo para nuevo cliente
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
      telefono: client.telefono,
      correo: client.correo || '',
      plan: client.plan,
      estado: client.estado,
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
      loadPlans(); // Reload plans in case a new one was introduced
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
      loadPlans();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar cliente';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Gestión de Clientes</h1>
          <p className="text-gray-600">Administra tu base de clientes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleOpenDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
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
              <div>
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Juan Pérez"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
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
                className="w-full bg-blue-600 hover:bg-blue-700"
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar por nombre, teléfono o email..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <tr className="border-b">
                    <th className="text-left p-4">Cliente</th>
                    <th className="text-left p-4">Contacto</th>
                    <th className="text-left p-4">Plan</th>
                    <th className="text-left p-4">Estado</th>
                    <th className="text-left p-4">Fecha de Registro</th>
                    <th className="text-left p-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => {
                    const status = getStatusBadge(client.estado);
                    return (
                      <tr key={client.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium">{client.nombre}</div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{client.telefono}</span>
                            </div>
                            {client.correo && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span>{client.correo}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{client.plan}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={status.className}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {new Date(client.fechaRegistro || client.fechaCreacion).toLocaleDateString('es-MX')}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClient(client)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(client.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
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
