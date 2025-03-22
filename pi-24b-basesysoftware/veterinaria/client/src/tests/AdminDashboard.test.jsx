import { describe, expect, test, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminDashboard from '../components/admin/AdminDashboard';
import axiosInstance from '../api/axiosInstance';

vi.mock('../api/axiosInstance')

describe('renders admin dashboard', () => {

  test('renders admin stats', async() => {
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        [101, 7, 12, 10]
      ]
    });
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        ["2024-10-31", "08:10:00", "VA", "vet_test", "Perro", "Golden Retriever", "client_test", 1, "C-9"]
      ]
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/administradores"]}>
          <Routes>
            <Route path='/administradores' element={<AdminDashboard />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(screen.getByText('101 Servicios')).toBeDefined();

  })
})