import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Login } from '../Login';
import { AuthProvider } from '../../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import authService from '../../services/auth.service';

// Mock authService
vi.mock('../../services/auth.service', () => ({
    default: {
        login: vi.fn(),
        isAuthenticated: vi.fn().mockReturnValue(false),
    },
}));

// Wrapper para proveer contexto
const renderWithProviders = (component: React.ReactNode) => {
    return render(
        <BrowserRouter>
            <AuthProvider>{component}</AuthProvider>
        </BrowserRouter>
    );
};

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form correctly', () => {
        renderWithProviders(<Login />);

        expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

    it('handles input changes', () => {
        renderWithProviders(<Login />);

        const emailInput = screen.getByLabelText(/correo electrónico/i) as HTMLInputElement;
        const passwordInput = screen.getByLabelText(/contraseña/i) as HTMLInputElement;

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });

    it('submits form with correct credentials', async () => {
        const mockLogin = vi.spyOn(authService, 'login').mockResolvedValue({
            accessToken: 'fake-token',
            refreshToken: 'fake-refresh',
            usuario: {
                id: '1',
                nombre: 'Test User',
                correo: 'test@example.com',
                rol: 'ADMIN',
                activo: true,
                fechaCreacion: new Date().toISOString()
            }
        });

        renderWithProviders(<Login />);

        const emailInput = screen.getByLabelText(/correo electrónico/i);
        const passwordInput = screen.getByLabelText(/contraseña/i);
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                correo: 'test@example.com',
                contrasena: 'password123'
            });
        });
    });

    it('displays error on failed login', async () => {
        vi.spyOn(authService, 'login').mockRejectedValue(new Error('Credenciales inválidas'));

        renderWithProviders(<Login />);

        const emailInput = screen.getByLabelText(/correo electrónico/i);
        const passwordInput = screen.getByLabelText(/contraseña/i);
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

        fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
        });
    });
});
