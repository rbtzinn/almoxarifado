import type { AlmoxItem, Movement } from '../types'

export function getBaseQty(itemId: string, items: AlmoxItem[]): number {
  const item = items.find((i) => i.id === itemId)
  return item?.initialQty ?? 0
}

export function getMovementsForItemUpToDate(
  itemId: string,
  movements: Movement[],
  date: string,
): Movement[] {
  return movements.filter((m) => m.itemId === itemId && m.date <= date)
}

export function getStockOnDate(
  itemId: string,
  items: AlmoxItem[],
  movements: Movement[],
  date: string,
): number {
  const base = getBaseQty(itemId, items)
  const relevant = getMovementsForItemUpToDate(itemId, movements, date)
  
  const entradas = relevant
    .filter((m) => m.type === 'entrada')
    // --- CORREÇÃO AQUI ---
    // Ignoramos o movimento de cadastro inicial pois o valor dele já está na variável 'base'
    .filter((m) => m.notes !== 'Cadastro inicial de item') 
    .reduce((sum, m) => sum + m.quantity, 0)

  const saidas = relevant
    .filter((m) => m.type === 'saida')
    .reduce((sum, m) => sum + m.quantity, 0)

  return base + entradas - saidas
}

export function getCurrentStock(itemId: string, items: AlmoxItem[], movements: Movement[]): number {
  const today = new Date().toISOString().slice(0, 10)
  return getStockOnDate(itemId, items, movements, today)
}