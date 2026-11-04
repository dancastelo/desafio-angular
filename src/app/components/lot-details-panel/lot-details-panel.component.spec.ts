import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { MOCK_LOTES } from '../../data/mock-data';
import { LotDetailsPanelComponent } from './lot-details-panel.component';

describe('LotDetailsPanelComponent', () => {
  it('valida a justificativa antes de salvar alterações', fakeAsync(() => {
    const fixture = TestBed.createComponent(LotDetailsPanelComponent);
    const component = fixture.componentInstance as any;
    const lotChangedSpy = jasmine.createSpy('lotChanged');

    fixture.componentRef.setInput('lot', structuredClone(MOCK_LOTES[0]));
    fixture.componentRef.setInput('mode', 'edit');
    component.lotChanged.subscribe(lotChangedSpy);
    fixture.detectChanges();

    component.form.controls.justificativa.setValue('curta');
    component.save();
    expect(component.form.controls.justificativa.touched).toBeTrue();
    expect(lotChangedSpy).not.toHaveBeenCalled();

    component.form.controls.justificativa.setValue('Justificativa revisada para o lote selecionado.');
    component.save();
    tick(280);
    expect(lotChangedSpy).toHaveBeenCalled();
  }));
});
