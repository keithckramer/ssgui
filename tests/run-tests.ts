import { normalizeInviteValue, normalizePhone, validateLocalPlayer } from '../src/components/invite/inviteUtils.js'

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message)
  }
}

function test(name: string, run: () => void) {
  try {
    run()
    console.log(`✓ ${name}`)
  } catch (error) {
    console.error(`✗ ${name}`)
    throw error
  }
}

test('normalizeInviteValue parses emails', () => {
  const result = normalizeInviteValue('USER@example.com ')
  assert(result.target?.channel === 'email', 'Expected email channel')
  assert(result.target?.value === 'user@example.com', 'Expected lowercase email value')
  assert(!result.error, 'Expected no error')
})

test('normalizeInviteValue parses US phone numbers', () => {
  const result = normalizeInviteValue('(555) 123-4567')
  assert(result.target?.channel === 'sms', 'Expected sms channel')
  assert(result.target?.value === '+15551234567', 'Expected normalized phone value')
})

test('normalizeInviteValue rejects invalid entries', () => {
  const result = normalizeInviteValue('invalid input')
  assert(!result.target, 'Expected no target for invalid input')
  assert(Boolean(result.error), 'Expected an error message')
})

test('normalizePhone supports explicit country codes', () => {
  const value = normalizePhone('+44 7700 900123')
  assert(value === '+447700900123', 'Expected normalized E.164 phone number')
})

test('validateLocalPlayer requires a name', () => {
  const { valid, errors } = validateLocalPlayer({ name: '   ', paymentType: 'cash' })
  assert(!valid, 'Expected validation to fail without a name')
  assert(errors.name === 'Name is required.', 'Expected name error message')
})

test('validateLocalPlayer enforces phone for text invites', () => {
  const { valid, errors } = validateLocalPlayer({ name: 'Jordan', paymentType: 'text' })
  assert(!valid, 'Expected validation failure without phone')
  assert(errors.phone, 'Expected phone error for text invite without phone')
})

test('validateLocalPlayer accepts valid text invite', () => {
  const { valid, normalized } = validateLocalPlayer({
    name: 'Taylor Swift',
    paymentType: 'text',
    phone: '555-987-6543',
  })
  assert(valid, 'Expected successful validation')
  assert(normalized?.phone === '+15559876543', 'Expected normalized phone stored')
})

test('validateLocalPlayer allows optional phone for cash', () => {
  const { valid, normalized } = validateLocalPlayer({
    name: 'Chris',
    paymentType: 'cash',
  })
  assert(valid, 'Expected valid result for cash without phone')
  assert(!normalized?.phone, 'Expected no phone recorded')
})
