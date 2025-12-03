import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import PromotionsScreen from '../screens/PromotionsScreen';
import ProfileScreen from '../screens/ProfileScreen';

import RegisterScreen from '../screens/RegisterScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

// Definir tipos globales
export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Home: undefined;
    Promotions: undefined;
    Profile: undefined;
    Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Register"
                    component={RegisterScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: 'Inicio' }}
                />
                <Stack.Screen
                    name="Promotions"
                    component={PromotionsScreen}
                    options={{ title: 'Mis Promociones' }}
                />
                <Stack.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{ title: 'Mi Perfil' }}
                />
                <Stack.Screen
                    name="Notifications"
                    component={NotificationsScreen}
                    options={{ title: 'Notificaciones' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
