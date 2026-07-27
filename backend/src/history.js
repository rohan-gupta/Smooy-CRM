const crypto = require('crypto')
const { PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb')
const { docClient } = require('./dynamoClient')

const HISTORY_TABLE = process.env.HISTORY_TABLE

// Append an event to a customer's history log. Best-effort: a history
// write must never break the primary operation, so failures are logged
// and swallowed.
async function recordHistory(phone, type, details = {}) {
  if (!HISTORY_TABLE) return
  try {
    const now = new Date().toISOString()
    await docClient.send(
      new PutCommand({
        TableName: HISTORY_TABLE,
        Item: {
          phone,
          // Range key: ISO timestamp sorts chronologically; the random
          // suffix avoids collisions on same-millisecond events.
          eventId: `${now}#${crypto.randomUUID().slice(0, 8)}`,
          type,
          details,
          createdAt: now,
        },
      })
    )
  } catch (err) {
    console.error('Failed to record history', type, phone, err)
  }
}

// Fetch a customer's history, newest first (for a future staff view).
async function getHistory(phone) {
  if (!HISTORY_TABLE) return []
  const result = await docClient.send(
    new QueryCommand({
      TableName: HISTORY_TABLE,
      KeyConditionExpression: 'phone = :phone',
      ExpressionAttributeValues: { ':phone': phone },
      ScanIndexForward: false,
    })
  )
  return result.Items || []
}

module.exports = { recordHistory, getHistory }
