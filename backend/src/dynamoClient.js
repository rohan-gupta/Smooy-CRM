const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

function normalizePhone(phone) {
  return (phone || '').replace(/\s+/g, '')
}

module.exports = { docClient, normalizePhone }
