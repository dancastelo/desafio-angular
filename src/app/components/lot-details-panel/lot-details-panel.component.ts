import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Injector,
  OnInit,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Lote, LoteUpdatePayload } from '../../models/accounting.models';
import { AccountingMockService } from '../../services/accounting-mock.service';

export type LotDetailsMode = 'view' | 'edit' | 'justification';

@Component({
  selector: 'app-lot-details-panel',
  imports: [CommonModule, CurrencyPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './lot-details-panel.component.html',
  styleUrl: './lot-details-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LotDetailsPanelComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly injector = inject(Injector);
  private readonly accountingService = inject(AccountingMockService);

  readonly lot = input.required<Lote>();
  readonly mode = input.required<LotDetailsMode>();
  readonly panelClosed = output<void>();
  readonly lotChanged = output<Lote>();

  readonly saving = signal(false);

  readonly form = this.fb.group({
    instituicaoResponsavel: this.fb.nonNullable.control('', Validators.required),
    instituicao: this.fb.nonNullable.control('', Validators.required),
    justificativa: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(12)])
  });

  ngOnInit(): void {
    effect(() => {
      const lot = this.lot();
      this.form.reset({
        instituicaoResponsavel: lot.instituicaoResponsavel,
        instituicao: lot.instituicao,
        justificativa: lot.justificativa
      });
    }, { injector: this.injector });
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close();
  }

  protected close(): void {
    this.panelClosed.emit();
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const payload: LoteUpdatePayload = this.form.getRawValue();
    this.accountingService.updateLot(this.lot().id, payload).subscribe({
      next: (updatedLot) => {
        this.saving.set(false);
        this.lotChanged.emit(updatedLot);
      }
    });
  }
}
