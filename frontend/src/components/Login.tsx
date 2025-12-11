import { LoginForm } from './login/LoginForm';

export function Login() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-xl overflow-hidden border border-border mx-auto" style={{ maxWidth: '24rem' }}>
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <img
                src="/Logo.png"
                alt="TelePromo Logo"
                className="w-40 h-auto object-contain hover:scale-105 transition-transform duration-300 mx-auto"
              />
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              TelePromo
            </h1>
            <p className="text-sm text-muted-foreground">
              Ingresa tus credenciales para acceder
            </p>
          </div>

          <LoginForm />

          <div className="text-center text-xs text-muted-foreground pt-2">
            ¿No tienes una cuenta?{' '}
            <a href="#" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Contacta al administrador
            </a>
          </div>
        </div>

        {/* Decorative bottom bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-primary" />
      </div>
    </div>
  );
}
