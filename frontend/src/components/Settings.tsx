import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import settingsService, { Setting } from '../services/settings.service';

// Import sub-components
import { SettingsGeneral } from './settings/SettingsGeneral';
import { SettingsAPIs } from './settings/SettingsAPIs';
import { SettingsNotifications } from './settings/SettingsNotifications';
import { SettingsSecurity, SecurityState } from './settings/SettingsSecurity';

export function Settings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // States
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

  const [notificationPrefs, setNotificationPrefs] = useState({
    campaignNotifications: true,
    conversionAlerts: true,
    dailyReports: false,
    errorAlerts: true,
    notificationEmail: '',
  });

  const [generalConfig, setGeneralConfig] = useState({
    companyName: 'TelePromo',
    timezone: 'bo',
    language: 'es',
    currency: 'bob',
    dailyLimit: 10000,
    hourlyLimit: 1000,
  });

  const [security, setSecurity] = useState<SecurityState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  });

  // Load initial settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const data = await settingsService.getAll();

        if (data) {
          setGeneralConfig(prev => ({
            ...prev,
            companyName: data.companyName || prev.companyName,
            timezone: data.timezone || prev.timezone,
            language: data.language || prev.language,
            currency: data.currency || prev.currency,
            dailyLimit: data.dailyLimit || prev.dailyLimit,
            hourlyLimit: data.hourlyLimit || prev.hourlyLimit,
          }));

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
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSave = async (settings: Setting[], successMessage: string) => {
    setError(null);
    setSuccess(null);
    try {
      await settingsService.update(settings);
      toast.success(successMessage);
      setSuccess(successMessage);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al guardar configuración';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleSecurityError = (msg: string) => {
    setError(msg);
    toast.error(msg);
  };

  const handleSecuritySuccess = (msg: string) => {
    setSuccess(msg);
    toast.success(msg);
    setError(null);
    setTimeout(() => setSuccess(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground mt-1">Administra las preferencias y opciones del sistema</p>
        </div>
      </div>

      {success && (
        <Alert className="bg-green-500/10 border-green-500/20 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-700 font-medium">Operación Exitosa</AlertTitle>
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api">APIs</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="outline-none">
          <SettingsGeneral
            user={user}
            config={generalConfig}
            onUpdate={setGeneralConfig}
            onSave={handleSave}
          />
        </TabsContent>

        <TabsContent value="api" className="outline-none">
          <SettingsAPIs
            config={apiConfig}
            onUpdate={setApiConfig}
            onSave={handleSave}
          />
        </TabsContent>

        <TabsContent value="notifications" className="outline-none">
          <SettingsNotifications
            prefs={notificationPrefs}
            onUpdate={setNotificationPrefs}
            onSave={handleSave}
          />
        </TabsContent>

        <TabsContent value="security" className="outline-none">
          <SettingsSecurity
            user={user}
            security={security}
            onUpdate={setSecurity}
            onError={handleSecurityError}
            onSuccess={handleSecuritySuccess}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

