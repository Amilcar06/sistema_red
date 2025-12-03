import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { notificationService } from './src/services/notification.service';
import * as Notifications from 'expo-notifications';

export default function App() {
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    // Registrar para notificaciones
    notificationService.registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        console.log('Token registrado:', token);
        // Intentar guardar el token si hay un usuario logueado
        // Nota: Esto solo funciona si el usuario ya está logueado al iniciar la app.
        // Si hace login después, deberíamos guardar el token en el LoginScreen o HomeScreen.
        // Por ahora, lo guardaremos en AsyncStorage o memoria y lo enviaremos cuando se detecte sesión.
        // O mejor, en HomeScreen (que es protegida) llamamos a registrar el token.
      }
    });

    // Listeners
    notificationListener.current = notificationService.addNotificationListener(notification => {
      console.log('Notificación recibida:', notification);
    });

    responseListener.current = notificationService.addResponseListener(response => {
      console.log('Notificación tocada:', response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
