import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, Loader2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
import { EmptyProducts } from './EmptyState';
import productService, { Product, CreateProductData } from '../services/product.service';
import { toast } from 'sonner';

export function ProductManagement() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<CreateProductData>({
        nombre: '',
        descripcion: '',
        categoria: '',
        precio: 0,
    });

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            const response = await productService.findAll({
                pagina: page,
                limite: 9, // 3x3 grid
                busqueda: debouncedSearch
            });
            setProducts(response.data || []);
            setTotalPages(response.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Error loading products:', error);
            toast.error('Error al cargar productos');
        } finally {
            setIsLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const cats = await productService.getCategories();
            setCategories(cats);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [page, debouncedSearch]);

    useEffect(() => {
        loadCategories();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await productService.create(formData);
            toast.success('Producto creado exitosamente');
            setIsCreateOpen(false);
            setFormData({ nombre: '', descripcion: '', categoria: '', precio: 0 });
            loadProducts();
            loadCategories();
        } catch (error) {
            console.error('Error creating product:', error);
            toast.error('Error al crear producto');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        try {
            await productService.update(selectedProduct.id, formData);
            toast.success('Producto actualizado exitosamente');
            setIsEditOpen(false);
            setSelectedProduct(null);
            loadProducts();
            loadCategories();
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('Error al actualizar producto');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
            await productService.delete(id);
            toast.success('Producto eliminado exitosamente');
            loadProducts();
            loadCategories();
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Error al eliminar producto');
        }
    };

    const openEditModal = (product: Product) => {
        setSelectedProduct(product);
        setFormData({
            nombre: product.nombre,
            descripcion: product.descripcion || '',
            categoria: product.categoria,
            precio: Number(product.precio),
        });
        setIsEditOpen(true);
    };

    if (isLoading && products.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
                    <p className="text-muted-foreground">
                        Gestiona el catálogo de productos y servicios
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Producto
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Crear Nuevo Producto</DialogTitle>
                            <DialogDescription>
                                Ingrese los detalles del nuevo producto o servicio.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <Label htmlFor="nombre">Nombre</Label>
                                <Input
                                    id="nombre"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="descripcion">Descripción</Label>
                                <Input
                                    id="descripcion"
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="categoria">Categoría</Label>
                                <Select
                                    value={formData.categoria}
                                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="precio">Precio</Label>
                                <Input
                                    id="precio"
                                    type="number"
                                    step="0.01"
                                    value={formData.precio}
                                    onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Guardar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            {products.length === 0 && !isLoading ? (
                <EmptyProducts onCreate={() => setIsCreateOpen(true)} />
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                            <Card key={product.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {product.categoria}
                                    </CardTitle>
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{product.nombre}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {product.descripcion}
                                    </p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-lg font-bold text-blue-600">
                                            Bs {Number(product.precio).toFixed(2)}
                                        </span>
                                        <div className="flex space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEditModal(product)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(product.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Anterior
                            </Button>
                            <span className="text-sm text-gray-600">
                                Página {page} de {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Siguiente
                            </Button>
                        </div>
                    )}
                </>
            )}

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Producto</DialogTitle>
                        <DialogDescription>
                            Modifique los detalles del producto seleccionado.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div>
                            <Label htmlFor="edit-nombre">Nombre</Label>
                            <Input
                                id="edit-nombre"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-descripcion">Descripción</Label>
                            <Input
                                id="edit-descripcion"
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-categoria">Categoría</Label>
                            <Select
                                value={formData.categoria}
                                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-precio">Precio</Label>
                            <Input
                                id="edit-precio"
                                type="number"
                                step="0.01"
                                value={formData.precio}
                                onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Actualizar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
