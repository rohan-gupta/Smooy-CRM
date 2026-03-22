const cfg = window.SMOOY_CRM_CONFIG || {};
const storeSlug = cfg.STORE_SLUG;
const storeDisplayName = cfg.STORE_DISPLAY_NAME;

const els = {
  storeTitle: document.getElementById("storeTitle"),
  storeSubtitle: document.getElementById("storeSubtitle"),
  viewLogin: document.getElementById("viewLogin"),
  viewOtp: document.getElementById("viewOtp"),
  viewProfile: document.getElementById("viewProfile"),
  viewCard: document.getElementById("viewCard"),
  loginError: document.getElementById("loginError"),
  otpError: document.getElementById("otpError"),
  profileError: document.getElementById("profileError"),

  phoneInput: document.getElementById("phoneInput"),
  sendOtpBtn: document.getElementById("sendOtpBtn"),
  otpInput: document.getElementById("otpInput"),
  verifyOtpBtn: document.getElementById("verifyOtpBtn"),
  backToLoginBtn: document.getElementById("backToLoginBtn"),

  nameInput: document.getElementById("nameInput"),
  emailInput: document.getElementById("emailInput"),
  addressInput: document.getElementById("addressInput"),
  saveProfileBtn: document.getElementById("saveProfileBtn"),

  logoutBtn: document.getElementById("logoutBtn"),

  customerNameLine: document.getElementById("customerNameLine"),
  stampsGrid: document.getElementById("stampsGrid"),
  rewardHintPill: document.getElementById("rewardHintPill"),
  rewardDetail: document.getElementById("rewardDetail"),
  rewardDetailTitle: document.getElementById("rewardDetailTitle"),
  rewardDetailSub: document.getElementById("rewardDetailSub"),
  allRewardsList: document.getElementById("allRewardsList")
};

els.storeTitle.textContent = storeDisplayName || "Smooy CRM";
els.storeSubtitle.textContent = "Welcome to the Smooy PRM Loyalty Club";

let pendingPhoneE164 = null;
let currentUser = null;
let storeId = null;
let customerProfile = null;
let rewardIssuancesByStamp = new Map();
let selectedStamp = null;
const LAST_PHONE_KEY = "smooy_last_phone_e164";

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

function getMockRevealedStamps() {
  if (Array.isArray(cfg.MOCK_REVEALED_STAMPS)) return cfg.MOCK_REVEALED_STAMPS;
  if (typeof cfg.MOCK_REVEALED_STAMPS === "string") {
    return cfg.MOCK_REVEALED_STAMPS
      .split(",")
      .map((s) => Number(String(s).trim()))
      .filter((n) => !Number.isNaN(n));
  }
  return [1, 2, 3, 4, 5, 10];
}

function getMockRedemptionStatusMap() {
  const m = cfg.MOCK_REDEMPTION_STATUS_BY_STAMP;
  if (!m || typeof m !== "object") return {};
  return m;
}

function renderMockCard() {
  const revealedStamps = getMockRevealedStamps().filter((n) => n >= 1 && n <= 10);
  const statusMap = getMockRedemptionStatusMap();

  rewardIssuancesByStamp = new Map();
  for (const stamp of revealedStamps) {
    const rewardTitle = REWARD_TITLES_BY_STAMP[stamp];
    if (!rewardTitle) continue;
    const redemptionStatus = statusMap[stamp] || null;
    rewardIssuancesByStamp.set(stamp, {
      stamp_number: stamp,
      reward_title: rewardTitle,
      redemption_status: redemptionStatus
    });
  }

  customerProfile = {
    name: cfg.MOCK_CUSTOMER_NAME || "Test Customer",
    auth_user_id: "mock-user",
    phone_e164: pendingPhoneE164,
    card_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  };

  els.customerNameLine.textContent = customerProfile.name;
  setVisible("card");
  renderStamps();
}

function setVisible(view) {
  els.viewLogin.style.display = view === "login" ? "block" : "none";
  els.viewOtp.style.display = view === "otp" ? "block" : "none";
  els.viewProfile.style.display = view === "profile" ? "block" : "none";
  els.viewCard.style.display = view === "card" ? "block" : "none";
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
  // Accept either:
  // - local 8-digit: 97813023
  // - or already E.164-ish: 6597813023 / +6597813023
  if (digits.length === 8) return `+65${digits}`;
  if (digits.length === 10 && digits.startsWith("65")) return `+${digits}`;
  // Also accept numbers prefixed with 0 (e.g., 097813023 -> +6597813023)
  if (digits.length === 9 && digits.startsWith("0")) return `+65${digits.slice(1)}`;
  throw new Error("Please enter a valid Singapore phone number.");
}

function renderStamps() {
  els.stampsGrid.innerHTML = "";
  els.allRewardsList.style.display = "none";
  els.rewardHintPill.style.display = "none";
  els.rewardDetail.style.display = "none";

  for (let stamp = 1; stamp <= 10; stamp++) {
    const issuance = rewardIssuancesByStamp.get(stamp);
    const div = document.createElement("div");
    div.className = "stamp";
    div.setAttribute("data-stamp", String(stamp));
    div.innerHTML = `
      <span class="stampDoor" aria-hidden="true"></span>
      <span class="stampSymbol" aria-hidden="true"></span>
    `;
    div.querySelector(".stampSymbol").innerHTML = getStampSymbolSvg(stamp);
    if (issuance) {
      div.classList.add("revealed");
      if (stamp === selectedStamp) div.classList.add("selected");
      div.style.cursor = "pointer";
      div.addEventListener("click", () => {
        selectedStamp = stamp;
        renderStamps();
        renderRewardDetail();
      });
    }
    els.stampsGrid.appendChild(div);
  }

  // "Only showcase the stamp you click": we keep reward details inside `rewardDetail`
  // and do not show an "all revealed rewards" list.
  const revealed = [...rewardIssuancesByStamp.keys()].sort((a, b) => a - b);
  if (revealed.length > 0) {
    els.rewardHintPill.style.display = "inline-flex";
  }
}

function getStampSymbolSvg(stamp) {
  // Inline SVG "icons" so the UI looks good offline (no external image hosting).
  const c = "currentColor";
  if (stamp === 1) {
    // Topping sprinkle
    return `
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <circle cx="8" cy="10" r="1.7" fill="${c}"/>
        <circle cx="12" cy="6.5" r="1.7" fill="${c}"/>
        <circle cx="16" cy="10" r="1.7" fill="${c}"/>
        <path d="M9 18c1.2-0.9 4.8-0.9 6 0" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  }
  if (stamp === 2) {
    // Cup
    return `
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M8 6h8l-1 14H9L8 6z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M9 6l-1-2h8l-1 2" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M7.5 10H6a3 3 0 0 0 3 3" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  }
  if (stamp === 3) {
    // Yogurt cup (smaller)
    return `
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M9 5h6l-1 16H10L9 5z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M9 9h6" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
        <path d="M8 5l-2-2" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  }
  if (stamp === 4) {
    // Spin (arrows)
    return `
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M7 7a7 7 0 0 1 11 2" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
        <path d="M18 9l1 2-2-1" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M17 17a7 7 0 0 1-11-2" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
        <path d="M6 15l-1-2 2 1" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }
  if (stamp === 5 || stamp === 8) {
    // Voucher ticket
    const amount = stamp === 5 ? "S$5" : "S$10";
    return `
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M7 7h10v3a2 2 0 0 0 0 4v3H7V7z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>
        <text x="12" y="14.5" text-anchor="middle" font-size="8" font-weight="900" fill="${c}" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif">${amount}</text>
      </svg>
    `;
  }
  if (stamp === 6) {
    // Choose 2 (double dot)
    return `
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <circle cx="10" cy="10" r="3" fill="none" stroke="${c}" stroke-width="2"/>
        <circle cx="14.5" cy="14" r="3" fill="none" stroke="${c}" stroke-width="2"/>
      </svg>
    `;
  }
  if (stamp === 7) {
    // Double toppings (two sprinkles)
    return `
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <circle cx="8" cy="9" r="1.7" fill="${c}"/>
        <circle cx="16" cy="9" r="1.7" fill="${c}"/>
        <circle cx="12" cy="13.5" r="1.7" fill="${c}"/>
        <path d="M9 18c1.2-0.9 4.8-0.9 6 0" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  }
  if (stamp === 9) {
    // Surprise (question)
    return `
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M9.2 9a3.2 3.2 0 0 1 6.2 1c0 2-2 2.4-2 3.8" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="17.2" r="1.2" fill="${c}"/>
      </svg>
    `;
  }
  if (stamp === 10) {
    // Big reward (star)
    return `
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M12 2l3.1 7.2 7.9.7-6 5.1 1.8 7.6-6.8-4-6.8 4 1.8-7.6-6-5.1 7.9-.7L12 2z" fill="${c}"/>
      </svg>
    `;
  }
  return "";
}

function statusText(issuance) {
  if (!issuance) return "Locked";
  if (!issuance.redemption_status) {
    if (customerProfile && customerProfile.card_expires_at) {
      const expiresAt = new Date(customerProfile.card_expires_at).getTime();
      if (!Number.isNaN(expiresAt) && Date.now() > expiresAt) return "Expired";
    }
    return "Available";
  }
  if (issuance.redemption_status === "Redeemed") return "Redeemed";
  if (issuance.redemption_status === "Expired") return "Expired";
  return String(issuance.redemption_status);
}

function renderAllRewardsList(revealedStamps) {
  els.allRewardsList.innerHTML = "";
  for (const stamp of revealedStamps) {
    const issuance = rewardIssuancesByStamp.get(stamp);
    const el = document.createElement("div");
    el.className = "item";
    const title = `${stamp}) ${issuance.reward_title}`;
    el.innerHTML = `
      <div class="itemTitle">${escapeHtml(title)}</div>
      <p class="itemSub">Status: ${escapeHtml(statusText(issuance))}</p>
    `;
    els.allRewardsList.appendChild(el);
  }
}

function renderRewardDetail() {
  const stamp = selectedStamp;
  const issuance = rewardIssuancesByStamp.get(stamp);
  if (!issuance) return;
  els.rewardDetail.style.display = "block";
  els.rewardDetailTitle.textContent = `${stamp}) ${issuance.reward_title}`;
  const status = statusText(issuance);
  const expiresAt = customerProfile && customerProfile.card_expires_at
    ? new Date(customerProfile.card_expires_at).toLocaleDateString()
    : null;
  if (expiresAt) {
    els.rewardDetailSub.innerHTML = `Status: ${escapeHtml(status)}<br/>Valid until: ${escapeHtml(expiresAt)}`;
  } else {
    els.rewardDetailSub.textContent = `Status: ${status}`;
  }
}

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

async function handleSendOtp() {
  try {
    const input = els.phoneInput.value || cfg.MOCK_PHONE_E164 || "";
    pendingPhoneE164 = normalizeSingaporePhone(input);
    localStorage.setItem(LAST_PHONE_KEY, pendingPhoneE164);
    showError(els.loginError, null);
  } catch (e) {
    showError(els.loginError, e.message || "Invalid phone number.");
    return;
  }
  renderMockCard();
}

async function handleVerifyOtp() {
  renderMockCard();
}

async function handleSaveProfile() {
  showError(els.profileError, null);
  const name = String(els.nameInput.value || "").trim();
  if (!name) {
    showError(els.profileError, "Name is required.");
    return;
  }
  if (cfg.MOCK_CUSTOMER_NAME !== undefined) cfg.MOCK_CUSTOMER_NAME = name;
  renderMockCard();
}

async function handleLogout() {
  currentUser = null;
  customerProfile = null;
  rewardIssuancesByStamp = new Map();
  selectedStamp = null;
  pendingPhoneE164 = null;
  setVisible("login");
  els.phoneInput.value = "";
  els.otpInput.value = "";
}

function wireUpUi() {
  els.sendOtpBtn.addEventListener("click", handleSendOtp);
  els.verifyOtpBtn.addEventListener("click", handleVerifyOtp);
  els.backToLoginBtn.addEventListener("click", () => {
    setVisible("login");
    showError(els.otpError, null);
  });
  els.saveProfileBtn.addEventListener("click", handleSaveProfile);
  els.logoutBtn.addEventListener("click", handleLogout);
}

async function bootstrap() {
  wireUpUi();
  setVisible("login");
}

bootstrap().catch((e) => {
  showError(els.loginError, e.message || "Something went wrong.");
});

