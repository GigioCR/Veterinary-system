import '@testing-library/jest-dom'; 
import { describe, expect, test, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
//import '@testing-library/jest-dom'; // Import jest-dom
import ModalUpdateMascot from '../components/mascots/ModalUpdateMascot';
import axiosInstance from '../api/axiosInstance';

vi.mock('../api/axiosInstance')

describe('ModalUpdateMascot', () => {
  test('displays correct initial values and updates input fields', async () => {
    const mascot = {
      ID_MASCOTA: "M123",
      NOMBRE_MASCOTA: "MascotaPrueba",
      AGE: 10, 
      WEIGHT: 12.3 
    };

    await act(async () => {
      render(
        <ModalUpdateMascot 
          open={true} 
          onClose={() => {}} 
          mascot_p={mascot} 
          handleModificationSuccess={() => {}} 
        />
      );
    });

    // 1. Check initial values
    expect(screen.getByTestId("nombre")).toHaveValue(String(mascot.NOMBRE_MASCOTA));
    expect(screen.getByTestId("edad")).toHaveValue(String(mascot.AGE));
    expect(screen.getByTestId("peso")).toHaveValue(String(mascot.WEIGHT));

    // 2. Simulate user input to change values
    fireEvent.change(screen.getByTestId("nombre"), { target: { value: 'NuevoNombre' } });
    fireEvent.change(screen.getByTestId("edad"), { target: { value: '25' } });
    fireEvent.change(screen.getByTestId("peso"), { target: { value: '8.5' } });

    // 3. Assert that the values have changed
    expect(screen.getByTestId("nombre")).toHaveValue('NuevoNombre');
    expect(screen.getByTestId("edad")).toHaveValue('25');
    expect(screen.getByTestId("peso")).toHaveValue('8.5');
  });
});