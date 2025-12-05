// src/utils/financials.ts
import { AlmoxItem, Movement } from '../types'

export interface FinancialStats {
  itemId: string
  totalEntradaQtd: number
  totalSaidaQtd: number
  totalEntradaValor: number
  totalSaidaValor: number
}

export interface ClassSummary {
  classification: string
  totalEntrada: number
  totalSaida: number
  saldo: number // Entrada - Saída
}

export function calculateFinancials(items: AlmoxItem[], movements: Movement[]) {
  const itemStats: Record<string, FinancialStats> = {}
  const classStats: Record<string, ClassSummary> = {}

  // 1. Inicializa stats por item
  items.forEach(item => {
    itemStats[item.id] = {
      itemId: item.id,
      totalEntradaQtd: 0,
      totalSaidaQtd: 0,
      totalEntradaValor: 0,
      totalSaidaValor: 0
    }
  })

  // 2. Processa cada movimento
  movements.forEach(mov => {
    const item = items.find(i => i.id === mov.itemId)
    if (!item) return

    const stats = itemStats[mov.itemId]
    const qtd = Number(mov.quantity) || 0
    const preco = Number(item.price) || 0
    const valor = qtd * preco

    if (mov.type === 'entrada') {
      stats.totalEntradaQtd += qtd
      stats.totalEntradaValor += valor
    } else {
      stats.totalSaidaQtd += qtd
      stats.totalSaidaValor += valor
    }
  })

  // 3. Agrupa por Classificação (Soma os totais calculados acima)
  items.forEach(item => {
    const stats = itemStats[item.id]
    const classificacao = item.classification || 'SEM CLASSIFICAÇÃO'

    if (!classStats[classificacao]) {
      classStats[classificacao] = { classification: classificacao, totalEntrada: 0, totalSaida: 0, saldo: 0 }
    }

    classStats[classificacao].totalEntrada += stats.totalEntradaValor
    classStats[classificacao].totalSaida += stats.totalSaidaValor
    classStats[classificacao].saldo = classStats[classificacao].totalEntrada - classStats[classificacao].totalSaida
  })

  return {
    itemStats,
    classSummaries: Object.values(classStats).sort((a, b) => a.classification.localeCompare(b.classification))
  }
}