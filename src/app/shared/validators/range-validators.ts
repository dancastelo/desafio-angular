import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { ContaCorrenteMock } from '../../models/accounting.models';

interface RangeRule {
  fromKey: string;
  toKey: string;
  errorKey: string;
}

const hasValue = (value: unknown): boolean =>
  value !== null && value !== undefined && value !== '';

export const rangeGroupValidator =
  (rules: RangeRule[]): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    const groupErrors: Record<string, true> = {};

    rules.forEach((rule) => {
      const fromValue = control.get(rule.fromKey)?.value;
      const toValue = control.get(rule.toKey)?.value;

      if (!hasValue(fromValue) || !hasValue(toValue)) {
        return;
      }

      if (fromValue > toValue) {
        groupErrors[rule.errorKey] = true;
      }
    });

    return Object.keys(groupErrors).length ? groupErrors : null;
  };

export const resolvedAccountValidator =
  (getResolvedAccount: () => ContaCorrenteMock | null): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    const rawValue = String(control.value ?? '').trim();

    if (!rawValue) {
      return null;
    }

    const resolvedAccount = getResolvedAccount();

    if (!resolvedAccount || resolvedAccount.numero !== rawValue) {
      return { contaNaoLocalizada: true };
    }

    return null;
  };
