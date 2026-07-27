const { GetCommand, DeleteCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb')
const { docClient, normalizePhone } = require('./dynamoClient')
const { jsonResponse } = require('./response')

const OTP_TABLE = process.env.OTP_TABLE
const MAX_VERIFY_ATTEMPTS = 5

exports.handler = async (event) => {
  const body = JSON.parse(event.body || '{}')
  const phone = normalizePhone(body.phone)
  const code = (body.code || '').trim()

  if (!phone || !code) {
    return jsonResponse(400, { message: 'phone and code are required' })
  }

  const existing = (
    await docClient.send(new GetCommand({ TableName: OTP_TABLE, Key: { phone } }))
  ).Item

  if (!existing || !existing.code) {
    return jsonResponse(400, { message: 'No OTP was requested for this phone number' })
  }

  const now = Math.floor(Date.now() / 1000)
  if ((existing.codeExpiresAt || 0) < now) {
    return jsonResponse(400, { message: 'OTP has expired, please request a new one' })
  }

  // Too many wrong guesses — invalidate the code (but keep the record so the
  // send rate-limit window still applies) and force a new request.
  if ((existing.attempts || 0) >= MAX_VERIFY_ATTEMPTS) {
    await docClient.send(
      new UpdateCommand({
        TableName: OTP_TABLE,
        Key: { phone },
        UpdateExpression: 'REMOVE code SET codeExpiresAt = :zero',
        ExpressionAttributeValues: { ':zero': 0 },
      })
    )
    return jsonResponse(429, {
      message: 'Too many incorrect attempts. Please request a new code.',
    })
  }

  if (existing.code !== code) {
    await docClient.send(
      new UpdateCommand({
        TableName: OTP_TABLE,
        Key: { phone },
        UpdateExpression: 'SET attempts = if_not_exists(attempts, :zero) + :one',
        ExpressionAttributeValues: { ':zero': 0, ':one': 1 },
      })
    )
    const remaining = MAX_VERIFY_ATTEMPTS - ((existing.attempts || 0) + 1)
    return jsonResponse(400, {
      message:
        remaining > 0
          ? `Incorrect OTP code, ${remaining} attempt(s) left`
          : 'Incorrect OTP code',
    })
  }

  // Success — clear the record entirely.
  await docClient.send(new DeleteCommand({ TableName: OTP_TABLE, Key: { phone } }))

  return jsonResponse(200, { verified: true })
}
