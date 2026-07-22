import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-panel',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterPanelComponent {
  readonly form = input.required<FormGroup>();
  readonly expanded = input(true);
  readonly loading = input(false);

  readonly toggleExpanded = output<void>();
  readonly search = output<void>();
  readonly clear = output<void>();

  protected hasError(errorKey: string): boolean {
    return Boolean(this.form().errors?.[errorKey]);
  }
}
