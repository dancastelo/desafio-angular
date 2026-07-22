import { FormControl, FormGroup } from '@angular/forms';

import { ContaCorrenteMock } from '../../models/accounting.models';
import { rangeGroupValidator, resolvedAccountValidator } from './range-validators';

describe('range validators', () => {
  it('retorna erros agrupados quando mais de uma faixa está inválida', () => {
    const form = new FormGroup(
      {
        idDe: new FormControl(20),
        idAte: new FormControl(10),
        valorDe: new FormControl(900),
        valorAte: new FormControl(100),
        dataDe: new FormControl('2026-04-30'),
        dataAte: new FormControl('2026-04-01')
      },
      {
        validators: rangeGroupValidator([
          { fromKey: 'idDe', toKey: 'idAte', errorKey: 'idRange' },
          { fromKey: 'valorDe', toKey: 'valorAte', errorKey: 'valueRange' },
          { fromKey: 'dataDe', toKey: 'dataAte', errorKey: 'dateRange' }
        ])
      }
    );

    expect(form.errors).toEqual({
      idRange: true,
      valueRange: true,
      dateRange: true
    });
  });

  it('ignora faixas incompletas ou válidas', () => {
    const form = new FormGroup(
      {
        idDe: new FormControl(null),
        idAte: new FormControl(10),
        valorDe: new FormControl(100),
        valorAte: new FormControl(900)
      },
      {
        validators: rangeGroupValidator([
          { fromKey: 'idDe', toKey: 'idAte', errorKey: 'idRange' },
          { fromKey: 'valorDe', toKey: 'valorAte', errorKey: 'valueRange' }
        ])
      }
    );

    expect(form.errors).toBeNull();
  });

  it('retorna erro quando a conta corrente não foi resolvida', () => {
    const control = new FormControl('114444');
    const validator = resolvedAccountValidator(() => null);

    expect(validator(control)).toEqual({ contaNaoLocalizada: true });
  });

  it('aceita conta corrente resolvida mesmo com espaços em branco no campo', () => {
    const resolvedAccount: ContaCorrenteMock = {
      numero: '114444',
      titular: 'Bruna Faial',
      apelido: 'Conta Salary'
    };
    const control = new FormControl(' 114444 ');
    const validator = resolvedAccountValidator(() => resolvedAccount);

    expect(validator(control)).toBeNull();
  });
});
