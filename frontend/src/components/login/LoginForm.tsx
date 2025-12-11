import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff, CheckSquare, Square } from 'lucide-react';
import { cn } from '../ui/utils';

interface LoginFormInputs {
    correo: string;
    contrasena: string;
}

export function LoginForm() {
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        clearErrors,
        setValue
    } = useForm<LoginFormInputs>({
        mode: 'onChange', // Validar al escribir
    });

    const onSubmit = async (data: LoginFormInputs) => {
        setAuthError(null);
        setIsLoading(true);

        // Protección y Limpieza de datos
        const cleanData = {
            correo: data.correo.trim().toLowerCase(),
            contrasena: data.contrasena.trim(),
        };

        try {
            await login(cleanData);
            // La redirección es automática por AuthContext
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err.message || 'Error al iniciar sesión';
            setAuthError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = (e: React.MouseEvent) => {
        e.preventDefault();
        console.log("Navegar a recuperación de contraseña");
    };

    // Helper para limpiar errores al escribir (mejor UX)
    const handleInputChange = (field: keyof LoginFormInputs, e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(field, e.target.value);
        if (authError) setAuthError(null);
        clearErrors(field);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {authError && (
                <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 text-destructive mb-4" aria-live="assertive">
                    <AlertDescription>{authError}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-5">
                {/* Email Field */}
                <div className="space-y-1.5">
                    <Label htmlFor="correo" className="text-sm font-semibold text-foreground/80 ml-1">
                        Correo electrónico
                    </Label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Mail className="h-5 w-5" />
                        </div>
                        <Input
                            id="correo"
                            type="email"
                            placeholder="nombre@empresa.com"
                            autoComplete="email"
                            disabled={isLoading}
                            className={cn(
                                "pl-10 h-11 transition-all bg-background border-input/60 focus:border-primary focus:ring-primary/20",
                                errors.correo && "border-destructive focus:border-destructive focus:ring-destructive/20"
                            )}
                            {...register('correo', {
                                required: 'El correo electrónico es obligatorio',
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                    message: 'Formato de correo inválido'
                                },
                                onChange: (e) => {
                                    if (authError) setAuthError(null);
                                }
                            })}
                            aria-invalid={errors.correo ? "true" : "false"}
                        />
                    </div>
                    {errors.correo && (
                        <p className="text-xs text-destructive mt-1 ml-1 font-medium" role="alert">{errors.correo.message}</p>
                    )}
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between ml-1">
                        <Label htmlFor="contrasena" className="text-sm font-semibold text-foreground/80">
                            Contraseña
                        </Label>
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-xs font-medium text-primary hover:text-primary/70 transition-colors focus:outline-none hover:underline"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Lock className="h-5 w-5" />
                        </div>
                        <Input
                            id="contrasena"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            disabled={isLoading}
                            className={cn(
                                "pl-10 pr-10 h-11 transition-all bg-background border-input/60 focus:border-primary focus:ring-primary/20",
                                errors.contrasena && "border-destructive focus:border-destructive focus:ring-destructive/20"
                            )}
                            {...register('contrasena', {
                                required: 'La contraseña es obligatoria',
                                minLength: {
                                    value: 6,
                                    message: 'La contraseña debe tener al menos 6 caracteres'
                                },
                                onChange: (e) => {
                                    if (authError) setAuthError(null);
                                }
                            })}
                            aria-invalid={errors.contrasena ? "true" : "false"}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    {errors.contrasena && (
                        <p className="text-xs text-destructive mt-1 ml-1 font-medium" role="alert">{errors.contrasena.message}</p>
                    )}
                </div>

                {/* Keep Session Toggle */}
                <div className="flex items-center pt-2">
                    <button
                        type="button"
                        onClick={() => setRememberMe(!rememberMe)}
                        className="flex items-center space-x-2.5 group focus:outline-none"
                        role="checkbox"
                        aria-checked={rememberMe}
                    >
                        <div className={cn(
                            "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                            rememberMe ? "bg-primary border-primary text-primary-foreground" : "border-input bg-background group-hover:border-primary/50"
                        )}>
                            {rememberMe && <CheckSquare className="h-3.5 w-3.5" />}
                        </div>
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            Mantener sesión iniciada
                        </span>
                    </button>
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-11 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                disabled={isLoading}
                aria-label="Iniciar sesión en TelePromo"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Iniciando sesión...
                    </>
                ) : (
                    <>
                        Iniciar sesión
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                )}
            </Button>
        </form>
    );
}
