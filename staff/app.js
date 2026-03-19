import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const cfg = window.SMOOY_CRM_CONFIG || {};
const storeSlug = cfg.STORE_SLUG;
const storeDisplayName = cfg.STORE_DISPLAY_NAME;
const mockMode = !!cfg.MOCK_MODE;

const REWARD_TITLES_BY_STAMP = {
  1: "Free Topping (Single topping)",
  2: "Free Cup Upgrade",
  3: "Free Yogurt Small Cup",
  4: "Free Spin (1 spin)",
  5: "Voucher SGD 5",
  6: "Free Topping (Choose 2)",
  7: "Free Cup Upgrade (Double toppings)",
  8: "Voucher SGD 10",
  9: "Surprise Treat",
  10: "Big Reward: Free Yogurt Medium Cup + Voucher SGD 15"
};

const els = {
  staffStoreTitle: document.getElementById("staffStoreTitle"),
  staffStoreSubtitle: document.getElementById("staffStoreSubtitle"),
  viewLogin: document.getElementById("viewLogin"),
  viewMain: document.getElementById("viewMain"),

  loginBtn: document.getElementById("loginBtn"),
  emailInput: document.getElementById("emailInput"),
  passwordInput: document.getElementById("passwordInput"),
  loginError: document.getElementById("loginError"),

  logoutBtn: document.getElementById("logoutBtn"),

  mainHeading: document.getElementById("mainHeading"),
  mainSubHeading: document.getElementById("mainSubHeading"),

  staffPhoneInput: document.getElementById("staffPhoneInput"),
  searchCustomerBtn: document.getElementById("searchCustomerBtn"),
  clearCustomerBtn: document.getElementById("clearCustomerBtn"),
  searchError: document.getElementById("searchError"),

  customerArea: document.getElementById("customerArea"),
  customerName: document.getElementById("customerName"),
  customerPhoneLine: document.getElementById("customerPhoneLine"),

  grantStampBtn: document.getElementById("grantStampBtn"),
  grantError: document.getElementById("grantError"),

  stampsGrid: document.getElementById("stampsGrid"),
  rewardActionList: document.getElementById("rewardActionList")
};

const supabase = mockMode ? null : createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

let currentUser = null;
let storeId = null;
let staffMember = null;
let customerProfile = null;
let rewardIssuancesByStamp = new Map();

let mockRevealedStamps = Array.isArray(cfg.MOCK_REVEALED_STAMPS) ? cfg.MOCK_REVEALED_STAMPS : [1,2,3,4,5];
if (typeof cfg.MOCK_REVEALED_STAMPS === "string") {
  mockRevealedStamps = cfg.MOCK_REVEALED_STAMPS
    .split(",")
    .map((s) => Number(String(s).trim()))
    .filter((n) => !Number.isNaN(n));
}
let mockStatusMap = cfg.MOCK_REDEMPTION_STATUS_BY_STAMP && typeof cfg.MOCK_REDEMPTION_STATUS_BY_STAMP === "object"
  ? cfg.MOCK_REDEMPTION_STATUS_BY_STAMP
  : {};

function buildMockRewardIssuances() {
  rewardIssuancesByStamp = new Map();
  const revealed = [...mockRevealedStamps].sort((a, b) => a - b);
  for (const stamp of revealed) {
    const title = REWARD_TITLES_BY_STAMP[stamp] || "Reward";
    rewardIssuancesByStamp.set(stamp, {
      stamp_number: stamp,
      reward_title: title,
      redemption_status: mockStatusMap[stamp] || null
    });
  }
}

function setVisible(view) {
  els.viewLogin.style.display = view === "login" ? "block" : "none";
  els.viewMain.style.display = view === "main" ? "block" : "none";
}

function showError(element, msg) {
  if (!msg) {
    element.style.display = "none";
    element.textContent = "";
    return;
  }
  element.textContent = msg;
  element.style.display = "block";
}

function normalizeSingaporePhone(input) {
  const digits = String(input || "").replace(/\D/g, "");
  if (digits.length === 8) return `+65${digits}`;
  if (digits.length === 10 && digits.startsWith("65")) return `+${digits}`;
  if (digits.length === 9 && digits.startsWith("0")) return `+65${digits.slice(1)}`;
  throw new Error("Please enter a valid Singapore phone number.");
}

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

async function fetchStoreId() {
  const { data, error } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", storeSlug)
    .single();
  if (error) throw error;
  return data.id;
}

async function loadStaffMember() {
  const { data, error } = await supabase
    .from("staff_members")
    .select("id, store_id, auth_user_id")
    .eq("auth_user_id", currentUser.id)
    .single();
  if (error) return null;
  return data;
}

async function loadCustomerByPhone(phoneE164) {
  const { data, error } = await supabase
    .from("customer_profiles")
    .select("id, auth_user_id, phone_e164, name, email, address")
    .eq("store_id", storeId)
    .eq("phone_e164", phoneE164)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

async function loadRewardIssuances(customerAuthUserId) {
  const { data, error } = await supabase
    .from("reward_issuances")
    .select("stamp_number, reward_title, redemption_status, revealed_at, redeemed_at, expired_at")
    .eq("store_id", storeId)
    .eq("customer_auth_user_id", customerAuthUserId)
    .order("stamp_number", { ascending: true });
  if (error) throw error;

  rewardIssuancesByStamp = new Map();
  for (const row of data || []) rewardIssuancesByStamp.set(row.stamp_number, row);
}

function renderStamps() {
  els.stampsGrid.innerHTML = "";
  for (let stamp = 1; stamp <= 10; stamp++) {
    const issuance = rewardIssuancesByStamp.get(stamp);
    const div = document.createElement("div");
    div.className = "stamp";
    div.textContent = String(stamp);
    if (issuance) {
      div.classList.add("revealed");
      if (issuance.redemption_status === "Redeemed") div.classList.add("redeemed");
      if (issuance.redemption_status === "Expired") div.classList.add("expired");
    }
    els.stampsGrid.appendChild(div);
  }
}

function statusText(issuance) {
  if (!issuance) return "Locked";
  if (!issuance.redemption_status) return "Available";
  if (issuance.redemption_status === "Redeemed") return "Redeemed";
  if (issuance.redemption_status === "Expired") return "Expired";
  return String(issuance.redemption_status);
}

function renderRewardActions() {
  els.rewardActionList.innerHTML = "";
  const revealed = [...rewardIssuancesByStamp.keys()].sort((a, b) => a - b);

  if (revealed.length === 0) {
    els.rewardActionList.innerHTML = `<div class="helper">No stamps yet for this customer.</div>`;
    els.grantStampBtn.disabled = false;
    els.grantStampBtn.textContent = "Grant next stamp";
    return;
  }

  let maxStamp = Math.max(...revealed);
  els.grantStampBtn.disabled = maxStamp >= 10;
  els.grantStampBtn.textContent = maxStamp >= 10 ? "Card complete" : "Grant next stamp";

  for (const stamp of revealed) {
    const issuance = rewardIssuancesByStamp.get(stamp);
    const wrap = document.createElement("div");
    wrap.className = "item";
    const status = statusText(issuance);
    const statusPill =
      issuance.redemption_status === "Redeemed"
        ? `<span class="pill success">Redeemed</span>`
        : issuance.redemption_status === "Expired"
          ? `<span class="pill danger">Expired</span>`
          : `<span class="pill neutral">Available</span>`;

    const actions =
      issuance.redemption_status
        ? ""
        : `
          <div class="actions" style="grid-template-columns: 1fr 1fr;">
            <button class="btn btn-success btn-small" data-action="Redeemed" data-stamp="${stamp}">Mark Redeemed</button>
            <button class="btn btn-danger btn-small" data-action="Expired" data-stamp="${stamp}">Mark Expired</button>
          </div>
        `;

    wrap.innerHTML = `
      <div class="itemTitle">${escapeHtml(stamp + ") " + issuance.reward_title)}</div>
      <p class="itemSub">Status: ${statusPill}</p>
      ${actions}
    `;
    els.rewardActionList.appendChild(wrap);
  }

  els.rewardActionList.querySelectorAll("button[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => redeemStamp(btn.dataset.action, Number(btn.dataset.stamp)));
  });
}

async function grantNextStamp() {
  showError(els.grantError, null);
  if (!customerProfile) return;

  if (mockMode) {
    const revealed = [...rewardIssuancesByStamp.keys()].sort((a, b) => a - b);
    const maxStamp = revealed.length ? Math.max(...revealed) : 0;
    const nextStamp = maxStamp + 1;
    if (nextStamp > 10) return;
    if (!revealed.length && nextStamp !== 1) return;
    if (revealed.length && maxStamp !== revealed.length) {
      // Sequential rule guard
      showError(els.grantError, "Stamps must be granted sequentially.");
      return;
    }

    // Add the next stamp with default "available" status.
    mockRevealedStamps = [...new Set([...mockRevealedStamps, nextStamp])].sort((a, b) => a - b);
    buildMockRewardIssuances();
    afterStampMutation();
    return;
  }

  els.grantStampBtn.disabled = true;
  els.grantStampBtn.textContent = "Granting...";

  try {
    const { data, error } = await supabase.rpc("grant_stamp", {
      p_store_slug: storeSlug,
      p_customer_auth_user_id: customerProfile.auth_user_id
    });

    if (error) throw error;
    await afterStampMutation();
  } catch (e) {
    showError(els.grantError, e.message || "Failed to grant stamp.");
    els.grantStampBtn.disabled = false;
  }
}

async function redeemStamp(status, stampNumber) {
  if (!customerProfile) return;
  showError(els.grantError, null);

  if (mockMode) {
    if (!rewardIssuancesByStamp.has(stampNumber)) return;
    // Only allow the states the backend supports.
    if (status !== "Redeemed" && status !== "Expired") return;
    mockStatusMap = { ...mockStatusMap, [stampNumber]: status };
    buildMockRewardIssuances();
    afterStampMutation();
    return;
  }

  const btns = document.querySelectorAll(`button[data-action="${status}"][data-stamp="${stampNumber}"]`);
  btns.forEach((b) => (b.disabled = true));

  try {
    const { data, error } = await supabase.rpc("set_redemption_status", {
      p_store_slug: storeSlug,
      p_customer_auth_user_id: customerProfile.auth_user_id,
      p_stamp_number: stampNumber,
      p_status: status
    });
    if (error) throw error;
    await afterStampMutation();
  } catch (e) {
    showError(els.grantError, e.message || "Failed to update redemption status.");
  } finally {
    btns.forEach((b) => (b.disabled = false));
  }
}

async function afterStampMutation() {
  await loadRewardIssuances(customerProfile.auth_user_id);
  renderStamps();
  renderRewardActions();
}

async function handleLogin() {
  showError(els.loginError, null);
  els.loginBtn.disabled = true;
  els.loginBtn.textContent = "Logging in...";

  try {
    const email = String(els.emailInput.value || "").trim();
    const password = String(els.passwordInput.value || "");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    currentUser = data.user;

    storeId = await fetchStoreId();
    staffMember = await loadStaffMember();
    if (!staffMember) throw new Error("This staff user is not configured in staff_members for this store.");
    storeId = staffMember.store_id;

    els.mainHeading.textContent = "Smooy";
    els.mainSubHeading.textContent = storeDisplayName || "Pasir Ris Mall";
    els.customerArea.style.display = "none";
    setVisible("main");
  } catch (e) {
    showError(els.loginError, e.message || "Login failed.");
    setVisible("login");
  } finally {
    els.loginBtn.disabled = false;
    els.loginBtn.textContent = "Log in";
  }
}

async function handleSearchCustomer() {
  showError(els.searchError, null);
  showError(els.grantError, null);
  const raw = els.staffPhoneInput.value;
  if (!raw) {
    showError(els.searchError, "Enter a customer phone number.");
    return;
  }

  try {
    const phoneE164 = normalizeSingaporePhone(raw);
    const found = await loadCustomerByPhone(phoneE164);
    if (!found) {
      els.customerArea.style.display = "none";
      showError(els.searchError, "Customer not found. Ask them to enroll first.");
      customerProfile = null;
      rewardIssuancesByStamp = new Map();
      return;
    }

    customerProfile = found;
    els.customerName.textContent = found.name || "Customer";
    els.customerPhoneLine.textContent = phoneE164;
    els.customerArea.style.display = "block";

    await loadRewardIssuances(found.auth_user_id);
    renderStamps();
    renderRewardActions();
  } catch (e) {
    showError(els.searchError, e.message || "Search failed.");
  }
}

function clearCustomer() {
  customerProfile = null;
  rewardIssuancesByStamp = new Map();
  els.customerArea.style.display = "none";
  els.stampsGrid.innerHTML = "";
  els.rewardActionList.innerHTML = "";
  els.staffPhoneInput.value = "";
}

async function handleLogout() {
  await supabase.auth.signOut();
  currentUser = null;
  staffMember = null;
  storeId = null;
  customerProfile = null;
  rewardIssuancesByStamp = new Map();
  setVisible("login");
}

function wireUpUi() {
  els.loginBtn.addEventListener("click", handleLogin);
  els.searchCustomerBtn.addEventListener("click", handleSearchCustomer);
  els.clearCustomerBtn.addEventListener("click", clearCustomer);
  els.logoutBtn.addEventListener("click", handleLogout);
}

async function bootstrap() {
  setVisible("login");
  els.staffStoreTitle.textContent = storeDisplayName || "Smooy CRM";
  els.staffStoreSubtitle.textContent = "Welcome to the Smooy PRM Loyalty Club";
  wireUpUi();

  if (mockMode) {
    els.mainSubHeading.textContent = storeDisplayName || "Pasir Ris Mall";
    currentUser = { id: "mock-user" };
    storeId = "mock-store";
    staffMember = { id: "mock-staff", store_id: "mock-store" };

    customerProfile = {
      name: cfg.MOCK_CUSTOMER_NAME || "Test Customer",
      phone_e164: cfg.MOCK_PHONE_E164 || "+65",
      auth_user_id: "mock-user"
    };

    // Build the visible card state.
    buildMockRewardIssuances();

    // Show main UI
    els.customerName.textContent = customerProfile.name;
    els.customerPhoneLine.textContent = customerProfile.phone_e164;
    els.customerArea.style.display = "block";

    setVisible("main");
    renderStamps();
    renderRewardActions();
    return;
  }

  const { data } = await supabase.auth.getSession();
  if (!data.session) return;

  currentUser = data.session.user;
  storeId = await fetchStoreId();
  staffMember = await loadStaffMember();
  if (!staffMember) return setVisible("login");
  storeId = staffMember.store_id;
  setVisible("main");
  els.mainSubHeading.textContent = storeDisplayName || "Pasir Ris Mall";
}

bootstrap().catch((e) => {
  showError(els.loginError, e.message || "Something went wrong.");
});

