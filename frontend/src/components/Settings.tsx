import React, { useState, useEffect } from 'react';
import { Save, Bell, Smartphone, Database, Shield, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import settingsService, { Setting } from '../services/settings.service';
import authService from '../services/auth.service';

export function Settings() {
  const { user, refreshUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Configuración de APIs (solo lectura para ahora - se guardaría en backend)
  const [apiConfig, setApiConfig] = useState({
    twilioSid: '',
    twilioToken: '',
    twilioNumber: '',
    whatsappToken: '',
    whatsappPhoneId: '',
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPass: '',
  });

  // Preferencias de notificaciones
  const [notificationPrefs, setNotificationPrefs] = useState({
    campaignNotifications: true,
    conversionAlerts: true,
    dailyReports: false,
    errorAlerts: true,
    notificationEmail: '',
  });

  // Configuración general
  const [generalConfig, setGeneralConfig] = useState({
    companyName: 'TelePromo',
    timezone: 'bo',
    language: 'es',
    currency: 'bob',
    dailyLimit: 10000,
    hourlyLimit: 1000,
  });

  // Seguridad
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  });

  // Cargar configuración inicial
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const data = await settingsService.getAll();

        // Mapear datos del backend a los estados locales
        if (data) {
          // Configuración General
          setGeneralConfig(prev => ({
            ...prev,
            companyName: data.companyName || prev.companyName,
            timezone: data.timezone || prev.timezone,
            language: data.language || prev.language,
            currency: data.currency || prev.currency,
            dailyLimit: data.dailyLimit || prev.dailyLimit,
            hourlyLimit: data.hourlyLimit || prev.hourlyLimit,
          }));

          // Configuración API
          setApiConfig(prev => ({
            ...prev,
            twilioSid: data.twilioSid || '',
            twilioToken: data.twilioToken || '',
            twilioNumber: data.twilioNumber || '',
            whatsappToken: data.whatsappToken || '',
            whatsappPhoneId: data.whatsappPhoneId || '',
            smtpHost: data.smtpHost || '',
            smtpPort: data.smtpPort || '',
            smtpUser: data.smtpUser || '',
            smtpPass: data.smtpPass || '',
          }));

          // Preferencias Notificaciones
          setNotificationPrefs(prev => ({
            ...prev,
            campaignNotifications: data.campaignNotifications ?? prev.campaignNotifications,
            conversionAlerts: data.conversionAlerts ?? prev.conversionAlerts,
            dailyReports: data.dailyReports ?? prev.dailyReports,
            errorAlerts: data.errorAlerts ?? prev.errorAlerts,
            notificationEmail: data.notificationEmail || user?.correo || '',
          }));
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        // No mostrar error al usuario en carga inicial para no ser intrusivo
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const saveSettings = async (settings: Setting[], successMessage: string) => {
    try {
      await settingsService.update(settings);
      toast.success(successMessage);
      setSuccess(successMessage);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al guardar configuración';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleSaveApiConfig = async () => {
    setIsSaving(true);
    setSuccess(null);
    setError(null);

    const settingsToSave: Setting[] = [
      { clave: 'twilioSid', valor: apiConfig.twilioSid, categoria: 'api' },
      { clave: 'twilioToken', valor: apiConfig.twilioToken, categoria: 'api' },
      { clave: 'twilioNumber', valor: apiConfig.twilioNumber, categoria: 'api' },
      { clave: 'whatsappToken', valor: apiConfig.whatsappToken, categoria: 'api' },
      { clave: 'whatsappPhoneId', valor: apiConfig.whatsappPhoneId, categoria: 'api' },
      { clave: 'smtpHost', valor: apiConfig.smtpHost, categoria: 'api' },
      { clave: 'smtpPort', valor: apiConfig.smtpPort, categoria: 'api' },
      { clave: 'smtpUser', valor: apiConfig.smtpUser, categoria: 'api' },
      { clave: 'smtpPass', valor: apiConfig.smtpPass, categoria: 'api' },
    ];

    await saveSettings(settingsToSave, 'Configuración de APIs guardada');
    setIsSaving(false);
  };

  const handleSaveNotificationPrefs = async () => {
    setIsSaving(true);
    setSuccess(null);
    setError(null);

    const settingsToSave: Setting[] = [
      { clave: 'campaignNotifications', valor: notificationPrefs.campaignNotifications, categoria: 'notificaciones' },
      { clave: 'conversionAlerts', valor: notificationPrefs.conversionAlerts, categoria: 'notificaciones' },
      { clave: 'dailyReports', valor: notificationPrefs.dailyReports, categoria: 'notificaciones' },
      { clave: 'errorAlerts', valor: notificationPrefs.errorAlerts, categoria: 'notificaciones' },
      { clave: 'notificationEmail', valor: notificationPrefs.notificationEmail, categoria: 'notificaciones' },
    ];

    await saveSettings(settingsToSave, 'Preferencias de notificaciones guardadas');
    setIsSaving(false);
  };

  const handleSaveSecurity = async () => {
    if (security.newPassword && security.newPassword !== security.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (security.newPassword && security.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsSaving(true);
    setSuccess(null);
    setError(null);

    // Nota: La seguridad se maneja diferente, usualmente con un endpoint específico de cambio de contraseña
    // Por ahora simularemos que se guarda como configuración, pero idealmente debería ser authService.changePassword
    try {
      await authService.changePassword(security.currentPassword, security.newPassword);
      toast.success('Contraseña actualizada correctamente');
      setSuccess('Contraseña actualizada correctamente');
      setSecurity({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: security.twoFactorEnabled,
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar seguridad';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGeneralConfig = async () => {
    setIsSaving(true);
    setSuccess(null);
    setError(null);

    const settingsToSave: Setting[] = [
      { clave: 'companyName', valor: generalConfig.companyName, categoria: 'general' },
      { clave: 'timezone', valor: generalConfig.timezone, categoria: 'general' },
      { clave: 'language', valor: generalConfig.language, categoria: 'general' },
      { clave: 'currency', valor: generalConfig.currency, categoria: 'general' },
      { clave: 'dailyLimit', valor: generalConfig.dailyLimit, categoria: 'general' },
      { clave: 'hourlyLimit', valor: generalConfig.hourlyLimit, categoria: 'general' },
    ];

    await saveSettings(settingsToSave, 'Configuración general guardada');
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Configuración</h1>
        <p className="text-gray-600">Administra las opciones del sistema</p>
      </div>

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api">APIs</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                <CardTitle>Configuración General</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {user && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Usuario Actual</div>
                  <div className="font-medium">{user.nombre}</div>
                  <div className="text-sm text-gray-600">{user.correo}</div>
                  <div className="text-xs text-gray-500 mt-1">Rol: {user.rol}</div>
                </div>
              )}

              <div>
                <Label htmlFor="company-name">Nombre de la Empresa</Label>
                <Input
                  id="company-name"
                  placeholder="TelePromo"
                  value={generalConfig.companyName}
                  onChange={(e) =>
                    setGeneralConfig({ ...generalConfig, companyName: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="timezone">Zona Horaria</Label>
                <Select
                  value={generalConfig.timezone}
                  onValueChange={(value) =>
                    setGeneralConfig({ ...generalConfig, timezone: value })
                  }
                >
                  <SelectTrigger className="mt-2">
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

              <div>
                <Label htmlFor="language">Idioma</Label>
                <Select
                  value={generalConfig.language}
                  onValueChange={(value) =>
                    setGeneralConfig({ ...generalConfig, language: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="currency">Moneda</Label>
                <Select
                  value={generalConfig.currency}
                  onValueChange={(value) =>
                    setGeneralConfig({ ...generalConfig, currency: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bob">Bs - Boliviano</SelectItem>
                    <SelectItem value="mxn">MXN - Peso Mexicano</SelectItem>
                    <SelectItem value="usd">USD - Dólar Americano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-6">
                <h3 className="mb-4">Límites de Envío</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="daily-limit">Límite Diario de Mensajes</Label>
                    <Input
                      id="daily-limit"
                      type="number"
                      value={generalConfig.dailyLimit}
                      onChange={(e) =>
                        setGeneralConfig({
                          ...generalConfig,
                          dailyLimit: parseInt(e.target.value) || 0,
                        })
                      }
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hourly-limit">Límite por Hora</Label>
                    <Input
                      id="hourly-limit"
                      type="number"
                      value={generalConfig.hourlyLimit}
                      onChange={(e) =>
                        setGeneralConfig({
                          ...generalConfig,
                          hourlyLimit: parseInt(e.target.value) || 0,
                        })
                      }
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveGeneralConfig}
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
        </TabsContent>

        <TabsContent value="api" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                <CardTitle>Configuración de APIs de Mensajería</CardTitle>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Estas configuraciones se gestionan desde las variables de entorno del servidor
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertDescription>
                  La configuración de APIs (Twilio, WhatsApp, SMTP) se realiza desde las variables
                  de entorno del backend. Contacta al administrador del sistema para modificarlas.
                </AlertDescription>
              </Alert>

              {/* Twilio SMS */}
              <div className="space-y-4">
                <h3 className="text-lg">Twilio (SMS)</h3>
                <div>
                  <Label htmlFor="twilio-sid">Account SID</Label>
                  <Input
                    id="twilio-sid"
                    type="password"
                    placeholder="AC..."
                    value={apiConfig.twilioSid}
                    onChange={(e) => setApiConfig({ ...apiConfig, twilioSid: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="twilio-token">Auth Token</Label>
                  <Input
                    id="twilio-token"
                    type="password"
                    placeholder="Token..."
                    value={apiConfig.twilioToken}
                    onChange={(e) => setApiConfig({ ...apiConfig, twilioToken: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="twilio-number">Número de Teléfono</Label>
                  <Input
                    id="twilio-number"
                    placeholder="+1234567890"
                    value={apiConfig.twilioNumber}
                    onChange={(e) => setApiConfig({ ...apiConfig, twilioNumber: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg">WhatsApp Business API</h3>
                <div>
                  <Label htmlFor="whatsapp-token">Access Token</Label>
                  <Input
                    id="whatsapp-token"
                    type="password"
                    placeholder="Token..."
                    value={apiConfig.whatsappToken}
                    onChange={(e) => setApiConfig({ ...apiConfig, whatsappToken: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp-phone">Phone Number ID</Label>
                  <Input
                    id="whatsapp-phone"
                    type="password"
                    placeholder="ID..."
                    value={apiConfig.whatsappPhoneId}
                    onChange={(e) => setApiConfig({ ...apiConfig, whatsappPhoneId: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg">SMTP (Email)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp-host">SMTP Host</Label>
                    <Input
                      id="smtp-host"
                      placeholder="smtp.example.com"
                      value={apiConfig.smtpHost}
                      onChange={(e) => setApiConfig({ ...apiConfig, smtpHost: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp-port">Puerto</Label>
                    <Input
                      id="smtp-port"
                      placeholder="587"
                      value={apiConfig.smtpPort}
                      onChange={(e) => setApiConfig({ ...apiConfig, smtpPort: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="smtp-user">Usuario</Label>
                  <Input
                    id="smtp-user"
                    type="email"
                    placeholder="user@example.com"
                    value={apiConfig.smtpUser}
                    onChange={(e) => setApiConfig({ ...apiConfig, smtpUser: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp-pass">Contraseña</Label>
                  <Input
                    id="smtp-pass"
                    type="password"
                    placeholder="********"
                    value={apiConfig.smtpPass}
                    onChange={(e) => setApiConfig({ ...apiConfig, smtpPass: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveApiConfig}
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
                    Guardar Configuración de APIs
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <CardTitle>Preferencias de Notificaciones</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div>Notificaciones de Campañas</div>
                  <div className="text-sm text-gray-600">
                    Recibe alertas cuando una campaña se complete
                  </div>
                </div>
                <Switch
                  checked={notificationPrefs.campaignNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationPrefs({
                      ...notificationPrefs,
                      campaignNotifications: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div>Alertas de Conversión</div>
                  <div className="text-sm text-gray-600">
                    Notificación cuando un cliente realice una conversión
                  </div>
                </div>
                <Switch
                  checked={notificationPrefs.conversionAlerts}
                  onCheckedChange={(checked) =>
                    setNotificationPrefs({
                      ...notificationPrefs,
                      conversionAlerts: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div>Reportes Diarios</div>
                  <div className="text-sm text-gray-600">
                    Recibe un resumen diario por email
                  </div>
                </div>
                <Switch
                  checked={notificationPrefs.dailyReports}
                  onCheckedChange={(checked) =>
                    setNotificationPrefs({
                      ...notificationPrefs,
                      dailyReports: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div>Alertas de Error</div>
                  <div className="text-sm text-gray-600">
                    Notificación inmediata cuando falle un envío
                  </div>
                </div>
                <Switch
                  checked={notificationPrefs.errorAlerts}
                  onCheckedChange={(checked) =>
                    setNotificationPrefs({
                      ...notificationPrefs,
                      errorAlerts: checked,
                    })
                  }
                />
              </div>

              <div className="border-t pt-6">
                <Label htmlFor="notification-email">Email para Notificaciones</Label>
                <Input
                  id="notification-email"
                  type="email"
                  placeholder="admin@empresa.com"
                  value={notificationPrefs.notificationEmail}
                  onChange={(e) =>
                    setNotificationPrefs({
                      ...notificationPrefs,
                      notificationEmail: e.target.value,
                    })
                  }
                  className="mt-2"
                />
              </div>

              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveNotificationPrefs}
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
        </TabsContent>

        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <CardTitle>Seguridad y Permisos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {user && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium mb-2">Información de tu cuenta</div>
                  <div className="text-sm text-gray-600">Correo: {user.correo}</div>
                  <div className="text-sm text-gray-600">Rol: {user.rol}</div>
                  <div className="text-sm text-gray-600">
                    Miembro desde:{' '}
                    {new Date(user.fechaCreacion).toLocaleDateString('es-MX')}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="current-password">Contraseña Actual</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={security.currentPassword}
                  onChange={(e) =>
                    setSecurity({ ...security, currentPassword: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="new-password">Nueva Contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={security.newPassword}
                  onChange={(e) =>
                    setSecurity({ ...security, newPassword: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={security.confirmPassword}
                  onChange={(e) =>
                    setSecurity({ ...security, confirmPassword: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="mb-4">Autenticación de Dos Factores</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div>Habilitar 2FA</div>
                    <div className="text-sm text-gray-600">
                      Mayor seguridad para tu cuenta (Próximamente)
                    </div>
                  </div>
                  <Switch
                    checked={security.twoFactorEnabled}
                    onCheckedChange={(checked) =>
                      setSecurity({ ...security, twoFactorEnabled: checked })
                    }
                    disabled
                  />
                </div>
              </div>

              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveSecurity}
                disabled={isSaving || !security.newPassword}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Actualizar Seguridad
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

