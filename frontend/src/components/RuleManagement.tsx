import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, CheckCircle, AlertCircle, Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter,
} from './ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import ruleService, { Rule, CreateRuleData } from '../services/rule.service';
import { toast } from 'sonner';

interface RuleFormData {
    nombre: string;
    descripcion: string;
    tipoRegla: 'ELEGIBILIDAD' | 'DESCUENTO' | 'NOTIFICACION' | 'PROGRAMACION';
    prioridad: number;
    activa: boolean;
    condiciones: string;
    acciones: string;
}

const INITIAL_FORM_DATA: RuleFormData = {
    nombre: '',
    descripcion: '',
    tipoRegla: 'ELEGIBILIDAD',
    prioridad: 0,
    activa: true,
    condiciones: '{}',
    acciones: '{}',
};

const RuleManagement: React.FC = () => {
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<Rule | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<RuleFormData>(INITIAL_FORM_DATA);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [types, setTypes] = useState<string[]>([]);

    const validateJson = (value: string) => {
        try {
            JSON.parse(value);
            return true;
        } catch (e) {
            return false;
        }
    };

    const [jsonErrors, setJsonErrors] = useState({ condiciones: false, acciones: false });

    const handleJsonChange = (field: 'condiciones' | 'acciones', value: string) => {
        setFormData({ ...formData, [field]: value });
        setJsonErrors({ ...jsonErrors, [field]: !validateJson(value) });
    };

    useEffect(() => {
        fetchRules();
        fetchTypes();
    }, [search, filterType, filterStatus]);

    const fetchTypes = async () => {
        try {
            const data = await ruleService.getTypes();
            setTypes(data);
        } catch (error) {
            console.error('Error fetching types:', error);
        }
    };

    const fetchRules = async () => {
        try {
            setLoading(true);
            const filters: any = {};
            if (search) filters.search = search;
            if (filterType !== 'all') filters.tipoRegla = filterType;
            if (filterStatus !== 'all') filters.activa = filterStatus === 'active';

            const data = await ruleService.getAll(filters);
            setRules(data);
            setError(null);
        } catch (err) {
            setError('Error al cargar las reglas');
            console.error(err);
            toast.error('Error al cargar las reglas');
        } finally {
            setLoading(false);
        }
    };

    const openDialog = (rule?: Rule) => {
        if (rule) {
            setEditingRule(rule);
            setFormData({
                nombre: rule.nombre,
                descripcion: rule.descripcion || '',
                tipoRegla: rule.tipoRegla,
                prioridad: rule.prioridad,
                activa: rule.activa,
                condiciones: JSON.stringify(rule.condiciones, null, 2),
                acciones: JSON.stringify(rule.acciones, null, 2),
            });
        } else {
            setEditingRule(null);
            setFormData(INITIAL_FORM_DATA);
        }
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingRule(null);
        setFormData(INITIAL_FORM_DATA);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Parse JSON fields
            const formattedData: CreateRuleData = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                tipoRegla: formData.tipoRegla,
                prioridad: formData.prioridad,
                activa: formData.activa,
                condiciones: JSON.parse(formData.condiciones),
                acciones: JSON.parse(formData.acciones),
            };

            if (editingRule) {
                await ruleService.update(editingRule.id, formattedData);
                toast.success('Regla actualizada correctamente');
            } else {
                await ruleService.create(formattedData);
                toast.success('Regla creada correctamente');
            }

            fetchRules();
            closeDialog();
        } catch (err) {
            const msg = 'Error al guardar la regla. Verifica el formato JSON.';
            setError(msg);
            toast.error(msg);
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar esta regla?')) {
            try {
                await ruleService.delete(id);
                toast.success('Regla eliminada correctamente');
                fetchRules();
            } catch (err) {
                setError('Error al eliminar la regla');
                toast.error('Error al eliminar la regla');
            }
        }
    };

    const toggleStatus = async (rule: Rule) => {
        try {
            await ruleService.update(rule.id, { activa: !rule.activa });
            toast.success(`Regla ${rule.activa ? 'desactivada' : 'activada'} correctamente`);
            fetchRules();
        } catch (err) {
            setError('Error al actualizar estado');
            toast.error('Error al actualizar estado');
        }
    };

    const getStatusBadge = (activa: boolean) => {
        return activa
            ? { label: 'Activa', className: 'bg-green-100 text-green-800 hover:bg-green-200' }
            : { label: 'Inactiva', className: 'bg-gray-100 text-gray-800 hover:bg-gray-200' };
    };

    const getTypeBadge = (tipo: string) => {
        const types: Record<string, string> = {
            'ELEGIBILIDAD': 'bg-blue-100 text-blue-800',
            'DESCUENTO': 'bg-purple-100 text-purple-800',
            'NOTIFICACION': 'bg-yellow-100 text-yellow-800',
            'PROGRAMACION': 'bg-indigo-100 text-indigo-800'
        };
        return types[tipo] || 'bg-gray-100 text-gray-800';
    };

    // ... (rest of the component)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl mb-2">Reglas de Negocio</h1>
                    <p className="text-gray-600">Configura las reglas automáticas del sistema</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => openDialog()}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Regla
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{editingRule ? 'Editar Regla' : 'Crear Nueva Regla'}</DialogTitle>
                            <DialogDescription>
                                {editingRule
                                    ? 'Modifica los detalles de la regla existente.'
                                    : 'Crea una nueva regla para automatizar procesos.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="nombre" className="text-right">
                                    Nombre
                                </Label>
                                <Input
                                    id="nombre"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="col-span-3"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="descripcion" className="text-right">
                                    Descripción
                                </Label>
                                <Input
                                    id="descripcion"
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    className="col-span-3"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="tipoRegla" className="text-right">
                                    Tipo de Regla
                                </Label>
                                <Select
                                    value={formData.tipoRegla}
                                    onValueChange={(value: 'ELEGIBILIDAD' | 'DESCUENTO' | 'NOTIFICACION' | 'PROGRAMACION') =>
                                        setFormData({ ...formData, tipoRegla: value })
                                    }
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Selecciona un tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ELEGIBILIDAD">ELEGIBILIDAD</SelectItem>
                                        <SelectItem value="DESCUENTO">DESCUENTO</SelectItem>
                                        <SelectItem value="NOTIFICACION">NOTIFICACION</SelectItem>
                                        <SelectItem value="PROGRAMACION">PROGRAMACION</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="prioridad" className="text-right">
                                    Prioridad
                                </Label>
                                <Input
                                    id="prioridad"
                                    type="number"
                                    value={formData.prioridad}
                                    onChange={(e) => setFormData({ ...formData, prioridad: parseInt(e.target.value) })}
                                    className="col-span-3"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="activa" className="text-right">
                                    Activa
                                </Label>
                                <Switch
                                    id="activa"
                                    checked={formData.activa}
                                    onCheckedChange={(checked) => setFormData({ ...formData, activa: checked })}
                                    className="col-span-3"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="condiciones">Condiciones (JSON)</Label>
                                    <Textarea
                                        id="condiciones"
                                        rows={5}
                                        className={`font-mono text-sm ${jsonErrors.condiciones ? 'border-red-500' : ''}`}
                                        value={formData.condiciones}
                                        onChange={(e) => handleJsonChange('condiciones', e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    {jsonErrors.condiciones && <p className="text-xs text-red-500 mt-1">JSON inválido</p>}
                                </div>
                                <div>
                                    <Label htmlFor="acciones">Acciones (JSON)</Label>
                                    <Textarea
                                        id="acciones"
                                        rows={5}
                                        className={`font-mono text-sm ${jsonErrors.acciones ? 'border-red-500' : ''}`}
                                        value={formData.acciones}
                                        onChange={(e) => handleJsonChange('acciones', e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    {jsonErrors.acciones && <p className="text-xs text-red-500 mt-1">JSON inválido</p>}
                                </div>
                            </div>
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <DialogFooter>
                                <Button variant="outline" onClick={closeDialog} disabled={isSubmitting}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSubmitting || jsonErrors.condiciones || jsonErrors.acciones}>
                                    {isSubmitting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : editingRule ? (
                                        'Guardar Cambios'
                                    ) : (
                                        'Crear Regla'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar reglas..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={filterType}
                            onValueChange={setFilterType}
                        >
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Tipos</SelectItem>
                                {types.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={filterStatus}
                            onValueChange={setFilterStatus}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="active">Activas</SelectItem>
                                <SelectItem value="inactive">Inactivas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Reglas ({rules.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium text-gray-500">Nombre</th>
                                        <th className="text-left p-4 font-medium text-gray-500">Tipo</th>
                                        <th className="text-left p-4 font-medium text-gray-500">Prioridad</th>
                                        <th className="text-left p-4 font-medium text-gray-500">Estado</th>
                                        <th className="text-right p-4 font-medium text-gray-500">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rules.map((rule) => {
                                        const status = getStatusBadge(rule.activa);
                                        return (
                                            <tr key={rule.id} className="border-b hover:bg-gray-50 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-medium text-gray-900">{rule.nombre}</div>
                                                    <div className="text-sm text-gray-500">{rule.descripcion}</div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge className={getTypeBadge(rule.tipoRegla)} variant="secondary">
                                                        {rule.tipoRegla}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-gray-600">{rule.prioridad}</td>
                                                <td className="p-4">
                                                    <Badge
                                                        className={`cursor-pointer ${status.className}`}
                                                        onClick={() => toggleStatus(rule)}
                                                    >
                                                        {status.label}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openDialog(rule)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(rule.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {rules.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-500">
                                                No hay reglas configuradas. Crea una nueva para comenzar.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default RuleManagement;
