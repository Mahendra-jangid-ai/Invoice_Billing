'use client'

import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/user-avatar'
import { AVATAR_PRESETS, type AvatarPresetId } from '@/lib/user-avatar'
import { cn } from '@/lib/utils'

interface ProfileAvatarPickerProps {
  name: string
  avatarUrl?: string
  avatarPreset?: AvatarPresetId | string
  saving?: boolean
  onSelectPreset: (preset: AvatarPresetId) => void
  onUpload: (dataUrl: string) => void
}

export function ProfileAvatarPicker({
  name,
  avatarUrl,
  avatarPreset = 'initials',
  saving = false,
  onSelectPreset,
  onUpload,
}: ProfileAvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState('')

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('')
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 500 * 1024) {
      setUploadError('Please choose an image under 500KB.')
      return
    }
    const allowed = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowed.includes(file.type)) {
      setUploadError('Use PNG, JPEG, or WebP.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        onUpload(reader.result)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="relative">
          <UserAvatar
            name={name}
            avatarUrl={avatarUrl}
            avatarPreset={avatarPreset}
            size="lg"
          />
          {saving && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70">
              <Loader2 className="h-6 w-6 animate-spin text-[#2563EB]" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900">Profile photo</p>
          <p className="text-xs text-slate-500 max-w-xs">
            Pick a default avatar or upload from your device. Shown in the header and menus.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={saving}
              onClick={() => inputRef.current?.click()}
            >
              <Camera className="h-3.5 w-3.5" />
              Upload photo
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFile}
            />
          </div>
          {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-slate-600">Default avatars</p>
        <div className="flex flex-wrap gap-2">
          {AVATAR_PRESETS.map((preset) => {
            const active = avatarPreset === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                disabled={saving}
                onClick={() => onSelectPreset(preset.id)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl border p-2 transition',
                  active
                    ? 'border-[#2563EB] bg-blue-50 ring-2 ring-[#2563EB]/20'
                    : 'border-slate-200 bg-white hover:border-slate-300',
                )}
                title={preset.label}
              >
                <UserAvatar name={name} avatarPreset={preset.id} size="sm" />
                <span className="text-[10px] font-medium text-slate-500">{preset.label}</span>
              </button>
            )
          })}
          {avatarPreset === 'custom' && avatarUrl ? (
            <div className="flex flex-col items-center gap-1 rounded-xl border border-[#2563EB] bg-blue-50 p-2 ring-2 ring-[#2563EB]/20">
              <UserAvatar name={name} avatarUrl={avatarUrl} avatarPreset="custom" size="sm" />
              <span className="text-[10px] font-medium text-slate-500">Yours</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
