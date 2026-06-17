const services = [
  { name: "מניקור בסיסי", price: 80 },
  { name: "מניקור + לק ג'ל", price: 120 },
  { name: "בניית ציפורניים", price: 180 }
];

function selectStyle(style) {
  document.getElementById("chosenStyle").innerText = `נבחר סגנון: ${style}`;

  document.querySelectorAll(".style-card").forEach(card => card.classList.remove("selected"));
  event.currentTarget.classList.add("selected");

  const styleSelect = document.getElementById("styleSelect");
  if (styleSelect) styleSelect.value = style;
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

function sendAppointment(event) {
  event.preventDefault();
  const name = document.getElementById("name").value.trim();
  const date = document.getElementById("date").value;
  const style = document.getElementById("styleSelect").value;
  const confirmMsg = document.getElementById("confirmMsg");

  if (name && date) {
    const styleTxt = style ? ` (סגנון: ${style})` : "";
    confirmMsg.className = "confirm-msg";
    confirmMsg.innerText = `תודה ${name}! בקשתך לתאריך ${date}${styleTxt} נשלחה בהצלחה. נחזור אלייך בקרוב 💅`;
    document.getElementById("appointmentForm").reset();
  } else {
    confirmMsg.className = "confirm-msg error";
    confirmMsg.innerText = "אנא מלאי שם ותאריך לפני השליחה";
  }
}

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
