import React, { useState } from 'react';
import { Save, Loader2, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { FormInput } from '../ui/FormInput';
import { Label } from '../ui/label';
import { User } from '../../services/auth.service';
import { Setting } from '../../services/settings.service';
import { toast } from 'sonner';

interface GeneralConfig {
    companyName: string;
    timezone: string;
    language: string;
    currency: string;
    dailyLimit: number;
    hourlyLimit: number;
}

interface SettingsGeneralProps {
    user: User | null;
    config: GeneralConfig;
    onUpdate: (config: GeneralConfig) => void;
    onSave: (settings: Setting[], message: string) => Promise<void>;
}

export function SettingsGeneral({ user, config, onUpdate, onSave }: SettingsGeneralProps) {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const settingsToSave: Setting[] = [
                { clave: 'companyName', valor: config.companyName, categoria: 'general' },
                { clave: 'timezone', valor: config.timezone, categoria: 'general' },
                { clave: 'language', valor: config.language, categoria: 'general' },
                { clave: 'currency', valor: config.currency, categoria: 'general' },
                { clave: 'dailyLimit', valor: config.dailyLimit, categoria: 'general' },
                { clave: 'hourlyLimit', valor: config.hourlyLimit, categoria: 'general' },
            ];

            await onSave(settingsToSave, 'Configuración general guardada');
        } catch (error) {
            // Error handled by parent
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    <CardTitle>Configuración General</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {user && (
                    <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                        <div className="text-sm text-muted-foreground mb-1">Usuario Actual</div>
                        <div className="font-medium text-foreground">{user.nombre}</div>
                        <div className="text-sm text-muted-foreground">{user.correo}</div>
                        <div className="text-xs text-muted-foreground/80 mt-1">Rol: {user.rol}</div>
                    </div>
                )}

                <FormInput
                    id="company-name"
                    label="Nombre de la Empresa"
                    placeholder="TelePromo"
                    value={config.companyName}
                    onChange={(e) => onUpdate({ ...config, companyName: e.target.value })}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="timezone">Zona Horaria</Label>
                        <Select
                            value={config.timezone}
                            onValueChange={(value) => onUpdate({ ...config, timezone: value })}
                        >
                            <SelectTrigger id="timezone">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bo">La Paz (GMT-4)</SelectItem>
                                <SelectItem value="mx">Ciudad de México (GMT-6)</SelectItem>
                                <SelectItem value="ny">Nueva York (GMT-5)</SelectItem>
                                <SelectItem value="la">Los Ángeles (GMT-8)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="language">Idioma</Label>
                        <Select
                            value={config.language}
                            onValueChange={(value) => onUpdate({ ...config, language: value })}
                        >
                            <SelectTrigger id="language">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="es">Español</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="currency">Moneda</Label>
                        <Select
                            value={config.currency}
                            onValueChange={(value) => onUpdate({ ...config, currency: value })}
                        >
                            <SelectTrigger id="currency">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bob">Bs - Boliviano</SelectItem>
                                <SelectItem value="mxn">MXN - Peso Mexicano</SelectItem>
                                <SelectItem value="usd">USD - Dólar Americano</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>


                <div className="border-t pt-6">
                    <h3 className="mb-4 font-medium text-lg">Límites de Envío</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            id="daily-limit"
                            label="Límite Diario de Mensajes"
                            type="number"
                            value={config.dailyLimit}
                            onChange={(e) => onUpdate({ ...config, dailyLimit: parseInt(e.target.value) || 0 })}
                        />
                        <FormInput
                            id="hourly-limit"
                            label="Límite por Hora"
                            type="number"
                            value={config.hourlyLimit}
                            onChange={(e) => onUpdate({ ...config, hourlyLimit: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                </div>

                <Button
                    className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Configuración General
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
