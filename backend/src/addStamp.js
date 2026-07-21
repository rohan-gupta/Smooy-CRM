const { GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb')
const { docClient, normalizePhone } = require('./dynamoClient')
const { jsonResponse } = require('./response')

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

  const newStamps = Math.min((existing.Item.stamps || 0) + 1, TOTAL_STAMPS)

  let rewards = existing.Item.rewards || []
  if (newStamps >= UPSIZE_UNLOCK_STAMPS) {
    rewards = rewards.map((r) =>
      r.id === UPSIZE_REWARD_ID && r.status === 'locked'
        ? { ...r, status: 'redeemable' }
        : r
    )
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

  return jsonResponse(200, result.Attributes)
}
