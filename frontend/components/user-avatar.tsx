'use client'

import { cn } from '@/lib/utils'
import {
  getAvatarPresetClass,
  getProfileInitials,
  isCustomAvatar,
  type AvatarPresetId,
} from '@/lib/user-avatar'

const SIZE_MAP = {
  xs: 'h-7 w-7 text-[10px] rounded-lg',
  sm: 'h-9 w-9 text-xs rounded-lg',
  md: 'h-14 w-14 text-lg rounded-2xl',
  lg: 'h-20 w-20 text-2xl rounded-2xl',
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
  avatarPreset = 'initials',
  size = 'sm',
  className,
}: UserAvatarProps) {
  const initials = getProfileInitials(name)
  const sizeClass = SIZE_MAP[size]

  if (isCustomAvatar(avatarPreset, avatarUrl)) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={cn(sizeClass, 'shrink-0 object-cover', className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center font-bold text-white shadow-sm',
        sizeClass,
        getAvatarPresetClass(avatarPreset),
        className,
      )}
      aria-hidden
    >
      {initials}
    </div>
  )
}
