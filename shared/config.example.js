// Copy this file to `config.js` and fill in your values.
//
// Note: SUPABASE_ANON_KEY is public by design.

window.SMOOY_CRM_CONFIG = {
  SUPABASE_URL: "https://YOUR_PROJECT_REF.supabase.co",
  SUPABASE_ANON_KEY: "YOUR_ANON_KEY_HERE",

  // Single store for MVP
  STORE_SLUG: "pasir-ris-mall",
  STORE_DISPLAY_NAME: "Smooy Pasir Ris Mall",

  // Testing-only: bypass OTP and show mock card UI.
  // Set to false before going live.
  MOCK_MODE: false,
  MOCK_CUSTOMER_NAME: "Test Customer",
  MOCK_REVEALED_STAMPS: [1,2,3,4,5,6,7,8],
  MOCK_REDEMPTION_STATUS_BY_STAMP: { 5: "Redeemed", 7: "Expired" },
  MOCK_PHONE_E164: "+6597813023"
};

