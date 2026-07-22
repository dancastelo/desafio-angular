import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { FilterPanelComponent } from './components/filter-panel/filter-panel.component';
import { LaunchModalComponent } from './components/launch-modal/launch-modal.component';
import {
  LotDetailsMode,
  LotDetailsPanelComponent
} from './components/lot-details-panel/lot-details-panel.component';
import { LotsTableComponent } from './components/lots-table/lots-table.component';
import { Lote, LoteFilters, LotesPage, SituacaoLote } from './models/accounting.models';
import { AccountingMockService } from './services/accounting-mock.service';
import { rangeGroupValidator } from './shared/validators/range-validators';

const PAGE_SIZE = 6;

const DEFAULT_FILTERS: LoteFilters = {
  instituicaoResponsavel: '0001 - Sicoob',
  instituicao: '',
  situacaoLote: 'Todas',
  idLoteDe: null,
  idLoteAte: null,
  valorDe: null,
  valorAte: null,
  dataEntradaDe: null,
  dataEntradaAte: null
};

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FilterPanelComponent,
    LotsTableComponent,
    LaunchModalComponent,
    LotDetailsPanelComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly fb = inject(FormBuilder);
  private readonly accountingService = inject(AccountingMockService);

  readonly filterForm = this.fb.group(
    {
      instituicaoResponsavel: this.fb.nonNullable.control(DEFAULT_FILTERS.instituicaoResponsavel),
      instituicao: this.fb.nonNullable.control(DEFAULT_FILTERS.instituicao),
      situacaoLote: this.fb.nonNullable.control(DEFAULT_FILTERS.situacaoLote),
      idLoteDe: this.fb.control<number | null>(DEFAULT_FILTERS.idLoteDe),
      idLoteAte: this.fb.control<number | null>(DEFAULT_FILTERS.idLoteAte),
      valorDe: this.fb.control<number | null>(DEFAULT_FILTERS.valorDe),
      valorAte: this.fb.control<number | null>(DEFAULT_FILTERS.valorAte),
      dataEntradaDe: this.fb.control<string | null>(DEFAULT_FILTERS.dataEntradaDe),
      dataEntradaAte: this.fb.control<string | null>(DEFAULT_FILTERS.dataEntradaAte)
    },
    {
      validators: rangeGroupValidator([
        { fromKey: 'idLoteDe', toKey: 'idLoteAte', errorKey: 'idRange' },
        { fromKey: 'valorDe', toKey: 'valorAte', errorKey: 'valueRange' },
        { fromKey: 'dataEntradaDe', toKey: 'dataEntradaAte', errorKey: 'dateRange' }
      ])
    }
  );

  readonly filtersExpanded = signal(true);
  readonly loading = signal(false);
  readonly actionBusy = signal<string | null>(null);
  readonly message = signal<{ tone: 'success' | 'info' | 'error'; text: string } | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedIds = signal<number[]>([]);
  readonly submittedFilters = signal<LoteFilters>(structuredClone(DEFAULT_FILTERS));
  readonly page = signal<LotesPage>({
    items: [],
    total: 0,
    pageIndex: 0,
    pageSize: PAGE_SIZE
  });
  readonly launchModalLot = signal<Lote | null>(null);
  readonly launchModalOpen = signal(false);
  readonly detailsLot = signal<Lote | null>(null);
  readonly detailsMode = signal<LotDetailsMode | null>(null);

  readonly currentLots = computed(() => this.page().items);
  readonly selectedLots = computed(() =>
    this.currentLots().filter((lot) => this.selectedIds().includes(lot.id))
  );
  readonly selectedCount = computed(() => this.selectedIds().length);
  readonly singleSelectedLot = computed(() =>
    this.selectedLots().length === 1 ? this.selectedLots()[0] : null
  );
  readonly canBatchActions = computed(() => this.selectedIds().length > 0);
  readonly canSingleActions = computed(() => Boolean(this.singleSelectedLot()));
  readonly canViewJustification = computed(() => Boolean(this.singleSelectedLot()?.justificativa));

  constructor() {
    this.fetchLots(0, true);
  }

  protected toggleFilters(): void {
    this.filtersExpanded.update((current) => !current);
  }

  protected clearMessage(): void {
    this.message.set(null);
  }

  protected search(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    this.fetchLots(0, true);
  }

  protected resetFilters(): void {
    this.filterForm.reset(structuredClone(DEFAULT_FILTERS));
    this.filterForm.markAsPristine();
    this.filterForm.markAsUntouched();
    this.fetchLots(0, true);
  }

  protected changePage(pageIndex: number): void {
    const totalPages = Math.max(Math.ceil(this.page().total / PAGE_SIZE), 1);
    const safePageIndex = Math.min(Math.max(pageIndex, 0), totalPages - 1);

    if (safePageIndex === this.page().pageIndex && this.page().items.length) {
      return;
    }

    this.fetchLots(safePageIndex, false);
  }

  protected toggleRowSelection(event: { lotId: number; checked: boolean }): void {
    this.selectedIds.update((currentIds) => {
      if (event.checked) {
        return [...new Set([...currentIds, event.lotId])];
      }

      return currentIds.filter((lotId) => lotId !== event.lotId);
    });
  }

  protected toggleVisibleSelection(checked: boolean): void {
    this.selectedIds.set(checked ? this.currentLots().map((lot) => lot.id) : []);
  }

  protected confirmSelectedLots(): void {
    this.runStatusAction('Confirmado', 'Lotes confirmados com sucesso.');
  }

  protected sendSelectedLots(): void {
    this.runStatusAction('Enviado', 'Lotes enviados para processamento com sucesso.');
  }

  protected openLaunchModal(): void {
    const lot = this.singleSelectedLot() ?? this.currentLots()[0] ?? null;
    this.launchModalLot.set(lot);
    this.launchModalOpen.set(true);
  }

  protected closeLaunchModal(): void {
    this.launchModalOpen.set(false);
    this.launchModalLot.set(null);
  }

  protected openDetails(mode: LotDetailsMode): void {
    const lot = this.singleSelectedLot();

    if (!lot) {
      return;
    }

    this.detailsLot.set(lot);
    this.detailsMode.set(mode);
  }

  protected closeDetailsPanel(): void {
    this.detailsLot.set(null);
    this.detailsMode.set(null);
  }

  protected deleteSelectedLot(): void {
    const lot = this.singleSelectedLot();

    if (!lot) {
      return;
    }

    this.actionBusy.set('delete');
    this.accountingService.deleteLot(lot.id).subscribe({
      next: () => {
        this.actionBusy.set(null);
        this.message.set({ tone: 'success', text: `Lote ${lot.id} excluído com sucesso.` });
        this.closeLaunchModal();
        this.closeDetailsPanel();
        this.fetchLots(this.page().pageIndex, false, []);
      },
      error: () => {
        this.actionBusy.set(null);
        this.errorMessage.set('Não foi possível excluir o lote selecionado.');
      }
    });
  }

  protected handleLotUpdated(updatedLot: Lote): void {
    this.syncOverlayLots(updatedLot);
    this.fetchLots(this.page().pageIndex, false, [updatedLot.id], false);
  }

  private runStatusAction(status: SituacaoLote, successMessage: string): void {
    if (!this.selectedIds().length) {
      return;
    }

    this.actionBusy.set(status);
    this.accountingService.updateLotsStatus(this.selectedIds(), status).subscribe({
      next: (updatedLots) => {
        this.actionBusy.set(null);
        this.message.set({ tone: 'success', text: successMessage });
        this.fetchLots(
          this.page().pageIndex,
          false,
          updatedLots.map((lot) => lot.id),
          false
        );
      },
      error: () => {
        this.actionBusy.set(null);
        this.errorMessage.set('Não foi possível atualizar o status dos lotes selecionados.');
      }
    });
  }

  private fetchLots(
    pageIndex: number,
    updateSubmittedFilters: boolean,
    preferredSelection: number[] = [],
    clearMessage = true
  ): void {
    if (updateSubmittedFilters) {
      this.submittedFilters.set(this.buildFiltersSnapshot());
    }

    if (clearMessage) {
      this.message.set(null);
      this.errorMessage.set(null);
    }

    this.loading.set(true);
    const filters = this.submittedFilters();

    this.accountingService.searchLots(filters, pageIndex, PAGE_SIZE).subscribe({
      next: (page) => {
        const totalPages = Math.max(Math.ceil(page.total / PAGE_SIZE), 1);
        const lastPageIndex = totalPages - 1;

        if (!page.items.length && page.total > 0 && pageIndex > lastPageIndex) {
          this.fetchLots(lastPageIndex, false, preferredSelection, false);
          return;
        }

        this.page.set(page);
        this.selectedIds.set(
          preferredSelection.filter((lotId) => page.items.some((lot) => lot.id === lotId))
        );
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Não foi possível carregar os lotes simulados. Tente novamente.');
      }
    });
  }

  private buildFiltersSnapshot(): LoteFilters {
    const rawValue = this.filterForm.getRawValue();

    return {
      instituicaoResponsavel: rawValue.instituicaoResponsavel.trim(),
      instituicao: rawValue.instituicao.trim(),
      situacaoLote: rawValue.situacaoLote,
      idLoteDe: rawValue.idLoteDe,
      idLoteAte: rawValue.idLoteAte,
      valorDe: rawValue.valorDe,
      valorAte: rawValue.valorAte,
      dataEntradaDe: rawValue.dataEntradaDe,
      dataEntradaAte: rawValue.dataEntradaAte
    };
  }

  private syncOverlayLots(updatedLot: Lote): void {
    if (this.launchModalLot()?.id === updatedLot.id) {
      this.launchModalLot.set(updatedLot);
    }

    if (this.detailsLot()?.id === updatedLot.id) {
      this.detailsLot.set(updatedLot);
    }
  }
}
