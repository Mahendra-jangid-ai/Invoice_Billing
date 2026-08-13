export const AVATAR_PRESETS = [
  { id: 'initials', label: 'Initials', className: 'bg-gradient-to-br from-[#2563EB] to-[#1D4ED8]' },
  { id: 'blue', label: 'Ocean', className: 'bg-gradient-to-br from-sky-500 to-blue-700' },
  { id: 'emerald', label: 'Mint', className: 'bg-gradient-to-br from-emerald-400 to-teal-700' },
  { id: 'violet', label: 'Violet', className: 'bg-gradient-to-br from-violet-400 to-purple-700' },
  { id: 'amber', label: 'Amber', className: 'bg-gradient-to-br from-amber-400 to-orange-600' },
  { id: 'rose', label: 'Rose', className: 'bg-gradient-to-br from-rose-400 to-pink-700' },
  { id: 'slate', label: 'Slate', className: 'bg-gradient-to-br from-slate-500 to-slate-800' },
] as const

export type AvatarPresetId = (typeof AVATAR_PRESETS)[number]['id'] | 'custom'

export function getProfileInitials(name?: string): string {
  if (!name?.trim()) return 'U'
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getAvatarPresetClass(preset?: string): string {
  const match = AVATAR_PRESETS.find((item) => item.id === preset)
  return match?.className ?? AVATAR_PRESETS[0].className
}

export function isCustomAvatar(preset?: string, avatarUrl?: string): boolean {
  return preset === 'custom' && Boolean(avatarUrl)
}
