'use client'

import { cn } from '@/lib/utils'
import { getAvatarImageSrc, getProfileInitials, type AvatarPresetId } from '@/lib/user-avatar'

const SIZE_MAP = {
  xs: 'h-7 w-7 rounded-full',
  sm: 'h-9 w-9 rounded-full',
  md: 'h-14 w-14 rounded-full',
  lg: 'h-20 w-20 rounded-full',
} as const

interface UserAvatarProps {
  name?: string
  avatarUrl?: string
  avatarPreset?: AvatarPresetId | string
  size?: keyof typeof SIZE_MAP
  className?: string
}

export function UserAvatar({
  name,
  avatarUrl,
  avatarPreset = 'character-1',
  size = 'sm',
  className,
}: UserAvatarProps) {
  const sizeClass = SIZE_MAP[size]
  const src = getAvatarImageSrc(avatarPreset, name, avatarUrl)

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn(sizeClass, 'shrink-0 object-cover bg-slate-100 ring-1 ring-slate-200/80', className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-xs font-bold text-white ring-1 ring-slate-200/80',
        sizeClass,
        className,
      )}
      aria-hidden
    >
      {getProfileInitials(name)}
    </div>
  )
}
