const { PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb')
const { docClient, normalizePhone } = require('./dynamoClient')
const { jsonResponse } = require('./response')

const TABLE_NAME = process.env.CUSTOMERS_TABLE

exports.handler = async (event) => {
  const body = JSON.parse(event.body || '{}')
  const phone = normalizePhone(body.phone)

  if (!phone || !body.name) {
    return jsonResponse(400, { message: 'phone and name are required' })
  }

  const item = {
    phone,
    name: body.name,
    email: body.email || '',
    dob: body.dob || '',
    stamps: 0,
    rewards: [
      { id: 1, title: '20% OFF', description: 'The Next Froyo', status: 'redeemable' },
      { id: 2, title: 'Upsize', description: 'At 5 Stamps', status: 'locked' },
    ],
    createdAt: new Date().toISOString(),
  }

  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
        ConditionExpression: 'attribute_not_exists(phone)',
      })
    )
    return jsonResponse(201, item)
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      const existing = await docClient.send(
        new GetCommand({ TableName: TABLE_NAME, Key: { phone } })
      )
      return jsonResponse(200, existing.Item)
    }
    console.error(err)
    return jsonResponse(500, { message: 'Failed to enroll customer' })
  }
}
