// ===== SoulPalette — shared script =====

const STORAGE_KEY = "soulpalette_journal";

// Category lookup: quiz answer value -> mood/color/flower + a short reflection
const CATEGORIES = {
  energetic: {
    mood: "Energetic", color: "Yellow", flower: "Sunflower", cls: "bg-yellow",
    note: "Your answers lean toward yellow and the sunflower — steady, open-faced warmth that doesn't sit still for long. This is usually a good day to move, start something, or be around people."
  },
  peaceful: {
    mood: "Peaceful", color: "Purple", flower: "Lavender", cls: "bg-purple",
    note: "Your answers lean toward purple and lavender — a mind that's asking for quiet rather than stimulation. Worth protecting some unscheduled time today, even briefly."
  },
  passionate: {
    mood: "Passionate", color: "Red", flower: "Rose", cls: "bg-red",
    note: "Your answers lean toward red and the rose — something that wants to be felt fully rather than managed. A good day for honest conversation, not small talk."
  },
  calm: {
    mood: "Calm & grounded", color: "Green", flower: "Lotus", cls: "bg-green",
    note: "Your answers lean toward green and the lotus — resilience that doesn't need to announce itself. Solitude and time outdoors are likely to help more than company today."
  }
};

// Highlight active nav link based on current page
document.addEventListener("DOMContentLoaded", () => {
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach(link => {
    if (link.getAttribute("href") === current) {
      link.classList.add("active");
    }
  });

  if (document.getElementById("journalList")) {
    renderJournal();
  }
});

// ---- Discover quiz ----
function runQuiz() {
  const form = document.getElementById("quizForm");
  const answers = ["q1", "q2", "q3", "q4"].map(name => {
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : null;
  });

  if (answers.includes(null)) {
    document.getElementById("quizWarning").style.display = "block";
    return;
  }
  document.getElementById("quizWarning").style.display = "none";

  // Tally votes per category, pick the highest (first one wins ties)
  const tally = {};
  answers.forEach(a => { tally[a] = (tally[a] || 0) + 1; });
  const winner = Object.keys(tally).reduce((a, b) => (tally[b] > tally[a] ? b : a));

  const result = CATEGORIES[winner];
  showResult(result);
  saveToJournal(result);
}

function showResult(result) {
  const box = document.getElementById("resultBox");
  box.className = "sp-card p-4 mt-4 " + result.cls;
  box.innerHTML = `
    <h5>${result.mood} — ${result.color}, ${result.flower}</h5>
    <p class="mb-0">${result.note}</p>`;
  box.style.display = "block";
  box.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ---- Journal (localStorage) ----
function saveToJournal(result) {
  const entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  entries.unshift({
    date: new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }),
    mood: result.mood, color: result.color, flower: result.flower, cls: result.cls
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 30))); // keep last 30
}

function renderJournal() {
  const entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  const list = document.getElementById("journalList");
  const empty = document.getElementById("journalEmpty");

  if (entries.length === 0) {
    empty.style.display = "block";
    list.innerHTML = "";
    return;
  }
  empty.style.display = "none";

  list.innerHTML = entries.map(e => `
    <div class="sp-card ${e.cls} p-3 mb-3">
      <strong>${e.mood}</strong> — ${e.color}, ${e.flower}
      <div class="small text-muted">${e.date}</div>
    </div>`).join("");
}

function clearJournal() {
  if (confirm("Clear your whole journal history?")) {
    localStorage.removeItem(STORAGE_KEY);
    renderJournal();
  }
}
