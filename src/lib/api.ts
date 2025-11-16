import { randomId } from '@/shared/randomId'
import type { InviteRequest, PurchaseRequest } from '@/entities/buySticks'

const simulateNetwork = async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 600)
  })
}

export async function postPurchase(request: PurchaseRequest): Promise<{ purchaseId: string; boardId?: string }> {
  console.debug('[api] POST /api/purchases', request)
  await simulateNetwork()
  return {
    purchaseId: randomId('purchase'),
    boardId: Math.random() > 0.5 ? randomId('board') : undefined,
  }
}

export async function postInvites(
  request: InviteRequest,
): Promise<{ sent: number; skipped: number }> {
  console.debug('[api] POST /api/invites/send', request)
  await simulateNetwork()
  const textInvites = request.localPlayers.filter((player) => player.paymentType === 'text').length
  const sent = request.emailOrSms.length + textInvites
  const skipped = request.localPlayers.length - textInvites
  return { sent, skipped }
}
