const { GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb')
const { docClient, normalizePhone } = require('./dynamoClient')
const { jsonResponse } = require('./response')

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

  return jsonResponse(200, result.Attributes)
}
