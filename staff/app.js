const cfg = window.SMOOY_CRM_CONFIG || {};
const storeSlug = cfg.STORE_SLUG;
const storeDisplayName = cfg.STORE_DISPLAY_NAME;

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

  const revealed = [...rewardIssuancesByStamp.keys()].sort((a, b) => a - b);
  const maxStamp = revealed.length ? Math.max(...revealed) : 0;
  const nextStamp = maxStamp + 1;
  if (nextStamp > 10) return;
  if (!revealed.length && nextStamp !== 1) return;
  if (revealed.length && maxStamp !== revealed.length) {
    showError(els.grantError, "Stamps must be granted sequentially.");
    return;
  }

  mockRevealedStamps = [...new Set([...mockRevealedStamps, nextStamp])].sort((a, b) => a - b);
  buildMockRewardIssuances();
  afterStampMutation();
}

async function redeemStamp(status, stampNumber) {
  if (!customerProfile) return;
  showError(els.grantError, null);

  if (!rewardIssuancesByStamp.has(stampNumber)) return;
  if (status !== "Redeemed" && status !== "Expired") return;
  mockStatusMap = { ...mockStatusMap, [stampNumber]: status };
  buildMockRewardIssuances();
  afterStampMutation();
}

function afterStampMutation() {
  renderStamps();
  renderRewardActions();
}

async function handleLogin() {
  showError(els.loginError, null);
  currentUser = { id: "mock-user" };
  storeId = "mock-store";
  staffMember = { id: "mock-staff", store_id: "mock-store" };
  els.mainHeading.textContent = "Smooy";
  els.mainSubHeading.textContent = storeDisplayName || "Pasir Ris Mall";
  els.customerArea.style.display = "none";
  setVisible("main");
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
    customerProfile = {
      name: cfg.MOCK_CUSTOMER_NAME || "Test Customer",
      phone_e164: phoneE164,
      auth_user_id: "mock-user"
    };
    els.customerName.textContent = customerProfile.name;
    els.customerPhoneLine.textContent = phoneE164;
    els.customerArea.style.display = "block";

    buildMockRewardIssuances();
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
  currentUser = null;
  staffMember = null;
  storeId = null;
  customerProfile = null;
  rewardIssuancesByStamp = new Map();
  setVisible("login");
}

function wireUpUi() {
  els.loginBtn.addEventListener("click", handleLogin);
  els.grantStampBtn.addEventListener("click", grantNextStamp);
  els.searchCustomerBtn.addEventListener("click", handleSearchCustomer);
  els.clearCustomerBtn.addEventListener("click", clearCustomer);
  els.logoutBtn.addEventListener("click", handleLogout);
}

async function bootstrap() {
  els.staffStoreTitle.textContent = storeDisplayName || "Smooy CRM";
  els.staffStoreSubtitle.textContent = "Welcome to the Smooy PRM Loyalty Club";
  wireUpUi();
  setVisible("login");
}

bootstrap().catch((e) => {
  showError(els.loginError, e.message || "Something went wrong.");
});

