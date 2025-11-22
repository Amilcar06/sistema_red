import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Mail, Phone, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import notificationService, { Notification, SendNotificationData } from '../services/notification.service';
import promotionService from '../services/promotion.service';
import { toast } from 'sonner';

interface MessageFormData {
  channel: 'SMS' | 'WHATSAPP' | 'EMAIL' | 'CORREO';
  promotionId: string;
  message: string;
  title?: string;
}

const INITIAL_FORM_DATA: MessageFormData = {
  channel: 'SMS',
  promotionId: '',
  message: '',
  title: '',
};

export function MessageCenter() {
  const [messages, setMessages] = useState<Notification[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState<MessageFormData>(INITIAL_FORM_DATA);
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Cargar historial
  const loadHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const filters: any = {};
      if (filterChannel !== 'all') {
        filters.channel = filterChannel === 'CORREO' ? 'EMAIL' : filterChannel;
      }
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }
      
      const response = await notificationService.getHistory(filters);
      setMessages(response.data || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar historial';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar promociones
  const loadPromotions = async () => {
    try {
      const response = await promotionService.findAll();
      setPromotions(response.data || []);
    } catch (err) {
      console.error('Error al cargar promociones:', err);
    }
  };

  useEffect(() => {
    loadHistory();
    loadPromotions();
  }, [filterChannel, filterStatus]);

  // Enviar mensaje individual
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const notificationData: SendNotificationData = {
        promotionId: formData.promotionId || undefined,
        channel: formData.channel === 'EMAIL' ? 'CORREO' : formData.channel,
        message: formData.message,
        title: formData.title || undefined,
      };

      await notificationService.send(notificationData);
      toast.success('Mensaje enviado correctamente');
      setFormData(INITIAL_FORM_DATA);
      await loadHistory();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al enviar mensaje';
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  // Enviar masivo
  const handleSendBulk = async () => {
    if (!formData.promotionId || formData.promotionId === 'none') {
      toast.error('Selecciona una promoción para envío masivo');
      return;
    }

    if (!formData.message) {
      toast.error('El mensaje es requerido');
      return;
    }

    if (!confirm(`¿Estás seguro de enviar este mensaje a todos los clientes de la promoción?`)) {
      return;
    }

    setIsSending(true);

    try {
      const channel = formData.channel === 'EMAIL' ? 'CORREO' : formData.channel;
      await notificationService.sendBulk(
        formData.promotionId,
        channel as 'SMS' | 'WHATSAPP' | 'CORREO',
        formData.message
      );
      toast.success('Mensajes enviados correctamente');
      setFormData(INITIAL_FORM_DATA);
      await loadHistory();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al enviar mensajes masivos';
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'SMS':
        return <Phone className="w-4 h-4" />;
      case 'WHATSAPP':
        return <MessageSquare className="w-4 h-4" />;
      case 'CORREO':
      case 'EMAIL':
        return <Mail className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ENVIADA':
      case 'ENTREGADA':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'PENDIENTE':
      case 'EN_COLA':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'FALLIDA':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      'ENVIADA': { label: 'Enviada', className: 'bg-green-100 text-green-800' },
      'ENTREGADA': { label: 'Entregada', className: 'bg-blue-100 text-blue-800' },
      'PENDIENTE': { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
      'EN_COLA': { label: 'En Cola', className: 'bg-yellow-100 text-yellow-800' },
      'FALLIDA': { label: 'Fallida', className: 'bg-red-100 text-red-800' },
      'CANCELADA': { label: 'Cancelada', className: 'bg-gray-100 text-gray-800' },
    };
    
    return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  };

  // Estadísticas
  const smsCount = messages.filter((m) => m.canal === 'SMS').length;
  const whatsappCount = messages.filter((m) => m.canal === 'WHATSAPP').length;
  const emailCount = messages.filter((m) => m.canal === 'CORREO' || m.canal === 'EMAIL').length;
  const sentCount = messages.filter((m) => m.estado === 'ENVIADA' || m.estado === 'ENTREGADA').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Centro de Mensajería</h1>
        <p className="text-gray-600">Envía mensajes y gestiona comunicaciones</p>
      </div>

      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="send">Enviar Mensaje</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6 mt-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm">SMS Enviados</div>
                    <div className="text-2xl">{smsCount.toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm">WhatsApp Enviados</div>
                    <div className="text-2xl">{whatsappCount.toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Mail className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm">Emails Enviados</div>
                    <div className="text-2xl">{emailCount.toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Send Message Form */}
          <Card>
            <CardHeader>
              <CardTitle>Enviar Nuevo Mensaje</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <Label htmlFor="channel">Canal de Comunicación</Label>
                  <Select
                    value={formData.channel}
                    onValueChange={(value: 'SMS' | 'WHATSAPP' | 'EMAIL' | 'CORREO') =>
                      setFormData({ ...formData, channel: value })
                    }
                    disabled={isSending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un canal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      <SelectItem value="EMAIL">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="promotion">Promoción (Opcional - para envío masivo)</Label>
                  <Select
                    value={formData.promotionId || 'none'}
                    onValueChange={(value) => setFormData({ ...formData, promotionId: value === 'none' ? '' : value })}
                    disabled={isSending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una promoción (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguna (mensaje individual)</SelectItem>
                      {promotions.map((promo) => (
                        <SelectItem key={promo.id} value={promo.id}>
                          {promo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(formData.channel === 'EMAIL' || formData.channel === 'CORREO') && (
                  <div>
                    <Label htmlFor="title">Título del Email</Label>
                    <Input
                      id="title"
                      placeholder="Asunto del email"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      disabled={isSending}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    placeholder="Escribe tu mensaje aquí... Usa {nombre} y {plan} para personalizar"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    disabled={isSending}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Variables disponibles: {'{nombre}'}, {'{plan}'}, {'{descuento}'}
                  </p>
                </div>

                <div className="flex gap-2">
                  {formData.promotionId && formData.promotionId !== 'none' ? (
                    <Button
                      type="button"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={handleSendBulk}
                      disabled={isSending}
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Masivo
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={isSending}
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Mensaje
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Historial de Mensajes</CardTitle>
                <div className="flex gap-2">
                  <Select value={filterChannel} onValueChange={setFilterChannel}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Canal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los canales</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      <SelectItem value="CORREO">Email</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="ENVIADA">Enviada</SelectItem>
                      <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                      <SelectItem value="FALLIDA">Fallida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No se encontraron mensajes
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const status = getStatusBadge(message.estado);
                    return (
                      <div
                        key={message.id}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="mt-1">{getStatusIcon(message.estado)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {message.titulo && (
                              <span className="font-medium">{message.titulo}</span>
                            )}
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getChannelIcon(message.canal)}
                              <span className="capitalize">
                                {message.canal === 'CORREO' ? 'Email' : message.canal}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{message.mensaje}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            {message.fechaEnviado && (
                              <span>Enviado: {new Date(message.fechaEnviado).toLocaleString('es-MX')}</span>
                            )}
                            {message.fechaCreacion && !message.fechaEnviado && (
                              <span>Creado: {new Date(message.fechaCreacion).toLocaleString('es-MX')}</span>
                            )}
                          </div>
                          {message.mensajeError && (
                            <p className="text-red-600 text-xs mt-1">{message.mensajeError}</p>
                          )}
                        </div>
                        <Badge className={status.className}>{status.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
