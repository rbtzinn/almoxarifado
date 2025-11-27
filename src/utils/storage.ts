import type { AlmoxItem, Movement } from '../types'

const ITEMS_KEY = 'almox_items'
const MOVEMENTS_KEY = 'almox_movements'

export function loadItems(): AlmoxItem[] {
  if (typeof localStorage === 'undefined') return []
  const raw = localStorage.getItem(ITEMS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as AlmoxItem[]
  } catch {
    return []
  }
}

export function saveItems(items: AlmoxItem[]) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
}

export function loadMovements(): Movement[] {
  if (typeof localStorage === 'undefined') return []
  const raw = localStorage.getItem(MOVEMENTS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Movement[]
  } catch {
    return []
  }
}

export function saveMovements(movs: Movement[]) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movs))
}
