export type InviteChannel = 'email' | 'sms'
export type LocalPaymentType = 'cash' | 'text'

export interface PurchaseRequest {
  matchupId: string
  buyerName: string
  quantity: number
}

export interface InviteTarget {
  channel: InviteChannel
  value: string
}

export interface LocalPlayer {
  name: string
  phone?: string
  paymentType: LocalPaymentType
}

export interface InviteRequest {
  matchupId: string
  emailOrSms: InviteTarget[]
  localPlayers: LocalPlayer[]
}
