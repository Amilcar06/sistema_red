import { LucideIcon, Users, Megaphone, MessageSquare, Package } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {Icon && (
        <div className="rounded-full bg-muted p-4 mb-4">
          <Icon className="w-8 h-8 text-muted-foreground/50" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="default">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Empty states específicos para componentes comunes

export function EmptyClients({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No hay clientes"
      description="Comienza agregando tu primer cliente a la base de datos."
      action={{
        label: 'Agregar Cliente',
        onClick: onCreate,
      }}
    />
  );
}

export function EmptyPromotions({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon={Megaphone}
      title="No hay promociones"
      description="Crea tu primera promoción para comenzar a enviar mensajes a tus clientes."
      action={{
        label: 'Crear Promoción',
        onClick: onCreate,
      }}
    />
  );
}

export function EmptyMessages() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="No hay mensajes enviados"
      description="El historial de mensajes aparecerá aquí una vez que comiences a enviar notificaciones."
    />
  );
}

export function EmptyProducts({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon={Package}
      title="No hay productos"
      description="Agrega productos para asociarlos con promociones."
      action={{
        label: 'Agregar Producto',
        onClick: onCreate,
      }}
    />
  );
}

