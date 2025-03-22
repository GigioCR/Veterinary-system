import { describe, expect, test, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ServicioPage from '../components/servicios/ServicioPage';
import ViewMascots from '../components/mascots/ViewMascots'
import axiosInstance from '../api/axiosInstance';

vi.mock('../api/axiosInstance')


describe('renders mascotas 2', () => {

  test('view mascotas empty', async() => {

    axiosInstance.get.mockResolvedValue({
      data: [
      ]
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/administradores/mascotas"]}>
          <Routes>
            <Route path='/administradores/mascotas' element={<ViewMascots />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(screen.getByText('No hay mascotas disponibles o que cumplan con ese criterio de búsqueda')).toBeDefined();
  })

  test('view mascots not empty', async() => {
  
    axiosInstance.get.mockResolvedValue({
      data: [
          ["lmatagod", "Luis", "Mata", "MS123", "Vash", "Perro", "Golden Retriever", 18, 4, 1]
      ]
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/administradores/mascotas"]}>
          <Routes>
            <Route path='/administradores/mascotas' element={<ViewMascots />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(screen.getByText('Vash')).toBeDefined();
    expect(screen.getByText('Perro')).toBeDefined();
    expect(screen.getByText('Raza')).toBeDefined();
    expect(screen.getByText('Peso')).toBeDefined();
    expect(screen.getByText('Edad')).toBeDefined();
  })
})
