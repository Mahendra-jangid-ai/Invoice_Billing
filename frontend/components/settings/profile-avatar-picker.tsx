'use client'

import { useRef, useState } from 'react'
import { Camera, ImagePlus, Loader2 } from 'lucide-react'
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
  avatarPreset = 'character-1',
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
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative">
          <UserAvatar
            name={name}
            avatarUrl={avatarUrl}
            avatarPreset={avatarPreset}
            size="lg"
            className="ring-2 ring-white shadow-md"
          />
          {saving && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/75">
              <Loader2 className="h-6 w-6 animate-spin text-[#2563EB]" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900">Profile photo</p>
          <p className="max-w-sm text-xs leading-relaxed text-slate-500">
            Teams / Snapchat style illustrated avatars — pick a character or upload your own photo from device.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={saving}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="h-3.5 w-3.5" />
            Upload from device
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFile}
          />
          {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <ImagePlus className="h-4 w-4 text-slate-400" />
          <p className="text-xs font-semibold text-slate-600">Choose an avatar</p>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:gap-3">
          {AVATAR_PRESETS.map((preset) => {
            const active = avatarPreset === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                disabled={saving}
                onClick={() => onSelectPreset(preset.id)}
                className={cn(
                  'group flex flex-col items-center gap-1.5 rounded-2xl border p-2 transition',
                  active
                    ? 'border-[#2563EB] bg-blue-50 ring-2 ring-[#2563EB]/25'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                )}
                title={preset.label}
              >
                <UserAvatar name={name} avatarPreset={preset.id} size="md" />
                <span className="text-[10px] font-medium text-slate-500 group-hover:text-slate-700">
                  {preset.label}
                </span>
              </button>
            )
          })}
          {avatarPreset === 'custom' && avatarUrl ? (
            <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-[#2563EB] bg-blue-50 p-2 ring-2 ring-[#2563EB]/25">
              <UserAvatar name={name} avatarUrl={avatarUrl} avatarPreset="custom" size="md" />
              <span className="text-[10px] font-medium text-slate-500">Your photo</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
