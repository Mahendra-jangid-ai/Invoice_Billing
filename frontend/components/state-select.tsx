'use client'

import { INDIAN_STATES, findIndianState } from '@/lib/indian-states'
import { cn } from '@/lib/utils'

interface StateCodeFieldsProps {
  stateValue: string
  codeValue: string
  onChange: (state: string, code: string) => void
  stateLabel?: string
  codeLabel?: string
  stateError?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

const labelClass = 'block text-xs font-semibold text-slate-600 mb-1.5'

export function StateCodeFields({
  stateValue,
  codeValue,
  onChange,
  stateLabel = 'State',
  codeLabel = 'State code',
  stateError,
  disabled = false,
  required = false,
  className,
}: StateCodeFieldsProps) {
  const matchedState = findIndianState(stateValue)
  const selectValue = matchedState?.name ?? ''

  const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = INDIAN_STATES.find((state) => state.name === event.target.value)
    onChange(selected?.name ?? '', selected?.code ?? '')
  }

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2', className)}>
      <div>
        <label className={labelClass}>
          {stateLabel} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={selectValue}
          onChange={handleStateChange}
          disabled={disabled}
          className={cn('field-input', stateError && 'field-input-error', disabled && 'bg-slate-100')}
        >
          <option value="">Select Indian state</option>
          {INDIAN_STATES.map((state) => (
            <option key={state.code} value={state.name}>
              {state.name}
            </option>
          ))}
        </select>
        {stateError && <p className="mt-1 text-xs text-red-600">{stateError}</p>}
      </div>

      <div>
        <label className={labelClass}>{codeLabel}</label>
        <input
          type="text"
          value={codeValue || matchedState?.code || ''}
          readOnly
          disabled={disabled}
          placeholder="Auto-filled"
          className={cn('field-input bg-slate-50 text-slate-700', disabled && 'bg-slate-100')}
        />
        <p className="mt-1 text-xs text-slate-400">Filled automatically from state</p>
      </div>
    </div>
  )
}
