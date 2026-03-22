// Front-end config. Backend (e.g. DynamoDB) will be integrated later.

export const CONFIG = {
  STORE_SLUG: "pasir-ris-mall",
  STORE_DISPLAY_NAME: "Smooy Pasir Ris Mall",
  MOCK_CUSTOMER_NAME: "Test Customer",
  MOCK_REVEALED_STAMPS: [1, 2, 3, 4, 5, 6, 7, 8],
  MOCK_REDEMPTION_STATUS_BY_STAMP: { 5: "Redeemed", 7: "Expired" },
  MOCK_PHONE_E164: "+6597813023",
  LAST_PHONE_KEY: "smooy_last_phone_e164",
};
