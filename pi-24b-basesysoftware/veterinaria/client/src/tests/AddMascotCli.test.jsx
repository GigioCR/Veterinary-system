import React from 'react';
import { describe, expect, test, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; 
import AddMascot from '../components/client/AddMascot';
import axiosInstance from '../api/axiosInstance';
import { act } from 'react-dom/test-utils';

vi.mock('../api/axiosInstance'); // Use vi.mock

describe('AddMascot Component', () => {
  const mockUserID = 1;
  
  test('renders the modal when open is true',async  () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        [ "01", "Perro" ]
      ]
    });
  
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        ["01", "123", "Golden Retriver"]
      ]
    });
    await act(async() => {
      render(<AddMascot open={true} onClose={() => {}} userID={mockUserID} />);
    })
    await act(async () => {})

    expect(screen.getByText('Agregar Mascota')).toBeDefined();
    expect(screen.getByText('Nombre')).toBeDefined();
    expect(screen.getByText('Identificador de mascota')).toBeDefined();
    expect(screen.getByText('Raza')).toBeDefined();
    expect(screen.getByText('Especie')).toBeDefined();
    expect(screen.getByText('Edad en años')).toBeDefined();
    expect(screen.getByText('Peso en kg')).toBeDefined();
  });
});