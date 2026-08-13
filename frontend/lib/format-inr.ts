/** App-wide INR styling (not used on invoice PDF/HTML document). */
export const INR_COLOR = '#10B981'

export const INR_TEXT_CLASS = 'text-[#10B981]'

export function formatInr(
  value: number,
  options: Intl.NumberFormatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 },
): string {
  return `₹${value.toLocaleString('en-IN', options)}`
}

export function isInrDisplay(value: string): boolean {
  const trimmed = value.trimStart()
  return trimmed.startsWith('₹') || trimmed.startsWith('-₹')
}
