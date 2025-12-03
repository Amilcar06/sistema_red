import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { clientService, ClientProfile } from '../services/client.service';
import { authService } from '../services/auth.service';

type RootStackParamList = {
    Promotions: undefined;
};

export default function PromotionsScreen() {
    const [profile, setProfile] = useState<ClientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const user = await authService.getUser();
            if (user && user.id) {
                // Asumimos que el usuario logueado es un cliente y su ID de usuario coincide con el ID de cliente
                // O que el objeto usuario tiene una referencia al clienteId.
                // Ajuste temporal: si el login devuelve un usuario genérico, esto podría fallar si no es un Cliente.
                // Para MVP, intentaremos usar el ID del usuario.
                const data = await clientService.getProfile(user.id);
                setProfile(data);
            }
        } catch (error) {
            console.error('Error loading promotions:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadData();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#1E40AF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Mis Promociones</Text>

            {!profile?.promociones || profile.promociones.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No tienes promociones activas.</Text>
                </View>
            ) : (
                <FlatList
                    data={profile.promociones}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.promoTitle}>{item.promocion.nombre}</Text>
                                <View style={[styles.badge, { backgroundColor: item.estado === 'PENDIENTE' ? '#FEF3C7' : '#D1FAE5' }]}>
                                    <Text style={[styles.badgeText, { color: item.estado === 'PENDIENTE' ? '#D97706' : '#059669' }]}>
                                        {item.estado}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.description}>{item.promocion.descripcion}</Text>

                            <View style={styles.discountContainer}>
                                <Text style={styles.discountLabel}>Descuento:</Text>
                                <Text style={styles.discountValue}>
                                    {item.promocion.tipoDescuento === 'PORCENTAJE'
                                        ? `${item.promocion.valorDescuento}%`
                                        : `$${item.promocion.valorDescuento}`}
                                </Text>
                            </View>

                            <Text style={styles.dateText}>
                                Válido hasta: {new Date(item.promocion.fechaFin).toLocaleDateString()}
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
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E40AF',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    promoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 12,
    },
    discountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    discountLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginRight: 4,
    },
    discountValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#DC2626',
    },
    dateText: {
        fontSize: 12,
        color: '#6B7280',
        fontStyle: 'italic',
    },
});
