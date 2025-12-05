// src/utils/excel.ts
import * as XLSX from 'xlsx'
import ExcelJS from 'exceljs'
import type { AlmoxItem, Movement } from '../types'

// Converte string tipo "1.234,56" ou "1234,56" em número
function parseNumber(value: unknown): number {
  if (value == null) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const cleaned = value.replace(/\./g, '').replace(',', '.').trim()
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

// Normaliza cabeçalho: tira acento, espaços duplicados, upper
function normalizeHeader(key: string): string {
  return key
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/\s+/g, ' ') // colapsa espaços
    .trim()
    .toUpperCase()
}

// Normaliza NOME DA ABA (também tira acento)
function normalizeSheetName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

/**
 * Lê a planilha e converte em lista de itens do almoxarifado.
 *
 * PRIORIDADE DA ABA:
 *  1) Abas cujo nome contém "inventario"  (ex.: "INVENTÁRIO COMPLETO")
 *  2) Abas cujo nome contém "planilha", "estoque" ou "almox"
 *  3) Se nada bater, usa a primeira aba.
 *
 * CAMPOS USADOS (normalizados):
 *  - CLASSIFICACAO
 *  - DESCRICAO
 *  - QUANTIDADE ATUAL (preferencial)
 *  - QUANTIDADE ANTES DO INVENTARIO (fallback)
 *  - PRECO
 *  - ESTOQUE ATUAL EM REAIS $  (guardado em initialStockValue)
 */
export async function parseItemsFromFile(file: File): Promise<AlmoxItem[]> {
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data, { type: 'array' })

  // Só pra debug, se quiser olhar no console:
  console.log('[Excel] Abas encontradas:', workbook.SheetNames)

  const sheetName =
    // 1) tenta achar algo com "inventario" (INVENTARIO / INVENTÁRIO)
    workbook.SheetNames.find((name) => {
      const n = normalizeSheetName(name)
      return n.includes('inventario')
    }) ??
    // 2) se não tiver, cai para planilha/estoque/almox
    workbook.SheetNames.find((name) => {
      const n = normalizeSheetName(name)
      return (
        n.includes('planilha') ||
        n.includes('estoque') ||
        n.includes('almox')
      )
    }) ??
    // 3) se nada bater, usa a primeira mesmo
    workbook.SheetNames[0]

  console.log('[Excel] Usando aba para itens:', sheetName)

  const sheet = workbook.Sheets[sheetName]
  const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    defval: '',
  })

  const items: AlmoxItem[] = json
    .map((row, index) => {
      // Mapa normalizado: CABECALHO_NORMALIZADO -> valor
      const normRow: Record<string, any> = {}
      for (const rawKey of Object.keys(row)) {
        const normKey = normalizeHeader(rawKey)
        normRow[normKey] = row[rawKey]
      }

      // Nomes normalizados
      const classification = normRow['CLASSIFICACAO'] ?? ''
      const description = normRow['DESCRICAO'] ?? ''

      // PRIORIDADE:
      //  1) QUANTIDADE ATUAL  (sua aba INVENTARIO COMPLETO)
      //  2) QUANTIDADE ANTES DO INVENTARIO (planilha antiga)
      const initialQtyRaw =
        normRow['QUANTIDADE ATUAL'] ??
        normRow['QUANTIDADE ANTES DO INVENTARIO'] ??
        0

      const priceRaw = normRow['PRECO'] ?? 0

      // ESTOQUE ATUAL EM REAIS $ (coluna da aba INVENTARIO COMPLETO)
      const estoqueReaisRaw =
        normRow['ESTOQUE ATUAL EM REAIS $'] ??
        normRow['ESTOQUE ATUAL EM REAIS'] ??
        0

      const descriptionStr = String(description ?? '').trim()
      const classificationStr = String(classification ?? '').trim()

      // Ignora linhas sem descrição (linha em branco / total / etc.)
      if (!descriptionStr) {
        // console.log('[Excel] Linha ignorada (sem descrição):', index + 2, row)
        return null
      }

      // ID: classificação + descrição (como já está sendo usado no app)
      const id = `${classificationStr}__${descriptionStr}`

      return {
        id,
        classification: classificationStr,
        description: descriptionStr,
        initialQty: parseNumber(initialQtyRaw),
        unitPrice: parseNumber(priceRaw),
        // valor do estoque em reais no momento da importação (opcional)
        initialStockValue: parseNumber(estoqueReaisRaw),
      } as unknown as AlmoxItem
    })
    .filter((i): i is AlmoxItem => Boolean(i))

  console.log('[Excel] Total itens importados:', items.length)

  return items
}

/**
 * Exporta todas as movimentações em um Excel estilizado,
 * com saldo antes/depois de cada movimento.
 */
export async function exportMovementsToExcel(
  items: AlmoxItem[],
  movements: Movement[],
): Promise<void> {
  if (!movements.length) {
     return
  }

  const itemById = new Map(items.map((i) => [i.id, i]))

  type RowInfo = {
    item: AlmoxItem
    movement: Movement
    saldoAntes: number
    saldoDepois: number
    entrada: number
    saida: number
  }

  const movimentosPorItem = new Map<string, Movement[]>()

  // Agrupa movimentos por item
  for (const m of movements) {
    const arr = movimentosPorItem.get(m.itemId) ?? []
    arr.push(m)
    movimentosPorItem.set(m.itemId, arr)
  }

  const linhas: RowInfo[] = []

  // Para cada item, calcula saldo anterior / posterior de cada movimento
  movimentosPorItem.forEach((movs, itemId) => {
    const item = itemById.get(itemId)
    if (!item) return

    // ordena por data (YYYY-MM-DD)
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
        item,
        movement: m,
        saldoAntes,
        saldoDepois,
        entrada,
        saida,
      })
    }
  })

  // Ordena todas as linhas por data e depois por item
  linhas.sort((a, b) => {
    if (a.movement.date < b.movement.date) return -1
    if (a.movement.date > b.movement.date) return 1
    return a.item.description.localeCompare(b.item.description, 'pt-BR')
  })

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Movimentações')

  sheet.columns = [
    { header: 'Data', key: 'data', width: 12 },
    { header: 'Item', key: 'item', width: 40 },
    { header: 'Classificação', key: 'classificacao', width: 20 },
    { header: 'Tipo', key: 'tipo', width: 10 },
    { header: 'Qtd. Entrada', key: 'entrada', width: 14 },
    { header: 'Qtd. Saída', key: 'saida', width: 14 },
    { header: 'Saldo Anterior', key: 'saldoAntes', width: 16 },
    { header: 'Saldo Após', key: 'saldoDepois', width: 16 },
    { header: 'Documento', key: 'documento', width: 16 },
    { header: 'Observações', key: 'obs', width: 30 },
  ]

  // Título
  const titulo = sheet.addRow(['Relatório de Movimentações de Almoxarifado'])
  sheet.mergeCells(1, 1, 1, 10)
  titulo.height = 22
  titulo.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
  titulo.alignment = { horizontal: 'center', vertical: 'middle' }
  titulo.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F46E5' },
  }

  // Subtítulo
  const agora = new Date()
  const subtitulo = sheet.addRow([`Gerado em ${agora.toLocaleString('pt-BR')}`])
  sheet.mergeCells(2, 1, 2, 10)
  subtitulo.font = { size: 10, italic: true, color: { argb: 'FF6B7280' } }
  subtitulo.alignment = { horizontal: 'center', vertical: 'middle' }

  // Linha em branco
  sheet.addRow([])

  // Cabeçalho da tabela
  const headerRow = sheet.addRow([
    'Data',
    'Item',
    'Classificação',
    'Tipo',
    'Qtd. Entrada',
    'Qtd. Saída',
    'Saldo Anterior',
    'Saldo Após',
    'Documento',
    'Observações',
  ])

  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FF111827' }, size: 11 }
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' },
    }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    }
  })

  // Congela título + subtítulo + cabeçalho
  sheet.views = [{ state: 'frozen', ySplit: 4 }]

  let totalEntradas = 0
  let totalSaidas = 0

  // Linhas de dados
  linhas.forEach((info, index) => {
    const { item, movement, saldoAntes, saldoDepois, entrada, saida } = info

    const row = sheet.addRow([
      new Date(movement.date),
      item.description,
      item.classification,
      movement.type === 'entrada' ? 'Entrada' : 'Saída',
      entrada || null,
      saida || null,
      saldoAntes,
      saldoDepois,
      movement.document || movement.attachmentName || '',
      movement.notes ?? '',
    ])

    // Data
    row.getCell(1).numFmt = 'dd/mm/yyyy'
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }

    // Qtds / saldos
    ;[5, 6, 7, 8].forEach((col) => {
      const cell = row.getCell(col)
      cell.numFmt = '#,##0.##'
      cell.alignment = { horizontal: 'right', vertical: 'middle' }
    })

    // Zebra
    if (index % 2 === 0) {
      row.eachCell((cell, colNumber) => {
        if (colNumber <= 10) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' },
          }
        }
      })
    }

    // Bordas inferiores
    row.eachCell((cell) => {
      cell.border = {
        bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } },
      }
    })

    totalEntradas += entrada
    totalSaidas += saida
  })

  // Linha de totais
  const totalRow = sheet.addRow([
    '',
    '',
    '',
    'Totais:',
    totalEntradas,
    totalSaidas,
    '',
    '',
    '',
    '',
  ])

  totalRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true, color: { argb: 'FF111827' } }

    if (colNumber === 4) {
      cell.alignment = { horizontal: 'right', vertical: 'middle' }
    }

    if (colNumber === 5 || colNumber === 6) {
      cell.numFmt = '#,##0.##'
      cell.alignment = { horizontal: 'right', vertical: 'middle' }
    }

    cell.border = {
      top: { style: 'thin', color: { argb: 'FF9CA3AF' } },
    }
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  link.href = url
  link.download = `relatorio_movimentacoes_${dateStr}.xlsx`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
