import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import ruleService, { Rule, CreateRuleData } from '../services/rule.service';

const RuleManagement: React.FC = () => {
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<Rule | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, reset, setValue, watch } = useForm<CreateRuleData>();

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            setLoading(true);
            const data = await ruleService.getAll();
            setRules(data);
            setError(null);
        } catch (err) {
            setError('Error al cargar las reglas');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (rule?: Rule) => {
        if (rule) {
            setEditingRule(rule);
            setValue('nombre', rule.nombre);
            setValue('descripcion', rule.descripcion);
            setValue('tipoRegla', rule.tipoRegla);
            setValue('prioridad', rule.prioridad);
            setValue('activa', rule.activa);
            setValue('condiciones', JSON.stringify(rule.condiciones, null, 2));
            setValue('acciones', JSON.stringify(rule.acciones, null, 2));
        } else {
            setEditingRule(null);
            reset({
                nombre: '',
                descripcion: '',
                tipoRegla: 'ELEGIBILIDAD',
                prioridad: 0,
                activa: true,
                condiciones: '{}',
                acciones: '{}'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRule(null);
        reset();
    };

    const onSubmit = async (data: any) => {
        try {
            // Parse JSON fields
            const formattedData = {
                ...data,
                condiciones: JSON.parse(data.condiciones),
                acciones: JSON.parse(data.acciones)
            };

            if (editingRule) {
                await ruleService.update(editingRule.id, formattedData);
            } else {
                await ruleService.create(formattedData);
            }

            fetchRules();
            closeModal();
        } catch (err) {
            setError('Error al guardar la regla. Verifica el formato JSON.');
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar esta regla?')) {
            try {
                await ruleService.delete(id);
                fetchRules();
            } catch (err) {
                setError('Error al eliminar la regla');
            }
        }
    };

    const toggleStatus = async (rule: Rule) => {
        try {
            await ruleService.update(rule.id, { activa: !rule.activa });
            fetchRules();
        } catch (err) {
            setError('Error al actualizar estado');
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando reglas...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Reglas de Negocio</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    Nueva Regla
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                        <tr>
                            <th className="p-4">Nombre</th>
                            <th className="p-4">Tipo</th>
                            <th className="p-4">Prioridad</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rules.map((rule) => (
                            <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <div className="font-medium text-gray-900">{rule.nombre}</div>
                                    <div className="text-sm text-gray-500">{rule.descripcion}</div>
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                        {rule.tipoRegla}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-600">{rule.prioridad}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => toggleStatus(rule)}
                                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${rule.activa
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {rule.activa ? <CheckCircle size={12} /> : <X size={12} />}
                                        {rule.activa ? 'Activa' : 'Inactiva'}
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => openModal(rule)}
                                            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                            title="Editar"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(rule.id)}
                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingRule ? 'Editar Regla' : 'Nueva Regla'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                    <input
                                        {...register('nombre', { required: true })}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                        placeholder="Ej: Cliente Premium La Paz"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                    <select
                                        {...register('tipoRegla')}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    >
                                        <option value="ELEGIBILIDAD">Elegibilidad</option>
                                        <option value="DESCUENTO">Descuento</option>
                                        <option value="NOTIFICACION">Notificación</option>
                                        <option value="PROGRAMACION">Programación</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                <input
                                    {...register('descripcion')}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    placeholder="Descripción opcional"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                                    <input
                                        type="number"
                                        {...register('prioridad', { valueAsNumber: true })}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            {...register('activa')}
                                            className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Regla Activa</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Condiciones (JSON)
                                    <span className="text-xs text-gray-400 ml-2">Ej: {"{ \"plan\": \"PREMIUM\" }"}</span>
                                </label>
                                <textarea
                                    {...register('condiciones')}
                                    rows={4}
                                    className="w-full p-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-gray-50"
                                    placeholder='{ "campo": "valor" }'
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Acciones (JSON)
                                    <span className="text-xs text-gray-400 ml-2">Ej: {"{ \"descuento\": 10 }"}</span>
                                </label>
                                <textarea
                                    {...register('acciones')}
                                    rows={4}
                                    className="w-full p-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-gray-50"
                                    placeholder='{ "accion": "valor" }'
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Save size={18} />
                                    Guardar Regla
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RuleManagement;
