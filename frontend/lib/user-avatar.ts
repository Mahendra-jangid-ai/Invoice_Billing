import { createAvatar } from '@dicebear/core'
import { adventurer, avataaars, funEmoji, lorelei, micah, notionists } from '@dicebear/collection'

export const AVATAR_PRESETS = [
  { id: 'character-1', label: 'Sky', style: 'avataaars' as const, accent: 'b6e3f4' },
  { id: 'character-2', label: 'Sage', style: 'avataaars' as const, accent: 'c0aede' },
  { id: 'character-3', label: 'River', style: 'adventurer' as const, accent: 'd1f4d1' },
  { id: 'character-4', label: 'Amber', style: 'adventurer' as const, accent: 'ffdfbf' },
  { id: 'character-5', label: 'Nova', style: 'lorelei' as const, accent: 'ffd5dc' },
  { id: 'character-6', label: 'Echo', style: 'micah' as const, accent: 'e8f0fe' },
  { id: 'emoji-1', label: 'Sunny', style: 'funEmoji' as const, accent: 'fef3c7' },
  { id: 'emoji-2', label: 'Wave', style: 'funEmoji' as const, accent: 'dbeafe' },
] as const

export type AvatarPresetId = (typeof AVATAR_PRESETS)[number]['id'] | 'custom'

const LEGACY_PRESET_MAP: Record<string, AvatarPresetId> = {
  initials: 'character-1',
  blue: 'character-1',
  emerald: 'character-3',
  violet: 'character-2',
  amber: 'emoji-1',
  rose: 'character-5',
  slate: 'character-6',
}

const uriCache = new Map<string, string>()

export function normalizeAvatarPreset(preset?: string): AvatarPresetId | 'custom' {
  if (!preset || preset === 'custom') return preset === 'custom' ? 'custom' : 'character-1'
  if (preset in LEGACY_PRESET_MAP) return LEGACY_PRESET_MAP[preset]
  if (AVATAR_PRESETS.some((item) => item.id === preset)) return preset as AvatarPresetId
  return 'character-1'
}

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

export function isCustomAvatar(preset?: string, avatarUrl?: string): boolean {
  return normalizeAvatarPreset(preset) === 'custom' && Boolean(avatarUrl)
}

function buildIllustratedAvatar(presetId: string, name: string): string {
  const preset = AVATAR_PRESETS.find((item) => item.id === presetId) ?? AVATAR_PRESETS[0]
  const seed = `${preset.id}-${name.trim() || 'user'}`

  const common = {
    seed,
    size: 128,
    backgroundColor: [preset.accent],
  }

  switch (preset.style) {
    case 'avataaars':
      return createAvatar(avataaars, common).toDataUri()
    case 'adventurer':
      return createAvatar(adventurer, common).toDataUri()
    case 'lorelei':
      return createAvatar(lorelei, common).toDataUri()
    case 'micah':
      return createAvatar(micah, common).toDataUri()
    case 'funEmoji':
      return createAvatar(funEmoji, common).toDataUri()
    default:
      return createAvatar(notionists, common).toDataUri()
  }
}

export function getIllustratedAvatarUri(preset?: string, name?: string): string {
  const normalized = normalizeAvatarPreset(preset)
  if (normalized === 'custom') return ''
  const cacheKey = `${normalized}:${name?.trim() || 'user'}`
  const cached = uriCache.get(cacheKey)
  if (cached) return cached

  const uri = buildIllustratedAvatar(normalized, name || 'user')
  uriCache.set(cacheKey, uri)
  return uri
}

export function getAvatarImageSrc(
  preset?: string,
  name?: string,
  avatarUrl?: string,
): string | null {
  if (isCustomAvatar(preset, avatarUrl)) return avatarUrl!
  return getIllustratedAvatarUri(preset, name)
}
