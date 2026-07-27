const crypto = require('crypto')
const { GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb')
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns')
const { docClient, normalizePhone } = require('./dynamoClient')
const { jsonResponse } = require('./response')

const OTP_TABLE = process.env.OTP_TABLE
const CODE_TTL_SEC = 5 * 60 // code is valid for 5 minutes
const RESEND_COOLDOWN_SEC = 60 // min gap between sends to the same number
const WINDOW_SEC = 60 * 60 // rolling rate-limit window
const MAX_SENDS_PER_WINDOW = 5 // max codes per number per window
const SENDER_ID = process.env.SMS_SENDER_ID // set once a SG Sender ID is registered

const sns = new SNSClient({})

exports.handler = async (event) => {
  const body = JSON.parse(event.body || '{}')
  const phone = normalizePhone(body.phone)

  if (!phone) {
    return jsonResponse(400, { message: 'phone is required' })
  }

  const now = Math.floor(Date.now() / 1000)
  const existing = (
    await docClient.send(new GetCommand({ TableName: OTP_TABLE, Key: { phone } }))
  ).Item

  // Rolling send window — reset once the window has elapsed.
  let windowStart = existing?.windowStart || now
  let sendCount = existing?.sendCount || 0
  if (now - windowStart >= WINDOW_SEC) {
    windowStart = now
    sendCount = 0
  }

  // Resend cooldown.
  if (existing?.lastSentAt && now - existing.lastSentAt < RESEND_COOLDOWN_SEC) {
    const wait = RESEND_COOLDOWN_SEC - (now - existing.lastSentAt)
    return jsonResponse(429, {
      message: `Please wait ${wait}s before requesting another code`,
    })
  }

  // Per-window cap.
  if (sendCount >= MAX_SENDS_PER_WINDOW) {
    return jsonResponse(429, {
      message: 'Too many code requests. Please try again later.',
    })
  }

  const code = crypto.randomInt(100000, 1000000).toString()

  await docClient.send(
    new PutCommand({
      TableName: OTP_TABLE,
      Item: {
        phone,
        code,
        codeExpiresAt: now + CODE_TTL_SEC,
        attempts: 0,
        lastSentAt: now,
        sendCount: sendCount + 1,
        windowStart,
        // DynamoDB TTL: keep the record for the full window so rate-limit
        // state survives past the 5-minute code validity.
        expiresAt: windowStart + WINDOW_SEC,
      },
    })
  )

  const publishParams = {
    PhoneNumber: phone,
    Message: `Your Smooy verification code is ${code}. It expires in 5 minutes.`,
  }
  if (SENDER_ID) {
    publishParams.MessageAttributes = {
      'AWS.SNS.SMS.SenderID': { DataType: 'String', StringValue: SENDER_ID },
      'AWS.SNS.SMS.SMSType': { DataType: 'String', StringValue: 'Transactional' },
    }
  }

  await sns.send(new PublishCommand(publishParams))

  return jsonResponse(200, { message: 'OTP sent' })
}
