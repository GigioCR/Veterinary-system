import { describe, expect, test, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import VetDashboard from '../components/vet/VetDashboard';
import axiosInstance from '../api/axiosInstance';

vi.mock('../api/axiosInstance')

describe('renders vet dashboard', () => {

  test('renders admin stats', async() => {
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        [ 7, 32 ]
      ]
    });
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        ["2024-12-11", "08:10:00", "VA", "vet_test", "Perro", "Golden Retriever", "client_test", 1, "C-9"]
      ]
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/veterinarios"]}>
          <Routes>
            <Route path='/veterinarios' element={<VetDashboard />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(screen.getByText('7 Citas Futuras')).toBeDefined();

  })
})