import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { HISTORICO_OPTIONS, MOCK_CONTAS, MOCK_LOTES, PA_OPTIONS } from '../data/mock-data';
import {
  ContaCorrenteMock,
  Lancamento,
  LancamentoPayload,
  Lote,
  LoteFilters,
  LotesPage,
  LoteUpdatePayload,
  SituacaoLote
} from '../models/accounting.models';

const PAGE_LATENCY_MS = 420;
const ACTION_LATENCY_MS = 280;

@Injectable({ providedIn: 'root' })
export class AccountingMockService {
  private readonly lots = signal<Lote[]>(structuredClone(MOCK_LOTES));
  private nextLancamentoId =
    Math.max(...MOCK_LOTES.flatMap((lot) => lot.lancamentos.map((lancamento) => lancamento.id))) + 1;

  readonly paOptions = PA_OPTIONS;
  readonly historicoOptions = HISTORICO_OPTIONS;

  searchLots(filters: LoteFilters, pageIndex: number, pageSize: number): Observable<LotesPage> {
    const filteredItems = this.applyFilters(this.lots(), filters);
    const start = pageIndex * pageSize;

    return this.simulate(
      {
        items: filteredItems.slice(start, start + pageSize),
        total: filteredItems.length,
        pageIndex,
        pageSize
      },
      PAGE_LATENCY_MS
    );
  }

  findContaCorrente(accountNumber: string): Observable<ContaCorrenteMock | null> {
    const normalized = accountNumber.trim();
    const result = MOCK_CONTAS.find((conta) => conta.numero === normalized) ?? null;
    return this.simulate(result, ACTION_LATENCY_MS);
  }

  updateLotsStatus(lotIds: number[], status: SituacaoLote): Observable<Lote[]> {
    const updatedLots = lotIds.map((lotId) =>
      this.mutateLot(lotId, (lot) => {
        lot.situacaoLote = status;
        lot.dataHoraSituacaoLote = new Date().toISOString();
        lot.usuarioAprovacao = status === 'Confirmado' ? 'aprovador.mirante' : lot.usuarioAprovacao;
      })
    );

    return this.simulate(updatedLots, ACTION_LATENCY_MS);
  }

  addLancamento(lotId: number, payload: LancamentoPayload): Observable<Lote> {
    const updatedLot = this.mutateLot(lotId, (lot) => {
      const newLaunch: Lancamento = {
        id: this.nextLancamentoId++,
        loteId: lotId,
        pa: payload.pa,
        contaCorrente: payload.contaCorrente,
        titularConta: payload.titularConta,
        valor: payload.valor,
        historico: payload.historico,
        estorno: payload.estorno,
        documento: payload.documento,
        descricao: payload.descricao,
        situacao: 'Pendente',
        situacaoDocumentoCsc: 'Pendente',
        retornoProcessamento: 'Aguardando envio',
        criadoEm: new Date().toISOString()
      };

      lot.lancamentos = [newLaunch, ...lot.lancamentos];
      lot.situacaoLote = 'Aberto';
      lot.dataHoraSituacaoLote = new Date().toISOString();
    });

    return this.simulate(updatedLot, ACTION_LATENCY_MS);
  }

  updateLancamento(lotId: number, launchId: number, payload: LancamentoPayload): Observable<Lote> {
    const updatedLot = this.mutateLot(lotId, (lot) => {
      lot.lancamentos = lot.lancamentos.map((lancamento) =>
        lancamento.id === launchId
          ? {
              ...lancamento,
              pa: payload.pa,
              contaCorrente: payload.contaCorrente,
              titularConta: payload.titularConta,
              valor: payload.valor,
              historico: payload.historico,
              estorno: payload.estorno,
              documento: payload.documento,
              descricao: payload.descricao,
              situacaoDocumentoCsc: 'Pendente',
              retornoProcessamento: 'Aguardando reprocessamento'
            }
          : lancamento
      );
      lot.situacaoLote = 'Aberto';
      lot.dataHoraSituacaoLote = new Date().toISOString();
    });

    return this.simulate(updatedLot, ACTION_LATENCY_MS);
  }

  deleteLancamento(lotId: number, launchId: number): Observable<Lote> {
    const updatedLot = this.mutateLot(lotId, (lot) => {
      lot.lancamentos = lot.lancamentos.filter((lancamento) => lancamento.id !== launchId);
      lot.situacaoLote = 'Aberto';
      lot.dataHoraSituacaoLote = new Date().toISOString();
    });

    return this.simulate(updatedLot, ACTION_LATENCY_MS);
  }

  duplicateLancamento(lotId: number, launchId: number): Observable<Lote> {
    const updatedLot = this.mutateLot(lotId, (lot) => {
      const source = lot.lancamentos.find((lancamento) => lancamento.id === launchId);

      if (!source) {
        return;
      }

      lot.lancamentos = [
        {
          ...source,
          id: this.nextLancamentoId++,
          documento: `${source.documento}-DUP`,
          criadoEm: new Date().toISOString(),
          situacaoDocumentoCsc: 'Pendente',
          retornoProcessamento: 'Aguardando envio'
        },
        ...lot.lancamentos
      ];
      lot.situacaoLote = 'Aberto';
      lot.dataHoraSituacaoLote = new Date().toISOString();
    });

    return this.simulate(updatedLot, ACTION_LATENCY_MS);
  }

  deleteLot(lotId: number): Observable<void> {
    const nextLots = structuredClone(this.lots()).filter((lot) => lot.id !== lotId);
    this.lots.set(nextLots);
    return this.simulate(undefined, ACTION_LATENCY_MS);
  }

  updateLot(lotId: number, payload: LoteUpdatePayload): Observable<Lote> {
    const updatedLot = this.mutateLot(lotId, (lot) => {
      lot.instituicaoResponsavel = payload.instituicaoResponsavel;
      lot.instituicao = payload.instituicao;
      lot.justificativa = payload.justificativa;
      lot.dataHoraSituacaoLote = new Date().toISOString();
    });

    return this.simulate(updatedLot, ACTION_LATENCY_MS);
  }

  private applyFilters(lots: Lote[], filters: LoteFilters): Lote[] {
    return structuredClone(lots)
      .filter((lot) => {
        const statusMatches =
          filters.situacaoLote === 'Todas' || lot.situacaoLote === filters.situacaoLote;
        const instRespMatches = lot.instituicaoResponsavel
          .toLowerCase()
          .includes(filters.instituicaoResponsavel.toLowerCase().trim());
        const instituicaoMatches = lot.instituicao
          .toLowerCase()
          .includes(filters.instituicao.toLowerCase().trim());
        const idFromMatches = filters.idLoteDe === null || lot.id >= filters.idLoteDe;
        const idToMatches = filters.idLoteAte === null || lot.id <= filters.idLoteAte;
        const valueFromMatches = filters.valorDe === null || lot.valor >= filters.valorDe;
        const valueToMatches = filters.valorAte === null || lot.valor <= filters.valorAte;
        const entryDate = lot.dataEntrada.slice(0, 10);
        const dateFromMatches = !filters.dataEntradaDe || entryDate >= filters.dataEntradaDe;
        const dateToMatches = !filters.dataEntradaAte || entryDate <= filters.dataEntradaAte;

        return (
          statusMatches &&
          instRespMatches &&
          instituicaoMatches &&
          idFromMatches &&
          idToMatches &&
          valueFromMatches &&
          valueToMatches &&
          dateFromMatches &&
          dateToMatches
        );
      })
      .sort((left, right) => right.id - left.id);
  }

  private mutateLot(lotId: number, mutation: (lot: Lote) => void): Lote {
    const nextLots = structuredClone(this.lots());
    const targetLot = nextLots.find((lot) => lot.id === lotId);

    if (!targetLot) {
      throw new Error(`Lote ${lotId} não encontrado.`);
    }

    mutation(targetLot);
    this.recalculateLot(targetLot);
    this.lots.set(nextLots);

    return structuredClone(targetLot);
  }

  private recalculateLot(lot: Lote): void {
    lot.quantidadeLancamentos = lot.lancamentos.length;
    lot.valor = lot.lancamentos.reduce((total, lancamento) => total + lancamento.valor, 0);
  }

  private simulate<T>(payload: T, latencyMs: number): Observable<T> {
    return of(structuredClone(payload)).pipe(delay(latencyMs));
  }
}
