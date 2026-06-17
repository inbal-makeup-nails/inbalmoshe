// ===== סגנונות =====
const services = [
  { name: "מניקור בסיסי", price: 80 },
  { name: "מניקור + לק ג'ל", price: 120 },
  { name: "בניית ציפורניים", price: 180 }
];

function selectStyle(style) {
  document.getElementById("chosenStyle").innerText = `נבחר סגנון: ${style}`;
  document.querySelectorAll(".style-card").forEach(c => c.classList.remove("selected"));
  event.currentTarget.classList.add("selected");
  const s = document.getElementById("styleSelect");
  if (s) s.value = style;
}

function calcPrice() {
  const select = document.getElementById("serviceType");
  const selectedText = select.options[select.selectedIndex].text;
  const service = services.find(s => selectedText.includes(s.name));
  const result = document.getElementById("result");
  if (!service) {
    result.innerText = "בחרי טיפול קודם";
  } else {
    result.innerText = `המחיר המשוער לשירות "${service.name}" הוא ${service.price} ₪`;
  }
}

// ===== יומן תורים =====
const AVAILABLE_HOURS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];
const CLOSED_DAYS = [6]; // שבת = 6

let currentYear, currentMonth, selectedDate = null, selectedTime = null;

function getBookedSlots() {
  return JSON.parse(localStorage.getItem("bookedSlots") || "{}");
}

function bookSlot(dateStr, time) {
  const booked = getBookedSlots();
  if (!booked[dateStr]) booked[dateStr] = [];
  booked[dateStr].push(time);
  localStorage.setItem("bookedSlots", JSON.stringify(booked));
}

function isSlotBooked(dateStr, time) {
  const booked = getBookedSlots();
  return booked[dateStr] && booked[dateStr].includes(time);
}

function isDateAvailable(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return false;
  if (CLOSED_DAYS.includes(date.getDay())) return false;
  const dateStr = toDateStr(date);
  const booked = getBookedSlots()[dateStr] || [];
  return booked.length < AVAILABLE_HOURS.length;
}

function toDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

function toHebrewDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  const months = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
  return `${parseInt(d)} ב${months[parseInt(m)-1]} ${y}`;
}

function initCalendar() {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth();
  renderCalendar();
}

function changeMonth(dir) {
  currentMonth += dir;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  if (currentMonth < 0)  { currentMonth = 11; currentYear--; }
  renderCalendar();
}

function renderCalendar() {
  const months = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
  document.getElementById("calMonthLabel").textContent = `${months[currentMonth]} ${currentYear}`;

  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // תאים ריקים לפני היום הראשון (שבוע מתחיל ב-א = 0)
  for (let i = 0; i < firstDay; i++) {
    grid.appendChild(Object.assign(document.createElement("div"), { className: "cal-day" }));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(currentYear, currentMonth, d);
    const dateStr = toDateStr(date);
    const div = document.createElement("div");
    div.textContent = d;
    div.className = "cal-day";

    if (date < today) {
      div.classList.add("past");
    } else if (CLOSED_DAYS.includes(date.getDay())) {
      div.classList.add("unavailable");
    } else if (!isDateAvailable(date)) {
      div.classList.add("unavailable");
    } else {
      div.classList.add("available");
      if (toDateStr(date) === toDateStr(today)) div.classList.add("today");
      if (selectedDate === dateStr) div.classList.add("selected");
      div.onclick = () => selectDate(dateStr);
    }

    grid.appendChild(div);
  }
}

function selectDate(dateStr) {
  selectedDate = dateStr;
  selectedTime = null;
  renderCalendar();
  document.getElementById("selectedDateLabel").textContent = `תורים פנויים ל-${toHebrewDate(dateStr)}`;
  renderTimeSlots(dateStr);
  goToStep(2);
}

function renderTimeSlots(dateStr) {
  const container = document.getElementById("timeSlots");
  container.innerHTML = "";
  AVAILABLE_HOURS.forEach(time => {
    const btn = document.createElement("button");
    btn.textContent = time;
    btn.className = "time-slot";
    btn.type = "button";
    if (isSlotBooked(dateStr, time)) {
      btn.classList.add("booked");
      btn.disabled = true;
    } else {
      btn.onclick = () => selectTime(time);
    }
    container.appendChild(btn);
  });
}

function selectTime(time) {
  selectedTime = time;
  document.querySelectorAll(".time-slot").forEach(b => b.classList.remove("selected"));
  event.currentTarget.classList.add("selected");
  document.getElementById("bookingSummary").innerHTML =
    `📅 <strong>${toHebrewDate(selectedDate)}</strong> &nbsp;|&nbsp; 🕐 <strong>${time}</strong>`;
  goToStep(3);
}

function goToStep(n) {
  document.querySelectorAll(".booking-step").forEach(s => s.classList.add("hidden"));
  document.getElementById(`step${n}`).classList.remove("hidden");
}

function sendAppointment(event) {
  event.preventDefault();
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const style = document.getElementById("styleSelect").value;
  const confirmMsg = document.getElementById("confirmMsg");

  if (!selectedDate || !selectedTime) {
    confirmMsg.className = "confirm-msg error";
    confirmMsg.innerText = "שגיאה: לא נבחר תאריך ושעה";
    return;
  }

  bookSlot(selectedDate, selectedTime);

  const styleTxt = style ? ` | סגנון: ${style}` : "";
  confirmMsg.className = "confirm-msg";
  confirmMsg.innerHTML = `✅ תודה <strong>${name}</strong>!<br>התור שלך נקבע ל-<strong>${toHebrewDate(selectedDate)}</strong> בשעה <strong>${selectedTime}</strong>${styleTxt}.<br>נשמח לראותך! 💅`;

  document.getElementById("appointmentForm").reset();
  selectedDate = null;
  selectedTime = null;
  renderCalendar();

  setTimeout(() => goToStep(1), 4000);
}

// ===== ניווט =====
function toggleMenu() {
  document.querySelector(".nav-links").classList.toggle("open");
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) target.scrollIntoView({ behavior: "smooth" });
    document.querySelector(".nav-links").classList.remove("open");
  });
});

// ===== אתחול =====
initCalendar();
