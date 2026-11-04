import { TestBed } from '@angular/core/testing';

import { MOCK_LOTES } from '../../data/mock-data';
import { LotsTableComponent } from './lots-table.component';

describe('LotsTableComponent', () => {
  it('identifica a seleção parcial e emite a troca de página', () => {
    const fixture = TestBed.createComponent(LotsTableComponent);
    const component = fixture.componentInstance as any;
    const pageChangeSpy = jasmine.createSpy('pageChange');

    fixture.componentRef.setInput('lots', MOCK_LOTES.slice(0, 2));
    fixture.componentRef.setInput('selectedIds', [MOCK_LOTES[0].id]);
    fixture.componentRef.setInput('total', MOCK_LOTES.length);
    component.pageChange.subscribe(pageChangeSpy);
    fixture.detectChanges();

    expect(component.someVisibleSelected()).toBeTrue();
    expect(component.allVisibleSelected()).toBeFalse();

    fixture.nativeElement.querySelector('.pagination-actions button:last-child').click();
    expect(pageChangeSpy).toHaveBeenCalledWith(Math.ceil(MOCK_LOTES.length / 6) - 1);
  });
});
