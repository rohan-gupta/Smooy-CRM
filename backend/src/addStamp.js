const { GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb')
const { docClient, normalizePhone } = require('./dynamoClient')
const { jsonResponse } = require('./response')
const { recordHistory } = require('./history')

const TABLE_NAME = process.env.CUSTOMERS_TABLE
const TOTAL_STAMPS = 10
const UPSIZE_UNLOCK_STAMPS = 5
const UPSIZE_REWARD_ID = 2

exports.handler = async (event) => {
  const phone = normalizePhone(decodeURIComponent(event.pathParameters?.phone || ''))

  if (!phone) {
    return jsonResponse(400, { message: 'phone is required' })
  }

  const existing = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { phone } })
  )

  if (!existing.Item) {
    return jsonResponse(404, { message: 'Customer not found' })
  }

  const previousStamps = existing.Item.stamps || 0
  const newStamps = Math.min(previousStamps + 1, TOTAL_STAMPS)

  let rewards = existing.Item.rewards || []
  let didUnlock = false
  if (newStamps >= UPSIZE_UNLOCK_STAMPS) {
    rewards = rewards.map((r) => {
      if (r.id === UPSIZE_REWARD_ID && r.status === 'locked') {
        didUnlock = true
        return { ...r, status: 'redeemable' }
      }
      return r
    })
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { phone },
      UpdateExpression: 'SET stamps = :stamps, rewards = :rewards',
      ExpressionAttributeValues: { ':stamps': newStamps, ':rewards': rewards },
      ReturnValues: 'ALL_NEW',
    })
  )

  await recordHistory(phone, 'stamp_added', { from: previousStamps, to: newStamps })
  if (didUnlock) {
    await recordHistory(phone, 'reward_unlocked', {
      rewardId: UPSIZE_REWARD_ID,
      rewardTitle: 'Upsize',
      atStamps: newStamps,
    })
  }

  return jsonResponse(200, result.Attributes)
}
