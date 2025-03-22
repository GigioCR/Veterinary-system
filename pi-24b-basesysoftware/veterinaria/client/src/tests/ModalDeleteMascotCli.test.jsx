import { describe, expect, test, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ModalDeleteMascot from '../components/client/ModalDeleteMascot';
import axiosInstance from '../api/axiosInstance';

vi.mock('../api/axiosInstance')


describe('renders modalDeleteMascot', () => {

    test('view modalDeleteMascot', async() => {

      const mascot = {
        ID_MASCOTA: "M123",
        ESTADO: "1"
      }

      await act(async () => {
        render(
          <ModalDeleteMascot open={true} onClose={()=>{}} mascot_p={mascot} handleModificationSuccess={()=>{}}/>
        );
      });

      expect(screen.getByText('Cancelar')).toBeDefined();
      expect(screen.getByText('¿Seguro que quiere eliminar a la mascota?')).toBeDefined();
      expect(screen.getByText('Eliminar')).toBeDefined()


    })
})
