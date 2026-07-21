const { GetCommand } = require('@aws-sdk/lib-dynamodb')
const { docClient, normalizePhone } = require('./dynamoClient')
const { jsonResponse } = require('./response')

const TABLE_NAME = process.env.CUSTOMERS_TABLE

exports.handler = async (event) => {
  const phone = normalizePhone(decodeURIComponent(event.pathParameters?.phone || ''))

  if (!phone) {
    return jsonResponse(400, { message: 'phone is required' })
  }

  const result = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { phone } })
  )

  if (!result.Item) {
    return jsonResponse(404, { message: 'Customer not found' })
  }

  return jsonResponse(200, result.Item)
}
