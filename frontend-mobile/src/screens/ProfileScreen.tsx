import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { clientService, ClientProfile } from '../services/client.service';
import { authService } from '../services/auth.service';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    Login: undefined;
};

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
    navigation: ProfileScreenNavigationProp;
}

export default function ProfileScreen({ navigation }: Props) {
    const [profile, setProfile] = useState<ClientProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const user = await authService.getUser();
            if (user && user.id) {
                const data = await clientService.getProfile(user.id);
                setProfile(data);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await authService.logout();
        navigation.replace('Login');
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
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {profile?.nombre?.charAt(0) || 'U'}
                    </Text>
                </View>
                <Text style={styles.name}>
                    {profile ? `${profile.nombre} ${profile.paterno}` : 'Usuario'}
                </Text>
                <Text style={styles.plan}>{profile?.plan || 'Plan Básico'}</Text>
            </View>

            <View style={styles.infoSection}>
                <InfoItem label="Teléfono" value={profile?.telefono} />
                <InfoItem label="Correo" value={profile?.correo} />
                <InfoItem label="Estado" value={profile?.estado} />
            </View>

            <View style={styles.buttonContainer}>
                <Button title="Cerrar Sesión" onPress={handleLogout} color="#DC2626" />
            </View>
        </View>
    );
}

const InfoItem = ({ label, value }: { label: string; value?: string }) => (
    <View style={styles.infoItem}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || 'No disponible'}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: 'white',
        padding: 24,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#1E40AF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 32,
        color: 'white',
        fontWeight: 'bold',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    plan: {
        fontSize: 16,
        color: '#6B7280',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    infoSection: {
        backgroundColor: 'white',
        marginTop: 20,
        padding: 16,
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    label: {
        fontSize: 16,
        color: '#6B7280',
    },
    value: {
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '500',
    },
    buttonContainer: {
        padding: 24,
        marginTop: 'auto',
    },
});
