import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Lote } from '../../models/accounting.models';

@Component({
  selector: 'app-lots-table',
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './lots-table.component.html',
  styleUrl: './lots-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LotsTableComponent {
  readonly lots = input.required<Lote[]>();
  readonly selectedIds = input<number[]>([]);
  readonly total = input(0);
  readonly pageIndex = input(0);
  readonly pageSize = input(6);
  readonly loading = input(false);

  readonly toggleRow = output<{ lotId: number; checked: boolean }>();
  readonly togglePageSelection = output<boolean>();
  readonly pageChange = output<number>();

  protected isSelected(lotId: number): boolean {
    return this.selectedIds().includes(lotId);
  }

  protected allVisibleSelected(): boolean {
    return this.lots().length > 0 && this.lots().every((lot) => this.selectedIds().includes(lot.id));
  }

  protected someVisibleSelected(): boolean {
    return this.lots().some((lot) => this.selectedIds().includes(lot.id)) && !this.allVisibleSelected();
  }

  protected totalPages(): number {
    return Math.max(Math.ceil(this.total() / this.pageSize()), 1);
  }

  protected pageNumbers(): number[] {
    const totalPages = this.totalPages();
    const currentPage = this.pageIndex();
    const start = Math.max(currentPage - 1, 0);
    const end = Math.min(start + 3, totalPages);
    const normalizedStart = Math.max(end - 3, 0);

    return Array.from({ length: end - normalizedStart }, (_, index) => normalizedStart + index);
  }

  protected statusClass(status: Lote['situacaoLote']): string {
    switch (status) {
      case 'Confirmado':
        return 'status-pill status-pill--confirmed';
      case 'Enviado':
        return 'status-pill status-pill--sent';
      default:
        return 'status-pill status-pill--open';
    }
  }
}
