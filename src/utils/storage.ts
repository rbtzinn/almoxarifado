// src/utils/storage.ts
import type { AlmoxItem, Movement } from '../types'

const STORAGE_ITEMS_KEY = 'almox_items_v1'
const STORAGE_MOVEMENTS_KEY = 'almox_movements_v1'

// chaves antigas (caso versão anterior tivesse usado esses nomes)
const LEGACY_ITEMS_KEY = 'almox_items'
const LEGACY_MOVEMENTS_KEY = 'almox_movements'

function safeParse(json: string | null): any[] | null {
  if (!json) return null
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function loadItems(): AlmoxItem[] {
  try {
    // 1) tenta v1
    let data = safeParse(localStorage.getItem(STORAGE_ITEMS_KEY))

    // 2) se não tiver nada, tenta legado
    if (!data) {
      const legacy = safeParse(localStorage.getItem(LEGACY_ITEMS_KEY))
      if (legacy) {
        data = legacy
        // migra: salva no formato novo
        localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(legacy))
        // se quiser, pode limpar o antigo:
        // localStorage.removeItem(LEGACY_ITEMS_KEY)
      }
    }

    if (!data) return []

    return data.map((i: any): AlmoxItem => ({
      id: i.id ? String(i.id) : crypto.randomUUID(),
      description: String(i.description ?? ''),
      classification: String(i.classification ?? ''),
      // saldo inicial: vem da planilha / import; se não vier, 0
      initialQty: Number(
        i.initialQty ??
        i.initial_quantity ?? // se em algum momento você usou outro nome
        i.saldoInicial ?? 0 // fallback
      ),
      unitPrice: Number(i.unitPrice ?? i.precoUnitario ?? 0),
      price: function (price: any): unknown {
        throw new Error('Function not implemented.')
      }
    }))
  } catch (e) {
    console.error('Erro ao carregar itens do localStorage', e)
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
    // 1) tenta v1
    let data = safeParse(localStorage.getItem(STORAGE_MOVEMENTS_KEY))

    // 2) se não tiver nada, tenta legado
    if (!data) {
      const legacy = safeParse(localStorage.getItem(LEGACY_MOVEMENTS_KEY))
      if (legacy) {
        data = legacy
        localStorage.setItem(STORAGE_MOVEMENTS_KEY, JSON.stringify(legacy))
        // localStorage.removeItem(LEGACY_MOVEMENTS_KEY)
      }
    }

    if (!data) return []

    return data.map((m: any): Movement => ({
      id: m.id ? String(m.id) : crypto.randomUUID(),
      date: String(m.date ?? ''),
      itemId: String(m.itemId ?? ''),
      type: m.type === 'entrada' ? 'entrada' : 'saida',
      quantity: Number(m.quantity ?? 0),
      document: m.document ?? undefined,
      notes: m.notes ?? undefined,
      attachmentName: m.attachmentName ?? undefined,
      // se não existia "synced" na versão antiga, trata como false (pendente)
      synced: m.synced === true,
    }))
  } catch (e) {
    console.error('Erro ao carregar movimentos do localStorage', e)
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
