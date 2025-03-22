import { describe, expect, test, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ClientProfile from '../components/client/ClientProfile';
import axiosInstance from '../api/axiosInstance';

vi.mock('../api/axiosInstance')

describe('renders client profile', () => {

  test('renders client profile', async() => {
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        ["client_test", "Client", "User", "client@example.com", "adfadfgadfg", "123 Client St" ]
      ]
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/clientes/perfil"]}>
          <Routes>
            <Route path='/clientes/perfil' element={<ClientProfile />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(screen.getByDisplayValue('client@example.com')).toBeDefined();

  })
})