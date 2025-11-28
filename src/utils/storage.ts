// src/utils/storage.ts
import type { AlmoxItem, Movement } from '../types'

const STORAGE_ITEMS_KEY = 'almox_items_v1'
const STORAGE_MOVEMENTS_KEY = 'almox_movements_v1'

export function loadItems(): AlmoxItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_ITEMS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // se quiser sanitizar, mantém todos os campos importantes
    return parsed.map((i) => ({
      id: String(i.id),
      description: String(i.description ?? ''),
      classification: String(i.classification ?? ''),
      initialQty: Number(i.initialQty ?? 0),
      unitPrice: Number(i.unitPrice ?? 0),
    }))
  } catch {
    return []
  }
}

export function saveItems(items: AlmoxItem[]) {
  try {
    localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items))
  } catch (e) {
    console.error('Erro ao salvar itens no localStorage', e)
  }
}

export function loadMovements(): Movement[] {
  try {
    const raw = localStorage.getItem(STORAGE_MOVEMENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.map((m) => ({
      id: String(m.id),
      date: String(m.date ?? ''),
      itemId: String(m.itemId ?? ''),
      type: m.type === 'entrada' ? 'entrada' : 'saida',
      quantity: Number(m.quantity ?? 0),
      document: m.document ?? undefined,
      notes: m.notes ?? undefined,
      attachmentName: m.attachmentName ?? undefined,
      synced: Boolean(m.synced),
    }))
  } catch {
    return []
  }
}

export function saveMovements(movements: Movement[]) {
  try {
    localStorage.setItem(STORAGE_MOVEMENTS_KEY, JSON.stringify(movements))
  } catch (e) {
    console.error('Erro ao salvar movimentos no localStorage', e)
  }
}
