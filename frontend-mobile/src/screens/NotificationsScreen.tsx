import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { clientService, ClientProfile } from '../services/client.service';
import { authService } from '../services/auth.service';

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<ClientProfile['notificaciones']>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const user = await authService.getUser();
            if (user && user.id) {
                const profile = await clientService.getProfile(user.id);
                setNotifications(profile.notificaciones || []);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#1E40AF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {notifications.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No tienes notificaciones.</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={[styles.card, !item.leido && styles.unreadCard]}>
                            <Text style={styles.message}>{item.mensaje}</Text>
                            <Text style={styles.date}>
                                {new Date(item.fechaCreacion).toLocaleDateString()} {new Date(item.fechaCreacion).toLocaleTimeString()}
                            </Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
    card: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    unreadCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#1E40AF',
        backgroundColor: '#EFF6FF',
    },
    message: {
        fontSize: 16,
        color: '#1F2937',
        marginBottom: 8,
    },
    date: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'right',
    },
});
