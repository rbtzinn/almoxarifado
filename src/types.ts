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
  date: string
  itemId: string
  type: MovementType
  quantity: number
  document?: string      // NF, ofício, etc.
  notes?: string
  attachmentName?: string
}
