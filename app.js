const SUPABASE_URL = "https://fzaxbvrhqrkwiahrrtno.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_CPLul0ppDpD-ziRcrhbv-Q_8H9G_UvQ";

const countries = [
  ["EG","مصر","+20"],["SA","السعودية","+966"],["AE","الإمارات","+971"],["KW","الكويت","+965"],
  ["QA","قطر","+974"],["BH","البحرين","+973"],["OM","عُمان","+968"],["JO","الأردن","+962"],
  ["IQ","العراق","+964"],["MA","المغرب","+212"],["DZ","الجزائر","+213"],["TN","تونس","+216"],
  ["LY","ليبيا","+218"],["SD","السودان","+249"],["PS","فلسطين","+970"],["TR","تركيا","+90"],
  ["GB","المملكة المتحدة","+44"],["US","الولايات المتحدة","+1"],["CA","كندا","+1"],["FR","فرنسا","+33"],
  ["DE","ألمانيا","+49"],["IT","إيطاليا","+39"],["ES","إسبانيا","+34"],["AU","أستراليا","+61"],
  ["IN","الهند","+91"],["PK","باكستان","+92"],["ID","إندونيسيا","+62"],["MY","ماليزيا","+60"],
  ["JP","اليابان","+81"],["CN","الصين","+86"],["BR","البرازيل","+55"],["ZA","جنوب أفريقيا","+27"]
];

let selected = countries[0], otpSeconds = 0, timerId = null;

const $ = id => document.getElementById(id);
const setMessage = (text, type="") => { $("message").textContent = text; $("message").className = `message ${type}`; };

function renderCountries(filter="") {
  const q = filter.trim().toLowerCase();
  const list = countries.filter(c => !q || c[1].toLowerCase().includes(q) || c[2].includes(q) || c[0].toLowerCase().includes(q));
  $("countryList").innerHTML = list.map(c =>
    `<button type="button" class="country ${c[0]===selected[0] ? "active":""}" data-code="${c[0]}"><b>${c[1]}</b><span>${c[2]}</span></button>`
  ).join("");
  document.querySelectorAll(".country").forEach(btn => btn.onclick = () => {
    selected = countries.find(c => c[0] === btn.dataset.code) || selected;
    $("dialCode").textContent = selected[2];
    renderCountries($("countrySearch").value);
  });
}

function normalizePhone(raw) {
  let digits = raw.trim().replace(/[^\d+]/g, "");
  if (digits.startsWith("00")) digits = "+" + digits.slice(2);
  if (digits.startsWith("+")) return digits;
  digits = digits.replace(/^0+/, "");
  return selected[2] + digits;
}

async function supabase(path, body) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_PUBLISHABLE_KEY,
      "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
    },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.msg || data.error_description || data.message || "تعذر إكمال العملية.");
  return data;
}

function startTimer() {
  clearInterval(timerId); otpSeconds = 60; $("resendOtp").disabled = true;
  const tick = () => {
    $("timer").textContent = otpSeconds ? `(${otpSeconds})` : "";
    if (!otpSeconds) { clearInterval(timerId); $("resendOtp").disabled = false; return; }
    otpSeconds--;
  };
  tick(); timerId = setInterval(tick, 1000);
}

async function sendOtp() {
  const phone = normalizePhone($("phone").value);
  if (!/^\+[1-9]\d{6,14}$/.test(phone)) { setMessage("اكتب رقمًا دوليًا صحيحًا.", "error"); return; }
  $("sendOtp").disabled = true; setMessage("جاري إرسال رمز التحقق…");
  try {
    await supabase("/auth/v1/otp", { phone });
    $("otpBox").hidden = false; setMessage("تم إرسال رمز التحقق إلى هاتفك.", "ok"); startTimer();
  } catch (e) { setMessage(e.message, "error"); }
  finally { $("sendOtp").disabled = false; }
}

async function verifyOtp() {
  const phone = normalizePhone($("phone").value), token = $("otp").value.trim();
  if (!/^\d{4,8}$/.test(token)) { setMessage("أدخل رمز التحقق.", "error"); return; }
  $("verifyOtp").disabled = true; setMessage("جاري التحقق…");
  try {
    const data = await supabase("/auth/v1/verify", { phone, token, type: "sms" });
    localStorage.setItem("zeno_session", JSON.stringify(data));
    showHome();
  } catch (e) { setMessage(e.message, "error"); }
  finally { $("verifyOtp").disabled = false; }
}

function showHome() { $("authView").hidden = true; $("homeView").hidden = false; }
function showAuth() { $("authView").hidden = false; $("homeView").hidden = true; }

$("countrySearch").addEventListener("input", e => renderCountries(e.target.value));
$("sendOtp").onclick = sendOtp;
$("verifyOtp").onclick = verifyOtp;
$("resendOtp").onclick = sendOtp;
$("logout").onclick = () => { localStorage.removeItem("zeno_session"); showAuth(); };

renderCountries();

window.addEventListener("load", () => {
  setTimeout(() => {
    $("splash").classList.add("hide");
    $("app").hidden = false;
    if (localStorage.getItem("zeno_session")) showHome();
  }, 2200);
});
