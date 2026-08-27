// src/test/formatters.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../utils/formatters';

describe('formatCurrency - Prueba Unitaria', () => {
  it('debe formatear un número entero correctamente con el signo $', () => {
    const resultado = formatCurrency(1500);
    expect(resultado).toBe('$1.500');
  });

  it('debe retornar $0 si el valor recibido es menor a 0 o NaN', () => {
    expect(formatCurrency(-50)).toBe('$0');
    expect(formatCurrency(NaN)).toBe('$0');
  });
});