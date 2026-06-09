export function getPaginationPages(
  current: number,
  last: number,
): (number | 'ellipsis')[] {
  if (last <= 0) return []
  if (last === 1) return [1]

  const pages: (number | 'ellipsis')[] = [1]
  const delta = 1
  const left = Math.max(2, current - delta)
  const right = Math.min(last - 1, current + delta)

  if (left > 2) pages.push('ellipsis')

  for (let i = left; i <= right; i++) {
    pages.push(i)
  }

  if (right < last - 1) pages.push('ellipsis')

  if (last > 1) pages.push(last)

  return pages
}
