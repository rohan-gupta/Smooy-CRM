const crypto = require('crypto')
const { PutCommand } = require('@aws-sdk/lib-dynamodb')
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns')
const { docClient, normalizePhone } = require('./dynamoClient')
const { jsonResponse } = require('./response')

const OTP_TABLE = process.env.OTP_TABLE
const OTP_TTL_SECONDS = 5 * 60
const sns = new SNSClient({})

exports.handler = async (event) => {
  const body = JSON.parse(event.body || '{}')
  const phone = normalizePhone(body.phone)

  if (!phone) {
    return jsonResponse(400, { message: 'phone is required' })
  }

  const code = crypto.randomInt(100000, 1000000).toString()
  const expiresAt = Math.floor(Date.now() / 1000) + OTP_TTL_SECONDS

  await docClient.send(
    new PutCommand({
      TableName: OTP_TABLE,
      Item: { phone, code, expiresAt },
    })
  )

  await sns.send(
    new PublishCommand({
      PhoneNumber: phone,
      Message: `Your Smooy verification code is ${code}. It expires in 5 minutes.`,
    })
  )

  return jsonResponse(200, { message: 'OTP sent' })
}
