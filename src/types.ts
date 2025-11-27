export interface AlmoxItem {
  id: string
  classification: string
  description: string
  initialQty: number
  unitPrice: number
}

export type MovementType = 'entrada' | 'saida'

export interface Movement {
  id: string
  date: string // yyyy-mm-dd
  itemId: string
  type: MovementType
  quantity: number
  document?: string
  notes?: string
}
