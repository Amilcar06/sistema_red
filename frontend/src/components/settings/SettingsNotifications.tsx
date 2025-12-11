import React, { useState } from 'react';
import { Save, Loader2, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { FormInput } from '../ui/FormInput';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Setting } from '../../services/settings.service';

interface NotificationPrefs {
    campaignNotifications: boolean;
    conversionAlerts: boolean;
    dailyReports: boolean;
    errorAlerts: boolean;
    notificationEmail: string;
}

interface SettingsNotificationsProps {
    prefs: NotificationPrefs;
    onUpdate: (prefs: NotificationPrefs) => void;
    onSave: (settings: Setting[], message: string) => Promise<void>;
}

export function SettingsNotifications({ prefs, onUpdate, onSave }: SettingsNotificationsProps) {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const settingsToSave: Setting[] = [
                { clave: 'campaignNotifications', valor: prefs.campaignNotifications, categoria: 'notificaciones' },
                { clave: 'conversionAlerts', valor: prefs.conversionAlerts, categoria: 'notificaciones' },
                { clave: 'dailyReports', valor: prefs.dailyReports, categoria: 'notificaciones' },
                { clave: 'errorAlerts', valor: prefs.errorAlerts, categoria: 'notificaciones' },
                { clave: 'notificationEmail', valor: prefs.notificationEmail, categoria: 'notificaciones' },
            ];

            await onSave(settingsToSave, 'Preferencias de notificaciones guardadas');
        } catch (error) {
            // handled by parent
        } finally {
            setIsSaving(false);
        }
    };

    const NotificationSwitch = ({
        label,
        description,
        checked,
        onCheckedChange
    }: {
        label: string;
        description: string;
        checked: boolean;
        onCheckedChange: (checked: boolean) => void
    }) => (
        <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
                <Label className="text-base">{label}</Label>
                <div className="text-sm text-muted-foreground">{description}</div>
            </div>
            <Switch checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    <CardTitle>Preferencias de Notificaciones</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <NotificationSwitch
                        label="Notificaciones de Campañas"
                        description="Recibe alertas cuando una campaña se complete"
                        checked={prefs.campaignNotifications}
                        onCheckedChange={(checked) => onUpdate({ ...prefs, campaignNotifications: checked })}
                    />
                    <NotificationSwitch
                        label="Alertas de Conversión"
                        description="Notificación cuando un cliente realice una conversión"
                        checked={prefs.conversionAlerts}
                        onCheckedChange={(checked) => onUpdate({ ...prefs, conversionAlerts: checked })}
                    />
                    <NotificationSwitch
                        label="Reportes Diarios"
                        description="Recibe un resumen diario por email"
                        checked={prefs.dailyReports}
                        onCheckedChange={(checked) => onUpdate({ ...prefs, dailyReports: checked })}
                    />
                    <NotificationSwitch
                        label="Alertas de Error"
                        description="Notificación inmediata cuando falle un envío"
                        checked={prefs.errorAlerts}
                        onCheckedChange={(checked) => onUpdate({ ...prefs, errorAlerts: checked })}
                    />
                </div>

                <div className="border-t pt-6">
                    <FormInput
                        id="notification-email"
                        label="Email para Notificaciones"
                        type="email"
                        placeholder="admin@empresa.com"
                        value={prefs.notificationEmail}
                        onChange={(e) => onUpdate({ ...prefs, notificationEmail: e.target.value })}
                    />
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
                            Guardar Preferencias
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
