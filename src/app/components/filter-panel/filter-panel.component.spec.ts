import { FormBuilder } from '@angular/forms';
import { TestBed } from '@angular/core/testing';

import { FilterPanelComponent } from './filter-panel.component';

describe('FilterPanelComponent', () => {
  it('emite a limpeza dos filtros ao acionar o botão Limpar', () => {
    const fixture = TestBed.createComponent(FilterPanelComponent);
    const component = fixture.componentInstance;
    const clearSpy = jasmine.createSpy('clear');
    const form = TestBed.inject(FormBuilder).group({
      instituicaoResponsavel: '',
      instituicao: '',
      situacaoLote: 'Todas',
      idLoteDe: null,
      idLoteAte: null,
      valorDe: null,
      valorAte: null,
      dataEntradaDe: null,
      dataEntradaAte: null
    });

    fixture.componentRef.setInput('form', form);
    component.clear.subscribe(clearSpy);
    fixture.detectChanges();

    const clearButton = [...fixture.nativeElement.querySelectorAll('button')]
      .find((button: HTMLButtonElement) => button.textContent?.trim() === 'Limpar') as HTMLButtonElement;
    clearButton.click();

    expect(clearSpy).toHaveBeenCalled();
  });
});
