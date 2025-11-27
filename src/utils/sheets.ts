// src/utils/sheets.ts
import type { AlmoxItem, Movement } from '../types'

type RowToSend = {
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

// Mesma lógica de cálculo que usamos no Excel: saldo antes / depois por movimento
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

    // ordena por data
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

  // Ordena todas por data e descrição
  linhas.sort((a, b) => {
    if (a.date < b.date) return -1
    if (a.date > b.date) return 1
    return a.item.localeCompare(b.item, 'pt-BR')
  })

  return linhas
}

export async function syncMovementsToGoogleSheet(
  items: AlmoxItem[],
  movements: Movement[],
): Promise<void> {
  if (!movements.length) {
    alert('Não há movimentações para enviar.')
    return
  }

  const webAppUrl = import.meta.env.VITE_SHEETS_WEBAPP_URL
  if (!webAppUrl) {
    alert('URL do WebApp do Google Sheets não configurada (.env: VITE_SHEETS_WEBAPP_URL).')
    return
  }

  const rows = buildRows(items, movements)

   try {
    const response = await fetch(webAppUrl, {
      method: 'POST',
      // ❌ Tira o header "application/json"
      // headers: {
      //   'Content-Type': 'application/json',
      // },
      body: JSON.stringify({ rows }), // vai como text/plain por padrão
    })

    if (!response.ok) {
      console.error(
        'Erro HTTP ao chamar o WebApp:',
        response.status,
        response.statusText,
      )
      alert('Falha ao atualizar a planilha no Google Sheets.')
      return
    }

    // tenta ler a resposta como texto primeiro (pra debugar se não for JSON)
    const text = await response.text()
    let data: any = null
    try {
      data = JSON.parse(text)
    } catch {
      console.warn('Resposta do WebApp não era JSON puro. Texto:', text)
    }

    if (data && data.success) {
      alert(`Planilha no Google Sheets atualizada com ${data.rows} linhas.`)
    } else {
      console.error('Resposta inesperada do WebApp:', data ?? text)
      alert('Planilha não pôde ser atualizada. Veja o console para detalhes.')
    }
  } catch (err) {
    console.error('Erro na chamada ao WebApp:', err)
    alert(
      'Erro ao conectar com o Google Sheets. Verifique sua conexão ou a URL do WebApp.',
    )
  }
}
