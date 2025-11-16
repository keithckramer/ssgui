import type { InviteRequest, InviteTarget, LocalPlayer, LocalPaymentType } from '@/entities/buySticks'

export interface NormalizedInviteValue {
  input: string
  target?: InviteTarget
  error?: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i

export const normalizeInviteValue = (input: string): NormalizedInviteValue => {
  const trimmed = input.trim()
  if (!trimmed) {
    return { input: '', error: 'Enter an email or phone number.' }
  }

  if (emailPattern.test(trimmed)) {
    const value = trimmed.toLowerCase()
    return {
      input: value,
      target: { channel: 'email', value },
    }
  }

  const normalizedPhone = normalizePhone(trimmed)
  if (normalizedPhone) {
    return {
      input: normalizedPhone,
      target: { channel: 'sms', value: normalizedPhone },
    }
  }

  return {
    input: trimmed,
    error: 'Enter a valid email or US phone number.',
  }
}

export const normalizePhone = (value: string): string | null => {
  const trimmed = value.trim()
  if (!trimmed) return null

  const startsWithPlus = trimmed.startsWith('+')
  const digitsOnly = trimmed.replace(/\D+/g, '')
  if (!digitsOnly) return null

  if (startsWithPlus) {
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return null
    }
    return `+${digitsOnly}`
  }

  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`
  }

  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return `+${digitsOnly}`
  }

  return null
}

export interface LocalPlayerFormValues {
  name: string
  phone?: string
  paymentType: LocalPaymentType
}

export interface LocalPlayerValidationResult {
  valid: boolean
  errors: Partial<Record<'name' | 'phone', string>>
  normalized?: LocalPlayer
}

export const validateLocalPlayer = (input: LocalPlayerFormValues): LocalPlayerValidationResult => {
  const errors: Partial<Record<'name' | 'phone', string>> = {}
  let normalizedPhone: string | undefined

  if (!input.name.trim()) {
    errors.name = 'Name is required.'
  }

  if (input.paymentType === 'text') {
    normalizedPhone = input.phone ? normalizePhone(input.phone) ?? undefined : undefined
    if (!normalizedPhone) {
      errors.phone = 'Enter a valid mobile number for text invites.'
    }
  } else if (input.phone) {
    normalizedPhone = normalizePhone(input.phone) ?? undefined
    if (!normalizedPhone) {
      errors.phone = 'Enter a valid mobile number or leave blank.'
    }
  }

  const valid = Object.keys(errors).length === 0
  if (!valid) {
    return { valid, errors }
  }

  const normalized: LocalPlayer = {
    name: input.name.trim(),
    paymentType: input.paymentType,
    ...(normalizedPhone ? { phone: normalizedPhone } : {}),
  }

  return { valid, errors, normalized }
}

export const hasAnyInvites = (request: InviteRequest) => {
  return request.emailOrSms.length > 0 || request.localPlayers.length > 0
}
