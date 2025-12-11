import React, { useState } from 'react';
import { Save, Loader2, Smartphone, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { FormInput } from '../ui/FormInput';
import { Setting } from '../../services/settings.service';
import { cn } from '../ui/utils';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion";

interface ApiConfig {
    twilioSid: string;
    twilioToken: string;
    twilioNumber: string;
    whatsappToken: string;
    whatsappPhoneId: string;
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpPass: string;
}

interface SettingsAPIsProps {
    config: ApiConfig;
    onUpdate: (config: ApiConfig) => void;
    onSave: (settings: Setting[], message: string) => Promise<void>;
}

export function SettingsAPIs({ config, onUpdate, onSave }: SettingsAPIsProps) {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const settingsToSave: Setting[] = [
                { clave: 'twilioSid', valor: config.twilioSid, categoria: 'api' },
                { clave: 'twilioToken', valor: config.twilioToken, categoria: 'api' },
                { clave: 'twilioNumber', valor: config.twilioNumber, categoria: 'api' },
                { clave: 'whatsappToken', valor: config.whatsappToken, categoria: 'api' },
                { clave: 'whatsappPhoneId', valor: config.whatsappPhoneId, categoria: 'api' },
                { clave: 'smtpHost', valor: config.smtpHost, categoria: 'api' },
                { clave: 'smtpPort', valor: config.smtpPort, categoria: 'api' },
                { clave: 'smtpUser', valor: config.smtpUser, categoria: 'api' },
                { clave: 'smtpPass', valor: config.smtpPass, categoria: 'api' },
            ];

            await onSave(settingsToSave, 'Configuración de APIs guardada');
        } catch (error) {
            // handled by parent
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-primary" />
                    <CardTitle>Configuración de APIs de Mensajería</CardTitle>
                </div>
                <CardDescription>
                    Credenciales para los servicios de envío de mensajes y correos
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Modo Solo Lectura (Recomendado)</AlertTitle>
                    <AlertDescription>
                        Por seguridad, se recomienda gestionar estas credenciales mediante variables de entorno en el servidor.
                    </AlertDescription>
                </Alert>

                <Accordion type="single" collapsible defaultValue="twilio" className="w-full">
                    {/* Twilio SMS */}
                    <AccordionItem value="twilio">
                        <AccordionTrigger>Twilio (SMS)</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                            <FormInput
                                id="twilio-sid"
                                label="Account SID"
                                type="password"
                                value={config.twilioSid}
                                onChange={(e) => onUpdate({ ...config, twilioSid: e.target.value })}
                                className="opacity-75"
                            />
                            <FormInput
                                id="twilio-token"
                                label="Auth Token"
                                type="password"
                                value={config.twilioToken}
                                onChange={(e) => onUpdate({ ...config, twilioToken: e.target.value })}
                                className="opacity-75"
                            />
                            <FormInput
                                id="twilio-number"
                                label="Número de Teléfono"
                                value={config.twilioNumber}
                                onChange={(e) => onUpdate({ ...config, twilioNumber: e.target.value })}
                                className="opacity-75"
                            />
                        </AccordionContent>
                    </AccordionItem>

                    {/* WhatsApp */}
                    <AccordionItem value="whatsapp">
                        <AccordionTrigger>WhatsApp Business API</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                            <FormInput
                                id="whatsapp-token"
                                label="Access Token"
                                type="password"
                                value={config.whatsappToken}
                                onChange={(e) => onUpdate({ ...config, whatsappToken: e.target.value })}
                                className="opacity-75"
                            />
                            <FormInput
                                id="whatsapp-phone"
                                label="Phone Number ID"
                                type="password"
                                value={config.whatsappPhoneId}
                                onChange={(e) => onUpdate({ ...config, whatsappPhoneId: e.target.value })}
                                className="opacity-75"
                            />
                        </AccordionContent>
                    </AccordionItem>

                    {/* SMTP */}
                    <AccordionItem value="smtp">
                        <AccordionTrigger>SMTP (Email)</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    id="smtp-host"
                                    label="SMTP Host"
                                    value={config.smtpHost}
                                    onChange={(e) => onUpdate({ ...config, smtpHost: e.target.value })}
                                    className="opacity-75"
                                />
                                <FormInput
                                    id="smtp-port"
                                    label="Puerto"
                                    value={config.smtpPort}
                                    onChange={(e) => onUpdate({ ...config, smtpPort: e.target.value })}
                                    className="opacity-75"
                                />
                            </div>
                            <FormInput
                                id="smtp-user"
                                label="Usuario"
                                type="email"
                                value={config.smtpUser}
                                onChange={(e) => onUpdate({ ...config, smtpUser: e.target.value })}
                                className="opacity-75"
                            />
                            <FormInput
                                id="smtp-pass"
                                label="Contraseña"
                                type="password"
                                value={config.smtpPass}
                                onChange={(e) => onUpdate({ ...config, smtpPass: e.target.value })}
                                className="opacity-75"
                            />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

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
                            Guardar Configuración de APIs
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
