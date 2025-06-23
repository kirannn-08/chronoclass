document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  const classID = localStorage.getItem("classID");

  if (!role || !classID) {
    window.location.href = "login_reg.html";
  }
});

let timerDisplay = document.getElementById('timer');
let startBtn = document.getElementById('startBtn');
let resetBtn = document.getElementById('resetBtn');


let timer;
let seconds = 0;
let isRunning = false;



//timer //


function updateTimer() {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  timerDisplay.textContent = `${mins}:${secs}`;
}

startBtn.addEventListener('click', () => {
  if (!isRunning) {
    timer = setInterval(() => {
      seconds++;
      updateTimer();
    }, 1000);
    startBtn.textContent = 'Pause';
    isRunning = true;
  } else {
    clearInterval(timer);
    startBtn.textContent = 'Start';
    isRunning = false;
  }
});

resetBtn.addEventListener('click', () => {
  clearInterval(timer);
  seconds = 0;
  updateTimer();
  startBtn.textContent = 'Start';
  isRunning = false;
});






// 📌 Sidebar Navigation
function setupSidebarNavigation() {
  const links = document.querySelectorAll(".sidebar-menu a");
  const pages = document.querySelectorAll(".page");

  links.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("data-target");

      pages.forEach(p => p.style.display = "none");

      const targetPage = document.getElementById(targetId);
      if (targetPage) targetPage.style.display = "block";

      links.forEach(l => l.classList.remove("active"));
      this.classList.add("active");
    });
  });
}


//module variable constants //

const classID = localStorage.getItem("classID"); // Already done in login

// Firestore ref to your class document
const classRef = db.collection("classes").doc(classID);

//events


const key = `${classID}-events`;

// CR add - toggle form
function toggleMessageForm() {
  const form = document.getElementById('event-message-form');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function parseEventMessage() {
  const msg = document.getElementById('event-message').value;

  const titleMatch = msg.match(/\*(.*?)\*/);
  const dateMatch = msg.match(/(?: Date|date|at|At):\s*(.*)/i);
  const timeMatch = msg.match(/(?: Time|time|From|starts at|Timing):\s*(.*)/i);
  const locationMatch = msg.match(/(?: location|Location|Venue|Place):\s*(.*)/i);

  const title = titleMatch ? titleMatch[1] : "Untitled Event";
  const dateStr = dateMatch ? dateMatch[1].trim() : "";
  const time = timeMatch ? timeMatch[1].trim() : "";
  const location = locationMatch ? locationMatch[1].trim() : "";
  const desc = msg.trim();

  const date = formatDateForStorage(dateStr);

  document.getElementById("event-title").value = title;
  document.getElementById("event-date").value = date;
  document.getElementById("event-time").value = time;
  document.getElementById("event-location").value = location;
  document.getElementById("event-description").value = desc;
}

async function saveManualEvent() {
  const classID = localStorage.getItem("classID");

  const title = document.getElementById("event-title").value.trim();
  const date = document.getElementById("event-date").value.trim();
  const time = document.getElementById("event-time").value.trim();
  const location = document.getElementById("event-location").value.trim();
  const desc = document.getElementById("event-description").value.trim();

  if (!title || !date) {
    alert("Please enter at least title and date.");
    return;
  }

  const newEvent = { title, date, time, location, desc, createdAt: new Date() };

  try {
    await firebase.firestore()
      .collection("classes")
      .doc(classID)
      .collection("events")
      .add(newEvent);

    alert("✅ Event saved!");
    document.getElementById("event-message-form").reset();
    renderEvents();
  } catch (error) {
    console.error("❌ Error saving event:", error);
    alert("❌ Failed to save event.");
  }
}

function formatDateForStorage(dateStr) {
  const months = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12"
  };
  const match = dateStr.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})/);
  if (!match) return "";
  const [_, day, monStr, year] = match;
  const month = months[monStr.toLowerCase().substring(0, 3)];
  return `${year}-${month}-${day.padStart(2, '0')}`;
}

async function renderEvents() {
  const classID = localStorage.getItem("classID");
  const role = localStorage.getItem("role");
  const container = document.getElementById("events-container");
  container.innerHTML = "";

  try {
    const snapshot = await firebase.firestore()
      .collection("classes")
      .doc(classID)
      .collection("events")
      .get();

    let events = [];
    snapshot.forEach(doc => events.push({ id: doc.id, ...doc.data() }));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort: upcoming first, past last
    events.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      dateA.setHours(0, 0, 0, 0);
      dateB.setHours(0, 0, 0, 0);
      const isPastA = dateA < today;
      const isPastB = dateB < today;
      if (isPastA && !isPastB) return 1;
      if (!isPastA && isPastB) return -1;
      return dateA - dateB;
    });

    // Render each event
    events.forEach(event => {
      const div = document.createElement("div");
      div.classList.add("event-card");

      div.innerHTML = `
        <h3 class="event-title">${event.title}</h3>
        <span class="time-left">${getTimeLeftText(event.date)}</span>
        <div class="event-info">
          <p>📅 <input type="date" value="${event.date}" onchange="updateEvent('${event.id}', 'date', this.value)" ${role !== 'cr' ? 'disabled' : ''} /></p>
          <p>⏰ <input type="text" value="${event.time || ''}" placeholder="Time" onchange="updateEvent('${event.id}', 'time', this.value)" ${role !== 'cr' ? 'disabled' : ''} /></p>
          <p>📍 <input type="text" value="${event.location || ''}" placeholder="Location" onchange="updateEvent('${event.id}', 'location', this.value)" ${role !== 'cr' ? 'disabled' : ''} /></p>
        </div>
        <div class="event-desc">
          <strong>Description:</strong>
          <p>${event.desc || "No description provided."}</p>
        </div>
        ${event.link ? `<a href="${event.link}" target="_blank" class="event-link">🔗 More Info</a>` : ''}
        ${role === 'cr' ? `<button onclick="deleteEvent('${event.id}')" class="delete-btn">Delete</button>` : ''}
      `;
      container.appendChild(div);
    });

  } catch (err) {
    console.error("Error loading events:", err);
    container.innerHTML = `<p>❌ Failed to load events.</p>`;
  }
}

async function updateEvent(eventId, field, value) {
  const classID = localStorage.getItem("classID");

  try {
    await firebase.firestore()
      .collection("classes")
      .doc(classID)
      .collection("events")
      .doc(eventId)
      .update({ [field]: value });

    renderEvents(); // Re-render UI
  } catch (error) {
    console.error("Error updating event:", error);
    alert("❌ Failed to update event.");
  }
}

async function deleteEvent(eventId) {
  if (!confirm("Are you sure you want to delete this event?")) return;

  const classID = localStorage.getItem("classID");

  try {
    await firebase.firestore()
      .collection("classes")
      .doc(classID)
      .collection("events")
      .doc(eventId)
      .delete();

    renderEvents(); // Re-render UI
  } catch (error) {
    console.error("Error deleting event:", error);
    alert("❌ Failed to delete event.");
  }
}

function getTimeLeftText(dateStr) {
  if (!dateStr) return "";
  const today = new Date();
  const eventDate = new Date(dateStr);
  const diff = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "🟡 Today";
  if (diff === 1) return "🟠 1 day left";
  if (diff > 1) return `🟢 ${diff} days left`;
  return "🔴 Past event";
}

function filterEvents() {
  const query = document.getElementById("search-input").value.toLowerCase();
  const allCards = document.querySelectorAll(".event-card");

  allCards.forEach(card => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(query) ? "block" : "none";
  });
}









// CLASS COUNT SECTION
const SUBJECTS_KEY = `${classID}-subjects`;

let selectedSubjectIndex = null;

async function getSubjects() {
  const classID = localStorage.getItem("classID");
  try {
    const snapshot = await firebase.firestore()
      .collection("classes")
      .doc(classID)
      .collection("subjects")
      .get();

    const subjects = [];
    snapshot.forEach(doc => {
      subjects.push({ id: doc.id, ...doc.data() });
    });

    return subjects;
  } catch (err) {
    console.error("❌ Error fetching subjects from subcollection:", err);
    return [];
  }
}

async function saveSubjects(subjects) {
  const classID = localStorage.getItem("classID");
  const subjectsRef = firebase.firestore()
    .collection("classes")
    .doc(classID)
    .collection("subjects");

  const batch = firebase.firestore().batch();

  try {
    // Clear all existing documents (optional but keeps consistency)
    const existing = await subjectsRef.get();
    existing.forEach(doc => batch.delete(doc.ref));

    // Add new subjects
    subjects.forEach(subj => {
      const newDoc = subjectsRef.doc(); // Let Firestore assign ID
      batch.set(newDoc, subj);
    });

    await batch.commit();
    console.log("✅ Subjects saved to subcollection.");
  } catch (err) {
    console.error("❌ Error saving subjects:", err);
    alert("❌ Failed to save subjects.");
  }
}

// 🔁 Render Subject Cards
async function renderSubjects() {
  const classID = localStorage.getItem("classID");
  const role = localStorage.getItem("role");
  const container = document.getElementById("subjects-container");
  container.innerHTML = "";

  try {
    const snapshot = await firebase.firestore()
      .collection("classes")
      .doc(classID)
      .collection("subjects")
      .get();

    snapshot.forEach(doc => {
      const subj = doc.data();
      const div = document.createElement("div");
      div.className = "class-card";
      div.style.backgroundColor = subj.color || "#3498db";
      div.innerHTML = `
        <p class="subject">${subj.name} (${subj.code})</p>
        <p class="count">${Array.isArray(subj.dates) ? subj.dates.length : 0}</p>
        ${role === "cr" ? `<button class="delete-subject" onclick="deleteSubject('${doc.id}')">Delete</button>` : ""}
      `;
      div.onclick = () => openModal(doc.id);
      container.appendChild(div);
    });
  } catch (err) {
    console.error("❌ Failed to render subjects:", err);
    container.innerHTML = `<p>❌ Unable to load subjects.</p>`;
  }
}
// 🔽 Populate Subject Dropdown for Timetable
async function populateSubjectDropdown() {
  const classID = localStorage.getItem("classID");
  const select = document.getElementById("timetable-subject-code");

  select.innerHTML = `<option disabled selected>Select Subject</option>`;

  try {
    const snapshot = await firebase.firestore()
      .collection("classes")
      .doc(classID)
      .collection("subjects")
      .get();

    if (snapshot.empty) {
      const opt = document.createElement("option");
      opt.textContent = "❌ No subjects found";
      opt.disabled = true;
      select.appendChild(opt);
      return;
    }

    snapshot.forEach(doc => {
      const subj = doc.data();
      const opt = document.createElement("option");
      opt.value = subj.code || "";
      opt.textContent = `${subj.name || "Untitled"} (${subj.code || "N/A"})`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("❌ Failed to load subjects for dropdown:", err);
    const opt = document.createElement("option");
    opt.disabled = true;
    opt.textContent = "❌ Error loading subjects";
    select.appendChild(opt);
  }
}

// ➕ Add New Subject
async function addSubject() {
  const name = document.getElementById("new-subject-name").value.trim();
  const code = document.getElementById("new-subject-code").value.trim().toUpperCase();
  const color = document.getElementById("new-subject-color").value;
  const classID = localStorage.getItem("classID");

  if (!name || !code) {
    alert("❗ Enter both subject name and code");
    return;
  }

  const subjectRef = firebase.firestore()
    .collection("classes")
    .doc(classID)
    .collection("subjects")
    .doc(code); // use subject code as ID

  try {
    const existing = await subjectRef.get();
    if (existing.exists) {
      alert("⚠️ Subject with this code already exists.");
      return;
    }

    await subjectRef.set({ name, code, color, dates: [] });
    alert("✅ Subject added!");

    // Clear input
    document.getElementById("new-subject-name").value = "";
    document.getElementById("new-subject-code").value = "";

    renderSubjects();
    populateSubjectDropdown();
  } catch (err) {
    console.error("❌ Error adding subject:", err);
    alert("❌ Failed to add subject. Check Firestore rules.");
  }
}
// ❌ Delete Subject
async function deleteSubject(docId) {
  if (!confirm("Are you sure you want to delete this subject?")) return;

  const classID = localStorage.getItem("classID");

  try {
    await firebase.firestore()
      .collection("classes")
      .doc(classID)
      .collection("subjects")
      .doc(docId)
      .delete();

    alert("✅ Subject deleted!");
    renderSubjects();
    populateSubjectDropdown();
  } catch (err) {
    console.error("❌ Error deleting subject:", err);
    alert("❌ Failed to delete subject.");
  }
}

// 📆 Modal: Show Class Dates for Subject
async function openModal(docId) {
  selectedSubjectIndex = docId;
  const classID = localStorage.getItem("classID");

  try {
    const docRef = firebase.firestore()
      .collection("classes")
      .doc(classID)
      .collection("subjects")
      .doc(docId);

    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      alert("❌ Subject not found.");
      return;
    }

    const subj = docSnap.data();
    const dates = subj.dates || [];

    document.getElementById("modal-subject-name").textContent = subj.name;
    document.getElementById("date-list").innerHTML = dates.map(d => `<li>${formatDate(d)}</li>`).join("");
    document.getElementById("date-modal").style.display = "flex";

    const role = localStorage.getItem("role");
    document.getElementById("cr-date-controls").style.display = role === "cr" ? "block" : "none";
  } catch (err) {
    console.error("❌ Error opening modal:", err);
    alert("❌ Failed to load subject details.");
  }
}

// ✖️ Close Date Modal
function closeModal() {
  document.getElementById("date-modal").style.display = "none";
  selectedSubjectIndex = null;
}

// ➕ Add Date to Subject
async function addClassDate() {
  const date = document.getElementById("new-class-date").value;
  if (!date) return alert("Choose a date.");

  const classID = localStorage.getItem("classID");
  const subjectID = selectedSubjectIndex; // this should be the docId from Firestore

  try {
    const subjectRef = firebase.firestore()
      .collection("classes")
      .doc(classID)
      .collection("subjects")
      .doc(subjectID);

    const doc = await subjectRef.get();
    const subj = doc.data();
    const updatedDates = Array.isArray(subj.dates) ? [...subj.dates, date] : [date];

    await subjectRef.update({ dates: updatedDates });

    document.getElementById("new-class-date").value = "";
    await openModal(subjectID);  // reopens with updated content
    renderSubjects();
  } catch (err) {
    console.error("❌ Failed to add class date:", err);
    alert("❌ Could not add date. Try again.");
  }
}

// 📅 Format date as DD-MM-YYYY
function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y}`;
}






// TIMETABLE
let editingId = null;

const isCR = localStorage.getItem("role") === "cr";


// 🔁 Get timetable data from Firestore
async function getClassData() {
  try {
    const snapshot = await classRef.collection("timetable").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("❌ Error fetching timetable:", err);
    return [];
  }
}

// 💾 Save or update a class block in Firestore
async function saveClassData(entry) {
  try {
    if (entry.id) {
      // Update existing block
      await classRef.collection("timetable").doc(entry.id).set(entry);
    } else {
      // Add new block
      await classRef.collection("timetable").add(entry);
    }
  } catch (err) {
    console.error("❌ Error saving class block:", err);
  }
}

// 🔢 Render time labels
function renderTimeLabels() {
  const labels = document.querySelector(".time-labels");
  labels.innerHTML = "";
  for (let h = 7; h <= 19; h++) {
    const row = document.createElement("div");
    row.textContent = `${h.toString().padStart(2, '0')}:00`;
    labels.appendChild(row);
  }
}

// 🎨 Render class blocks
async function renderClassBlocks() {
  const classID = localStorage.getItem("classID");
  const isCR = localStorage.getItem("role") === "cr";
  const subjects = await getSubjects(); // fetch from Firestore subjects
  const subjectMap = {};
  subjects.forEach(s => subjectMap[s.code] = s);

  const classRef = firebase.firestore().collection("classes").doc(classID).collection("timetable");
  const snapshot = await classRef.get();

  // Clear all columns
  document.querySelectorAll(".day-column").forEach(col => {
    const header = col.querySelector(".day-header");
    col.innerHTML = "";
    col.appendChild(header);
  });

  snapshot.forEach(doc => {
    const cls = doc.data();
    cls.id = doc.id;

    const col = document.querySelector(`.day-column[data-day='${cls.day}']`);
    if (!col) return;

    const start = timeToY(cls.start);
    const end = timeToY(cls.end);
    const height = end - start;

    const subjectData = subjectMap[cls.subject];
    const subjectColor = subjectData?.color || "#ccc";

    const block = document.createElement("div");
    block.className = "class-block";
    block.style.top = `${start}px`;
    block.style.height = `${height}px`;
    block.style.backgroundColor = subjectColor;
    block.textContent = `${cls.subject} (${cls.start}-${cls.end})`;

    if (isCR) {
      block.style.cursor = "pointer";
      block.addEventListener("click", () => {
        editingId = cls.id;
        document.getElementById("timetable-subject-code").value = cls.subject;
        document.getElementById("class-start").value = cls.start;
        document.getElementById("class-end").value = cls.end;
        document.getElementById("class-day").value = cls.day;

        document.getElementById("add-btn").style.display = "none";
        document.getElementById("update-btn").style.display = "inline";
        document.getElementById("delete-btn").style.display = "inline";
      });
    }

    col.appendChild(block);
  });
}
// ⏱️ Convert time to Y position
function timeToY(timeStr) {
  if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return 0;

  const [h, m] = timeStr.split(":").map(Number);
  const hour = Math.max(7, Math.min(19, h)); // Clamp between 7 and 19
  const minutesSinceStart = (hour - 7) * 60 + m;
  const pixelsPerMinute = 840 / (12 * 60); // Total 840px block
  const headerHeight = 67;
  return minutesSinceStart * pixelsPerMinute + headerHeight;
}

// ➕ Add or ✏️ Update class block
async function addClassBlock() {
  const classID = localStorage.getItem("classID");
  const subject = document.getElementById("timetable-subject-code").value;
  const start = document.getElementById("class-start").value;
  const end = document.getElementById("class-end").value;
  const day = document.getElementById("class-day").value;

  if (!subject || !start || !end || start >= end) {
    alert("Please enter a valid subject and time range.");
    return;
  }

  const classRef = firebase.firestore().collection("classes").doc(classID).collection("timetable");

  try {
    if (editingId) {
      await classRef.doc(editingId).update({ subject, start, end, day });
    } else {
      await classRef.add({ subject, start, end, day });
    }

    alert("✅ Class saved.");
    clearForm();
    renderClassBlocks();
  } catch (err) {
    console.error("❌ Error saving class:", err);
    alert("❌ Failed to save class.");
  }
}

// 🗑️ Delete class block
async function deleteClassBlock() {
  if (!editingId) return;
  const classID = localStorage.getItem("classID");

  try {
    await firebase.firestore()
      .collection("classes")
      .doc(classID)
      .collection("timetable")
      .doc(editingId)
      .delete();

    alert("✅ Class deleted.");
    editingId = null;
    clearForm();
    renderClassBlocks();
  } catch (err) {
    console.error("❌ Failed to delete class:", err);
    alert("❌ Error deleting class.");
  }
}

// 🔁 Reset the form
function clearForm() {
  const subjectSelect = document.getElementById("timetable-subject-code");
  const startInput = document.getElementById("class-start");
  const endInput = document.getElementById("class-end");
  const daySelect = document.getElementById("class-day");

  if (subjectSelect) subjectSelect.value = "";
  if (startInput) startInput.value = "";
  if (endInput) endInput.value = "";
  if (daySelect) daySelect.value = "mon";

  editingId = null;

  const addBtn = document.getElementById("add-btn");
  const updateBtn = document.getElementById("update-btn");
  const deleteBtn = document.getElementById("delete-btn");

  if (addBtn) addBtn.style.display = "inline";
  if (updateBtn) updateBtn.style.display = "none";
  if (deleteBtn) deleteBtn.style.display = "none";
}












//Deadlines in dashboard//


function toggleDeadlineForm() {
  const form = document.getElementById("Deadline-message-form");
  form.style.display = form.style.display === "none" ? "block" : "none";
}

async function saveDeadline() {
  const classID = localStorage.getItem("classID");
  const title = document.getElementById("Deadline-title").value.trim();
  const date = document.getElementById("Deadline-date").value.trim();
  const time = document.getElementById("Deadline-time").value.trim();
  const syllabus = document.getElementById("Deadline-syllabus").value.trim();

  if (!title || !date) return alert("❗ Title and Date are required.");

  try {
    await firebase.firestore()
      .collection("classes")
      .doc(classID)
      .collection("deadlines")
      .add({ title, date, time, syllabus });

    alert("✅ Deadline saved!");
    document.getElementById("Deadline-message-form").reset();
    renderDeadlines();
  } catch (err) {
    console.error("❌ Error saving deadline:", err);
    alert("❌ Could not save deadline.");
  }
}
let showAllDeadlines = false;

async function renderDeadlines() {
  const container = document.getElementById("Deadlines-container");
  container.innerHTML = "";
  const classID = localStorage.getItem("classID");
  const role = localStorage.getItem("role");

  try {
    const snapshot = await firebase.firestore()
      .collection("classes")
      .doc(classID)
      .collection("deadlines")
      .get();

    let deadlines = [];
    snapshot.forEach(doc => {
      deadlines.push({ id: doc.id, ...doc.data() });
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort: Upcoming first, Past later
    deadlines.sort((a, b) => {
      const dateA = new Date(a.date); dateA.setHours(0, 0, 0, 0);
      const dateB = new Date(b.date); dateB.setHours(0, 0, 0, 0);
      const isPastA = dateA < today;
      const isPastB = dateB < today;
      if (isPastA && !isPastB) return 1;
      if (!isPastA && isPastB) return -1;
      return dateA - dateB;
    });

    const visibleDeadlines = showAllDeadlines ? deadlines : deadlines.slice(0, 2);

    visibleDeadlines.forEach(dl => {
      const div = document.createElement("div");
      div.classList.add("Deadline-card");

      div.innerHTML = `
        <h3 class="Deadline-title">${dl.title}</h3>
        <span class="time-left">${getTimeLeftText(dl.date)}</span>
        <div class="event-info">
          <p>📅 <input type="date" value="${dl.date}" onchange="updateDeadline('${dl.id}', 'date', this.value)" ${role !== 'cr' ? 'disabled' : ''} /></p>
          <p>⏰ <input type="time" value="${dl.time || ''}" placeholder="Time" onchange="updateDeadline('${dl.id}', 'time', this.value)" ${role !== 'cr' ? 'disabled' : ''} /></p>
        </div>
        <div class="Deadline-syllabus">
          <strong>Syllabus:</strong>
          <p>${dl.syllabus || "No syllabus provided."}</p>
        </div>
        ${role === 'cr' ? `<button onclick="deleteDeadline('${dl.id}')" class="delete-btn">Delete</button>` : ''}
      `;
      container.appendChild(div);
    });

    // 🔽 Show More / 🔼 Show Less Button
    if (deadlines.length > 2) {
      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = showAllDeadlines ? "🔼 Show Less" : "🔽 Show More Deadlines";
      toggleBtn.className = "add-Deadline-btn";
      toggleBtn.onclick = () => {
        showAllDeadlines = !showAllDeadlines;
        renderDeadlines();
      };
      container.appendChild(toggleBtn);
    }

  } catch (error) {
    console.error("❌ Error loading deadlines:", error);
    container.innerHTML = `<p>❌ Failed to load deadlines.</p>`;
  }
}
async function deleteDeadline(docId) {
  const classID = localStorage.getItem("classID");
  if (!confirm("Delete this deadline?")) return;

  try {
    await firebase.firestore()
      .collection("classes")
      .doc(classID)
      .collection("deadlines")
      .doc(docId)
      .delete();

    renderDeadlines();
  } catch (err) {
    console.error("❌ Error deleting:", err);
    alert("❌ Could not delete deadline.");
  }
}

function getTimeLeftText(dateStr) {
  const today = new Date();
  const deadlineDate = new Date(dateStr);
  const diff = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "🟡 Today";
  if (diff === 1) return "🟠 1 day left";
  if (diff > 1) return `🟢 ${diff} days left`;
  return "🔴 Past";
}

function showAddDeadlineButtonIfCR() {
  const role = localStorage.getItem("role");
  const btn = document.getElementById("add-deadline-btn");
  if (role === "cr") btn.style.display = "block";
  else btn.style.display = "none";
}








//syllabus 
document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  const classID = localStorage.getItem("classID");

  if (role === "cr") {
    document.getElementById("syllabus-form").style.display = "block";
  }

  renderSyllabus();

  function extractDriveFileId(url) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)\//);
    return match ? match[1] : null;
  }

  // ✅ Save new syllabus to Firestore
  window.saveSyllabus = async function () {
    const title = document.getElementById("syllabus-title").value.trim();
    const link = document.getElementById("syllabus-link").value.trim();

    if (!title || !link) {
      alert("❗ Please enter both title and Drive link.");
      return;
    }

    const fileId = extractDriveFileId(link);
    if (!fileId) {
      alert("❌ Invalid Google Drive link format.");
      return;
    }

    try {
      await firebase.firestore()
        .collection("classes")
        .doc(classID)
        .collection("syllabus")
        .add({ title, link });

      alert("✅ Syllabus saved!");
      document.getElementById("syllabus-title").value = "";
      document.getElementById("syllabus-link").value = "";
      renderSyllabus();
    } catch (err) {
      console.error("❌ Error saving syllabus:", err);
      alert("❌ Failed to save syllabus.");
    }
  };

  // 🔄 Render syllabus from Firestore
  async function renderSyllabus() {
    const container = document.getElementById("syllabus-container");
    container.innerHTML = "";

    try {
      const snapshot = await firebase.firestore()
        .collection("classes")
        .doc(classID)
        .collection("syllabus")
        .get();

      if (snapshot.empty) {
        container.innerHTML = "<p>No syllabus uploaded yet.</p>";
        return;
      }

      snapshot.forEach(doc => {
        const item = doc.data();
        const fileId = extractDriveFileId(item.link);
        const previewURL = fileId
          ? `https://drive.google.com/file/d/${fileId}/preview`
          : null;

        const card = document.createElement("div");
        card.className = "syllabus-card";
        card.innerHTML = `
          <h4>${item.title}</h4>
          ${
            previewURL
              ? `<iframe src="${previewURL}" width="100%" height="300" allow="autoplay"></iframe>`
              : `<p>Invalid Drive link</p>`
          }
          ${
            role === "cr"
              ? `<br><button class="delete-btn" onclick="deleteSyllabus('${doc.id}')">Delete</button>`
              : ""
          }
        `;
        container.appendChild(card);
      });
    } catch (err) {
      console.error("❌ Error loading syllabus:", err);
      container.innerHTML = "<p>❌ Failed to load syllabus</p>";
    }
  }

  // ❌ Delete syllabus item
  window.deleteSyllabus = async function (docId) {
    if (!confirm("Are you sure you want to delete this syllabus?")) return;

    try {
      await firebase.firestore()
        .collection("classes")
        .doc(classID)
        .collection("syllabus")
        .doc(docId)
        .delete();

      renderSyllabus();
    } catch (err) {
      console.error("❌ Error deleting syllabus:", err);
      alert("❌ Failed to delete.");
    }
  };
});




// 📌 Load CR permission
document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  const classID = localStorage.getItem("classID");

  const form = document.getElementById("resource-form");
  const container = document.getElementById("resource-container");
  const titleInput = document.getElementById("resource-title");
  const linkInput = document.getElementById("resource-link");

  const resourceRef = firebase.firestore().collection("classes").doc(classID).collection("resources");

  // Show form for CR
  if (role === "cr" && form) {
    form.style.display = "block";
  }

  // ✅ Save new resource
  window.saveResource = async function () {
    const title = titleInput.value.trim();
    const link = linkInput.value.trim();

    if (!title || !link) {
      alert("❗ Please enter both title and link.");
      return;
    }

    try {
      await resourceRef.add({ title, link });
      alert("✅ Resource saved to Firestore!");
      titleInput.value = "";
      linkInput.value = "";
      renderResources();
    } catch (err) {
      console.error("❌ Error saving resource:", err);
      alert("❌ Failed to save resource.");
    }
  };

  // ✅ Render all resources
  async function renderResources() {
    container.innerHTML = "";

    try {
      const snapshot = await resourceRef.get();
      const resources = [];
      snapshot.forEach(doc => {
        resources.push({ id: doc.id, ...doc.data() });
      });

      resources.reverse(); // Show latest first

      resources.forEach((res) => {
        const card = document.createElement("div");
        card.className = "resource-card";
        card.innerHTML = `
          <h4>${res.title}</h4>
          <a href="${res.link}" target="_blank">🔗 View Resource</a>
          ${
            role === "cr"
              ? `<br><button class="delete-btn" data-id="${res.id}">Delete</button>`
              : ""
          }
        `;
        container.appendChild(card);
      });

      if (role === "cr") {
        container.querySelectorAll(".delete-btn").forEach(btn => {
          btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            if (confirm("Are you sure you want to delete this resource?")) {
              await resourceRef.doc(id).delete();
              renderResources();
            }
          });
        });
      }
    } catch (err) {
      console.error("❌ Error loading resources:", err);
      container.innerHTML = `<p>❌ Failed to load resources.</p>`;
    }
  }

  // Load on page start
  renderResources();
});
 




// calendar
document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  const classID = localStorage.getItem("classID");
  const form = document.getElementById("calendar-form");
  const container = document.getElementById("calendar-container");
  const titleInput = document.getElementById("calendar-title");
  const linkInput = document.getElementById("calendar-link");

  const calendarRef = firebase.firestore().collection("classes").doc(classID).collection("calendar");

  // Show form only for CR
  if (role === "cr" && form) {
    form.style.display = "block";
  }

  function extractDriveFileId(url) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)\//);
    return match ? match[1] : null;
  }

  async function saveCalendar() {
    const title = titleInput.value.trim();
    const link = linkInput.value.trim();

    if (!title || !link) {
      alert("❗ Please enter both title and Drive link.");
      return;
    }

    try {
      await calendarRef.add({ title, link });
      alert("✅ Calendar item saved to Firestore!");
      titleInput.value = "";
      linkInput.value = "";
      renderCalendar();
    } catch (err) {
      console.error("❌ Failed to save calendar:", err);
      alert("❌ Error saving calendar.");
    }
  }

  async function renderCalendar() {
  container.innerHTML = "";

  try {
    const snapshot = await calendarRef.get();
    const calendar = [];
    snapshot.forEach(doc => {
      calendar.push({ id: doc.id, ...doc.data() });
    });

    calendar.reverse(); // newest first

    calendar.forEach(item => {
      const fileId = extractDriveFileId(item.link);
      const previewURL = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;

      const card = document.createElement("div");
      card.className = "calendar-card";
      card.innerHTML = `
        <h4>${item.title}</h4>
        ${
          previewURL
            ? `<iframe src="${previewURL}" width="100%" height="300" allow="autoplay" style="border: none; border-radius: 8px;"></iframe>`
            : `<p>Invalid Drive link</p>`
        }
        ${
          role === "cr"
            ? `<br><button class="delete-btn" data-id="${item.id}">Delete</button>`
            : ""
        }
      `;
      container.appendChild(card);
    });

    if (role === "cr") {
      container.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          if (confirm("Are you sure you want to delete this calendar item?")) {
            await calendarRef.doc(id).delete();
            renderCalendar();
          }
        });
      });
    }
  } catch (err) {
    console.error("❌ Failed to load calendar:", err);
    container.innerHTML = `<p>❌ Error loading calendar items</p>`;
  }
}

  // Hook Save Button
  const saveBtn = form?.querySelector("button");
  if (saveBtn) saveBtn.addEventListener("click", saveCalendar);

  // Initial Load
  renderCalendar();
});








// logout button

function renderHeaderInfo() {
  const role = localStorage.getItem("role");
  const classID = localStorage.getItem("classID");
  const headerInfo = document.getElementById("header-user-info");

  let roleLabel = "";
  if (role === "cr") roleLabel = "CR";
  else if (role === "student") roleLabel = "Student";
  else if (role === "admin") roleLabel = "Admin";

  headerInfo.textContent = `${roleLabel} | ${classID}`;
}

function logout() {
  localStorage.clear();
  firebase.auth().signOut().then(() => {
    window.location.href = "login_reg.html";
  }).catch(err => {
    alert("Error logging out: " + err.message);
  });
}






// 🔔 Final DOM Load
document.addEventListener("DOMContentLoaded", () => {
  setupSidebarNavigation();

  if (localStorage.getItem("role") === "cr") {
    document.getElementById("add-event-btn").style.display = "inline-block";
    document.getElementById("class-controls").style.display = "block";
    document.getElementById("class-form").style.display = "block";
  }
  const addBtn = document.getElementById("add-subject-btn");
  if (addBtn) addBtn.addEventListener("click", addSubject);

  const closeModalBtn = document.getElementById("close-modal-btn");
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);

  const addDateBtn = document.getElementById("add-class-date-btn");
  if (addDateBtn) addDateBtn.addEventListener("click", addClassDate);

  renderTimeLabels();
  renderDeadlines();
  showAddDeadlineButtonIfCR();
  renderClassBlocks();
  populateSubjectDropdown();   
  renderSubjects();
  renderEvents();
  renderHeaderInfo();
});

