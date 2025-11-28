import type { AlmoxItem } from '../types'

// Normaliza texto: minúsculo, sem acento, sem espaços extras
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}


// Busca com ranking:
// 1) começa com termo → vem primeiro
// 2) contém termo no meio → vem depois
// 3) tudo em ordem alfabética
export function searchItemsByDescription(
  items: AlmoxItem[],
  rawTerm: string,
): AlmoxItem[] {
  const term = normalizeText(rawTerm)

  const prepared = items.map((item) => ({
    item,
    normDesc: normalizeText(item.description),
  }))

  // Sem termo → só ordena A–Z
  if (!term) {
    return prepared
      .sort((a, b) => a.normDesc.localeCompare(b.normDesc, 'pt-BR'))
      .map((p) => p.item)
  }

  

  const filtered = prepared
    .map((entry) => {
      const index = entry.normDesc.indexOf(term)
      if (index === -1) return null

      return {
        ...entry,
        index,
        isPrefix: index === 0,
      }
    })
    .filter(
      (x): x is {
        item: AlmoxItem
        normDesc: string
        index: number
        isPrefix: boolean
      } => x !== null,
    )

  filtered.sort((a, b) => {
    // prefixo tem prioridade
    if (a.isPrefix !== b.isPrefix) return a.isPrefix ? -1 : 1
    // depois, quem tem o termo mais cedo
    if (a.index !== b.index) return a.index - b.index
    // empate → alfabético
    return a.normDesc.localeCompare(b.normDesc, 'pt-BR')
  })

  return filtered.map((x) => x.item)
}
