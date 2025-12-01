// src/utils/sheets.ts
import type { AlmoxItem, Movement } from '../types'

type RowToSend = {
  movementId: string
  date: string
  item: string
  classification: string
  type: 'entrada' | 'saida'
  entrada: number
  saida: number
  saldoAntes: number
  saldoDepois: number
  document: string
  notes: string
}

function buildRows(items: AlmoxItem[], movements: Movement[]): RowToSend[] {
  const itemById = new Map(items.map((i) => [i.id, i]))

  const movimentosPorItem = new Map<string, Movement[]>()
  for (const m of movements) {
    const arr = movimentosPorItem.get(m.itemId) ?? []
    arr.push(m)
    movimentosPorItem.set(m.itemId, arr)
  }

  const linhas: RowToSend[] = []

  movimentosPorItem.forEach((movs, itemId) => {
    const item = itemById.get(itemId)
    if (!item) return

    movs.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

    let saldo = item.initialQty

    for (const m of movs) {
      const saldoAntes = saldo
      let entrada = 0
      let saida = 0

      if (m.type === 'entrada') {
        entrada = m.quantity
        saldo += m.quantity
      } else {
        saida = m.quantity
        saldo -= m.quantity
      }

      const saldoDepois = saldo

      linhas.push({
        movementId: m.id,
        date: m.date,
        item: item.description,
        classification: item.classification,
        type: m.type,
        entrada,
        saida,
        saldoAntes,
        saldoDepois,
        document: m.document || m.attachmentName || '',
        notes: m.notes ?? '',
      })
    }
  })

  linhas.sort((a, b) => {
    if (a.date < b.date) return -1
    if (a.date > b.date) return 1
    return a.item.localeCompare(b.item, 'pt-BR')
  })

  return linhas
}

// Agora retorna Promise<Movement[] | null>
export async function syncMovementsToGoogleSheet(
  items: AlmoxItem[],
  movements: Movement[],
): Promise<Movement[] | null> {
  // 1. Identificar o que NÃO foi sincronizado
  const unsyncedMovements = movements.filter((m) => !m.synced)

  // Nenhum movimento novo: quem chama decide como avisar (toast)
  if (unsyncedMovements.length === 0) {
    return null
  }

  const webAppUrl = import.meta.env.VITE_SHEETS_WEBAPP_URL
  if (!webAppUrl) {
    throw new Error('URL da integração com o Google Sheets não está configurada.')
  }

  // 2. Gerar TODAS as linhas para cálculo correto de saldo
  const allRows = buildRows(items, movements)

  // 3. Filtrar apenas os IDs novos para envio
  const unsyncedIds = new Set(unsyncedMovements.map((m) => m.id))

  const rowsToSend = allRows
    .filter((row) => unsyncedIds.has(row.movementId))
    .map((row) => {
      const { movementId, ...rest } = row
      return rest
    })

  let response: Response

  try {
    response = await fetch(webAppUrl, {
      method: 'POST',
      body: JSON.stringify({ rows: rowsToSend, mode: 'APPEND' }),
    })
  } catch (err) {
    console.error(err)
    throw new Error('Erro de conexão com o serviço do Google Sheets.')
  }

  if (!response.ok) {
    throw new Error('Não foi possível conectar com o Google Sheets.')
  }

  const text = await response.text()
  let data: any = null
  try {
    data = JSON.parse(text)
  } catch {
    // resposta não é JSON válido, deixa data como null
  }

  if (!data || !data.success) {
    console.error('Resposta inesperada do Google Apps Script:', data ?? text)
    throw new Error(
      'Erro no script do Google Sheets. Verifique o Apps Script ou o log da planilha.'
    )
  }

  // 4. Sucesso: marcamos apenas os enviados como synced: true
  const updatedMovements = movements.map((m) => {
    if (unsyncedIds.has(m.id)) {
      return { ...m, synced: true }
    }
    return m
  })

  return updatedMovements
}
