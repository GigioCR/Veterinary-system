import { describe, expect, test, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PagosPage from '../components/pagos/PagosPage';
import axiosInstance from '../api/axiosInstance';

vi.mock('../api/axiosInstance')

describe('renders admin payments', () => {

  test('renders admin pending payments', async() => {
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        [101, "c-201", "Mascotilla", "Vet User", "2023-09-28", "08:10:00", "15000", 1, null, null, "Client User" ]
      ]
    });
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        ["c-201", "21", "Consulta", "15000"]
      ]
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/administradores/pagos"]}>
          <Routes>
            <Route path='/administradores/pagos' element={<PagosPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(screen.getByText('Mascotilla')).toBeDefined();

  })
})