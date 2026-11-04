import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { MOCK_LOTES } from '../../data/mock-data';
import { LaunchModalComponent } from './launch-modal.component';

describe('LaunchModalComponent', () => {
  it('localiza a conta e habilita a validação do formulário', fakeAsync(() => {
    const fixture = TestBed.createComponent(LaunchModalComponent);
    const component = fixture.componentInstance as any;
    const lot = structuredClone(MOCK_LOTES[0]);

    fixture.componentRef.setInput('lot', lot);
    fixture.componentRef.setInput('availableLots', [lot]);
    fixture.detectChanges();
    component.form.controls.contaCorrente.setValue('114444');
    component.lookupAccount();
    tick(280);

    expect(component.resolvedAccount()?.titular).toBe('Bruna Faial');
    expect(component.form.controls.contaCorrente.valid).toBeTrue();
  }));
});
