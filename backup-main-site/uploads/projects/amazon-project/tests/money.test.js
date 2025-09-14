import { jest } from '@jest/globals';
import { moneyUtils } from '../scripts/utilis/money.js';

describe('formatCurrency', () => {
  test('formatiert 2095 Cents korrekt zu 20.95', () => {
    expect(moneyUtils.formatCurrency(2095)).toBe('20.95');
  });

  test('formatiert 0 Cents korrekt zu 0.00', () => {
    expect(moneyUtils.formatCurrency(0)).toBe('0.00');
  });

  test('formatiert 1000 Cents korrekt zu 10.00', () => {
    expect(moneyUtils.formatCurrency(1000)).toBe('10.00');
  });

  test('formatiert 9999 Cents korrekt zu 99.99', () => {
    expect(moneyUtils.formatCurrency(9999)).toBe('99.99');
  });

  test('rundet 2095.5 Cents korrekt zu 20.96', () => {
    expect(moneyUtils.formatCurrency(2095.5)).toBe('20.96');
  });

  test('rundet 2000.5 Cents korrekt zu 20.01', () => {
    expect(moneyUtils.formatCurrency(2000.5)).toBe('20.01');
  });

  test('rundet 2000.4 Cents korrekt zu 20.00', () => {
    expect(moneyUtils.formatCurrency(2000.4)).toBe('20.00');
  });

  test('formatiert negative Zahlen korrekt (-2095.5 Cents zu -20.96)', () => {
    expect(moneyUtils.formatCurrency(-2095.5)).toBe('-20.96');
  });

  test('überprüft Funktionsaufrufe mit toHaveBeenCalledWith', () => {
    const formatCurrencySpy = jest.spyOn(moneyUtils, 'formatCurrency');
    moneyUtils.formatCurrency(2095);
    moneyUtils.formatCurrency(1000);
    moneyUtils.formatCurrency(-2095.5);
    expect(formatCurrencySpy).toHaveBeenCalledWith(2095);
    expect(formatCurrencySpy).toHaveBeenCalledWith(1000);
    expect(formatCurrencySpy).toHaveBeenCalledWith(-2095.5);
    expect(formatCurrencySpy).toHaveBeenCalledTimes(3);
    formatCurrencySpy.mockRestore();
  });
});
