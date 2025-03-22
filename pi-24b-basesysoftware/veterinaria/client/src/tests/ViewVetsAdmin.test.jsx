import { describe, expect, test, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ServicioPage from '../components/servicios/ServicioPage';
import ViewVets from '../components/veterinarios/VeterinariosPage'
import axiosInstance from '../api/axiosInstance';

vi.mock('../api/axiosInstance')


describe('renders vets', () => {

  test('view vets without vets', async() => {

    axiosInstance.get.mockResolvedValue({
      data: [
      ]
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/administradores/veterinarios"]}>
          <Routes>
            <Route path='/administradores/veterinarios' element={<ViewVets />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(screen.getByText('Inicio')).toBeDefined();
    expect(screen.getByText('Citas')).toBeDefined();
    expect(screen.getByText('Clientes')).toBeDefined();
    expect(screen.getByText('Mascotas')).toBeDefined();
    expect(screen.getByText('Servicios')).toBeDefined();
  })
})
