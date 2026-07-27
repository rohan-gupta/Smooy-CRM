const { GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb')
const { docClient, normalizePhone } = require('./dynamoClient')
const { jsonResponse } = require('./response')
const { recordHistory } = require('./history')

const TABLE_NAME = process.env.CUSTOMERS_TABLE

exports.handler = async (event) => {
  const phone = normalizePhone(decodeURIComponent(event.pathParameters?.phone || ''))
  const rewardId = Number(event.pathParameters?.rewardId)
  const body = JSON.parse(event.body || '{}')

  if (!phone || !rewardId || !body.status) {
    return jsonResponse(400, { message: 'phone, rewardId and status are required' })
  }

  const existing = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { phone } })
  )

  if (!existing.Item) {
    return jsonResponse(404, { message: 'Customer not found' })
  }

  const rewards = existing.Item.rewards || []
  const index = rewards.findIndex((r) => r.id === rewardId)

  if (index === -1) {
    return jsonResponse(404, { message: 'Reward not found' })
  }

  const currentStatus = rewards[index].status

  // 'locked' is not a manually assignable status, and a locked reward
  // may not be changed by staff — it unlocks on its own at 5 stamps.
  if (body.status === 'locked') {
    return jsonResponse(403, { message: "A reward cannot be manually set to 'locked'" })
  }
  if (currentStatus === 'locked') {
    return jsonResponse(403, { message: 'This reward is locked and unlocks automatically at 5 stamps' })
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { phone },
      UpdateExpression: `SET rewards[${index}].#status = :status`,
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':status': body.status },
      ReturnValues: 'ALL_NEW',
    })
  )

  await recordHistory(phone, 'reward_status_changed', {
    rewardId,
    rewardTitle: rewards[index].title,
    from: currentStatus,
    to: body.status,
  })

  return jsonResponse(200, result.Attributes)
}
