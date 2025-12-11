import React, { useState } from 'react';
import { Save, Loader2, Shield, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { FormInput } from '../ui/FormInput';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { User } from '../../services/auth.service';
import authService from '../../services/auth.service';
import { toast } from 'sonner';

export interface SecurityState {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    twoFactorEnabled: boolean;
}

interface SettingsSecurityProps {
    user: User | null;
    security: SecurityState;
    onUpdate: (security: SecurityState) => void;
    onError: (error: string) => void;
    onSuccess: (message: string) => void;
}

export function SettingsSecurity({ user, security, onUpdate, onError, onSuccess }: SettingsSecurityProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSave = async () => {
        if (security.newPassword && security.newPassword !== security.confirmPassword) {
            onError('Las contraseñas no coinciden');
            return;
        }

        if (security.newPassword && security.newPassword.length < 6) {
            onError('La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }

        setIsSaving(true);
        try {
            await authService.changePassword(security.currentPassword, security.newPassword);
            onSuccess('Contraseña actualizada correctamente');
            onUpdate({
                ...security,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (err: any) {
            const errorMessage = err.message || 'Error al actualizar seguridad';
            onError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const PasswordInput = ({
        id,
        label,
        value,
        onChange,
        show,
        onToggleShow
    }: {
        id: string;
        label: string;
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        show: boolean;
        onToggleShow: () => void;
    }) => (
        <div className="relative">
            <FormInput
                id={id}
                label={label}
                type={show ? "text" : "password"}
                value={value}
                onChange={onChange}
                className="pr-10"
            />
            <button
                type="button"
                onClick={onToggleShow}
                className="absolute right-3 top-[34px] text-muted-foreground hover:text-foreground focus:outline-none"
                tabIndex={-1}
            >
                {show ? (
                    <EyeOff className="h-4 w-4" />
                ) : (
                    <Eye className="h-4 w-4" />
                )}
            </button>
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <CardTitle>Seguridad y Permisos</CardTitle>
                </div>
                <CardDescription>
                    Gestiona tu contraseña y métodos de autenticación
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {user && (
                    <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                        <div className="text-sm font-medium mb-2">Información de tu cuenta</div>
                        <div className="text-sm text-muted-foreground">Correo: {user.correo}</div>
                        <div className="text-sm text-muted-foreground">Rol: {user.rol}</div>
                        <div className="text-sm text-muted-foreground">
                            Miembro desde:{' '}
                            {new Date(user.fechaCreacion).toLocaleDateString('es-MX')}
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <PasswordInput
                        id="current-password"
                        label="Contraseña Actual"
                        value={security.currentPassword}
                        onChange={(e) => onUpdate({ ...security, currentPassword: e.target.value as '' })}
                        show={showCurrentPassword}
                        onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PasswordInput
                            id="new-password"
                            label="Nueva Contraseña"
                            value={security.newPassword}
                            onChange={(e) => onUpdate({ ...security, newPassword: e.target.value as '' })}
                            show={showNewPassword}
                            onToggleShow={() => setShowNewPassword(!showNewPassword)}
                        />

                        <PasswordInput
                            id="confirm-password"
                            label="Confirmar Nueva Contraseña"
                            value={security.confirmPassword}
                            onChange={(e) => onUpdate({ ...security, confirmPassword: e.target.value as '' })}
                            show={showConfirmPassword}
                            onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                    </div>
                    {security.newPassword && security.newPassword.length < 6 && (
                        <p className="text-xs text-muted-foreground ml-1">
                            * La contraseña debe tener al menos 6 caracteres
                        </p>
                    )}
                </div>

                <div className="border-t pt-6">
                    <h3 className="mb-4 font-medium text-lg">Autenticación de Dos Factores</h3>
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <Label className="text-base">Habilitar 2FA</Label>
                            <div className="text-sm text-muted-foreground">
                                Mayor seguridad para tu cuenta (Próximamente)
                            </div>
                        </div>
                        <Switch
                            checked={security.twoFactorEnabled}
                            onCheckedChange={(checked) => onUpdate({ ...security, twoFactorEnabled: checked })}
                            disabled
                        />
                    </div>
                </div>

                <Button
                    className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                    onClick={handleSave}
                    disabled={isSaving || !security.newPassword || !security.currentPassword}
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
    );
}
