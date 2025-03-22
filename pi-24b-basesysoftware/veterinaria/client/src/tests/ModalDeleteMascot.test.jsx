import { describe, expect, test, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ModalDeleteMascot from '../components/mascots/ModalDeleteMascot';
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

      //expect(screen.getByText('Confirmar Deshabilitar')).toBeDefined();
      expect(screen.getByText('Cancelar')).toBeDefined();
      expect(screen.getByText('¿Seguro que quiere deshabilitar a la mascota?')).toBeDefined();
      //expect(screen.getByText('Deshabilitar')).toBeDefined()


    })

    test('view modalDeleteMascot deshabilitada', async() => {

      const mascot = {
        ID_MASCOTA: "M123",
        ESTADO: "0"
      }

      await act(async () => {
        render(
          <ModalDeleteMascot open={true} onClose={()=>{}} mascot_p={mascot} handleModificationSuccess={()=>{}}/>
        );
      });

      //expect(screen.getByText('Confirmar Habilitar')).toBeDefined();
      expect(screen.getByText('Cancelar')).toBeDefined();
      expect(screen.getByText('¿Seguro que quiere habilitar a la mascota?')).toBeDefined();
      expect(screen.getByText('Habilitar')).toBeDefined()


    })
})
