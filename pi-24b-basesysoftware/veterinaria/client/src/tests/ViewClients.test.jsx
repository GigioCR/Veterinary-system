import { describe, expect, test, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ViewClients from '../components/clients/ViewClients'
import axiosInstance from '../api/axiosInstance';

vi.mock('../api/axiosInstance')


describe('renders clientes', () => {

    test('view clientes con algun cliente habilitado', async() => {

      axiosInstance.get.mockResolvedValue({
        data: [
            ["lmata", "Luis", "Mata", "luismata@gmail.com", "Hola2123!", 1, "En la fama"]
        ]
      });

      await act(async () => {
        render(
          <MemoryRouter initialEntries={["/administradores/clientes"]}>
            <Routes>
              <Route path='/administradores/clientes' element={<ViewClients />} />
            </Routes>
          </MemoryRouter>
        );
      });

      expect(screen.getByText('lmata')).toBeDefined();
      expect(screen.getByText('Luis Mata')).toBeDefined();
      expect(screen.getByText('luismata@gmail.com')).toBeDefined();
      expect(screen.getByText('En la fama')).toBeDefined();
      expect(screen.getByText('Habilitado')).toBeDefined();
    })
})

describe('renders cliente inhabilitados', () => {

    test('view clientes con algun cliente deshabilitado', async() => {

      axiosInstance.get.mockResolvedValue({
        data: [
            ["lmata", "Luis", "Mata", "luismata@gmail.com", "Hola2123!", 0, "En la fama"]
        ]
      });

      await act(async () => {
        render(
          <MemoryRouter initialEntries={["/administradores/clientes"]}>
            <Routes>
              <Route path='/administradores/clientes' element={<ViewClients />} />
            </Routes>
          </MemoryRouter>
        );
      });

      expect(screen.getByText('lmata')).toBeDefined();
      expect(screen.getByText('Luis Mata')).toBeDefined();
      expect(screen.getByText('luismata@gmail.com')).toBeDefined();
      expect(screen.getByText('En la fama')).toBeDefined();
      expect(screen.getByText('Deshabilitado')).toBeDefined();
    })
})
