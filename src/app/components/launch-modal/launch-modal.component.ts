import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Injector,
  OnInit,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AccountingMockService } from '../../services/accounting-mock.service';
import { resolvedAccountValidator } from '../../shared/validators/range-validators';
import { ContaCorrenteMock, Lancamento, LancamentoPayload, Lote } from '../../models/accounting.models';

type FeedbackTone = 'success' | 'error' | 'info';

@Component({
  selector: 'app-launch-modal',
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule],
  templateUrl: './launch-modal.component.html',
  styleUrl: './launch-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly injector = inject(Injector);
  private readonly accountingService = inject(AccountingMockService);

  readonly lot = input<Lote | null>(null);
  readonly availableLots = input<Lote[]>([]);
  readonly closeModal = output<void>();
  readonly lotChanged = output<Lote>();

  readonly paOptions = this.accountingService.paOptions;
  readonly historicoOptions = this.accountingService.historicoOptions;

  readonly currentLot = signal<Lote | null>(null);
  readonly selectedLaunchId = signal<number | null>(null);
  readonly resolvedAccount = signal<ContaCorrenteMock | null>(null);
  readonly searchingAccount = signal(false);
  readonly workingAction = signal<'include' | 'update' | 'delete' | 'duplicate' | null>(null);
  readonly readOnlyMode = signal(false);
  readonly feedback = signal<{ tone: FeedbackTone; text: string } | null>(null);

  readonly form = this.fb.group({
    contaCorrente: this.fb.nonNullable.control('', {
      validators: [Validators.required, resolvedAccountValidator(() => this.resolvedAccount())]
    }),
    valor: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01)]
    }),
    historico: this.fb.nonNullable.control(this.historicoOptions[0], Validators.required),
    estorno: this.fb.nonNullable.control(false),
    documento: this.fb.nonNullable.control('', Validators.required),
    descricao: this.fb.nonNullable.control(''),
    situacao: this.fb.nonNullable.control({ value: 'Pendente', disabled: true }),
    pa: this.fb.nonNullable.control(this.paOptions[0], Validators.required)
  });

  readonly launches = computed(() => this.currentLot()?.lancamentos ?? []);
  readonly selectedLaunch = computed(
    () => this.launches().find((launch) => launch.id === this.selectedLaunchId()) ?? null
  );

  constructor() {
    this.form.controls.contaCorrente.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      if (this.resolvedAccount()?.numero !== value.trim()) {
        this.resolvedAccount.set(null);
        this.form.controls.contaCorrente.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    effect(() => {
      const incomingLot = this.lot();
      const visibleLots = this.availableLots();
      const previousLotId = untracked(() => this.currentLot()?.id ?? null);

      const nextLot =
        visibleLots.find((lot) => lot.id === previousLotId) ??
        (incomingLot
          ? visibleLots.find((lot) => lot.id === incomingLot.id) ?? incomingLot
          : visibleLots[0] ?? null);

      this.currentLot.set(nextLot ? structuredClone(nextLot) : null);

      if (previousLotId !== (nextLot?.id ?? null)) {
        this.prepareNewLaunch();
      }
    }, { injector: this.injector });
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close();
  }

  protected close(): void {
    this.closeModal.emit();
  }

  protected prepareNewLaunch(clearFeedback = true): void {
    this.selectedLaunchId.set(null);
    this.resolvedAccount.set(null);
    this.readOnlyMode.set(false);

    if (clearFeedback) {
      this.feedback.set(null);
    }

    this.form.reset({
      contaCorrente: '',
      valor: null,
      historico: this.historicoOptions[0],
      estorno: false,
      documento: '',
      descricao: '',
      situacao: 'Pendente',
      pa: this.paOptions[0]
    });
  }

  protected changeLotContext(rawLotId: string): void {
    const nextLot = this.availableLots().find((lot) => lot.id === Number(rawLotId)) ?? null;

    if (!nextLot) {
      return;
    }

    this.currentLot.set(structuredClone(nextLot));
    this.prepareNewLaunch();
  }

  protected selectLaunch(launch: Lancamento): void {
    this.selectedLaunchId.set(launch.id);
    this.readOnlyMode.set(false);
    this.feedback.set(null);
    this.resolvedAccount.set({
      numero: launch.contaCorrente,
      titular: launch.titularConta,
      apelido: 'Conta localizada'
    });
    this.form.patchValue({
      contaCorrente: launch.contaCorrente,
      valor: launch.valor,
      historico: launch.historico,
      estorno: launch.estorno,
      documento: launch.documento,
      descricao: launch.descricao,
      situacao: launch.situacao,
      pa: launch.pa
    });
  }

  protected activateViewMode(): void {
    if (!this.selectedLaunch()) {
      this.feedback.set({
        tone: 'info',
        text: 'Selecione um lançamento na grade para visualizar seus detalhes.'
      });
      return;
    }

    this.readOnlyMode.set(true);
  }

  protected lookupAccount(): void {
    const accountNumber = this.form.controls.contaCorrente.value.trim();

    if (!accountNumber) {
      this.form.controls.contaCorrente.markAsTouched();
      return;
    }

    this.searchingAccount.set(true);
    this.feedback.set(null);
    this.accountingService.findContaCorrente(accountNumber).subscribe({
      next: (account) => {
        this.searchingAccount.set(false);
        this.resolvedAccount.set(account);
        this.form.controls.contaCorrente.updateValueAndValidity();

        this.feedback.set(
          account
            ? {
                tone: 'success',
                text: `Conta ${account.numero} localizada com sucesso.`
              }
            : {
                tone: 'error',
                text: 'Conta corrente não localizada no mock. Tente 114444, 221890 ou 448899.'
              }
        );
      }
    });
  }

  protected includeLaunch(): void {
    this.persistLaunch('include');
  }

  protected updateLaunch(): void {
    if (!this.selectedLaunch()) {
      this.feedback.set({
        tone: 'info',
        text: 'Selecione um lançamento na grade antes de alterar.'
      });
      return;
    }

    this.persistLaunch('update');
  }

  protected duplicateLaunch(): void {
    const lot = this.currentLot();
    const selectedLaunch = this.selectedLaunch();

    if (!lot || !selectedLaunch) {
      this.feedback.set({
        tone: 'info',
        text: 'Selecione um lançamento para duplicar.'
      });
      return;
    }

    this.workingAction.set('duplicate');
    this.accountingService.duplicateLancamento(lot.id, selectedLaunch.id).subscribe({
      next: (updatedLot) => {
        this.applyUpdatedLot(updatedLot, 'Lançamento duplicado com sucesso.');
        this.selectedLaunchId.set(updatedLot.lancamentos[0]?.id ?? null);
      }
    });
  }

  protected deleteLaunch(): void {
    const lot = this.currentLot();
    const selectedLaunch = this.selectedLaunch();

    if (!lot || !selectedLaunch) {
      this.feedback.set({
        tone: 'info',
        text: 'Selecione um lançamento para excluir.'
      });
      return;
    }

    this.workingAction.set('delete');
    this.accountingService.deleteLancamento(lot.id, selectedLaunch.id).subscribe({
      next: (updatedLot) => {
        this.applyUpdatedLot(updatedLot, 'Lançamento excluído com sucesso.');
        this.prepareNewLaunch(false);
      }
    });
  }

  private persistLaunch(mode: 'include' | 'update'): void {
    const lot = this.currentLot();
    const resolvedAccount = this.resolvedAccount();
    const selectedLaunch = this.selectedLaunch();

    if (!lot) {
      return;
    }

    if (this.form.invalid || !resolvedAccount) {
      this.form.markAllAsTouched();
      this.feedback.set({
        tone: 'error',
        text: 'Revise os campos obrigatórios e confirme a conta corrente antes de continuar.'
      });
      return;
    }

    if (mode === 'update' && !selectedLaunch) {
      return;
    }

    const rawValue = this.form.getRawValue();
    const payload: LancamentoPayload = {
      pa: rawValue.pa,
      contaCorrente: rawValue.contaCorrente.trim(),
      titularConta: resolvedAccount.titular,
      valor: Number(rawValue.valor),
      historico: rawValue.historico,
      estorno: rawValue.estorno,
      documento: rawValue.documento.trim(),
      descricao: rawValue.descricao.trim()
    };

    this.workingAction.set(mode);

    const request =
      mode === 'include'
        ? this.accountingService.addLancamento(lot.id, payload)
        : this.accountingService.updateLancamento(lot.id, selectedLaunch!.id, payload);

    request.subscribe({
      next: (updatedLot) => {
        this.applyUpdatedLot(
          updatedLot,
          mode === 'include'
            ? 'Lançamento incluído com sucesso no lote.'
            : 'Lançamento alterado com sucesso.'
        );
        this.prepareNewLaunch(false);
      }
    });
  }

  private applyUpdatedLot(updatedLot: Lote, message: string): void {
    this.currentLot.set(updatedLot);
    this.lotChanged.emit(updatedLot);
    this.workingAction.set(null);
    this.readOnlyMode.set(false);
    this.feedback.set({ tone: 'success', text: message });
  }
}
