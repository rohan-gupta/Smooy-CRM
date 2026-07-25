const { GetCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb')
const { docClient, normalizePhone } = require('./dynamoClient')
const { jsonResponse } = require('./response')

const OTP_TABLE = process.env.OTP_TABLE

exports.handler = async (event) => {
  const body = JSON.parse(event.body || '{}')
  const phone = normalizePhone(body.phone)
  const code = (body.code || '').trim()

  if (!phone || !code) {
    return jsonResponse(400, { message: 'phone and code are required' })
  }

  const existing = await docClient.send(
    new GetCommand({ TableName: OTP_TABLE, Key: { phone } })
  )

  if (!existing.Item) {
    return jsonResponse(400, { message: 'No OTP was requested for this phone number' })
  }

  const now = Math.floor(Date.now() / 1000)
  if (existing.Item.expiresAt < now) {
    return jsonResponse(400, { message: 'OTP has expired, please request a new one' })
  }

  if (existing.Item.code !== code) {
    return jsonResponse(400, { message: 'Incorrect OTP code' })
  }

  await docClient.send(
    new DeleteCommand({ TableName: OTP_TABLE, Key: { phone } })
  )

  return jsonResponse(200, { verified: true })
}
