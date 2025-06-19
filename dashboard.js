let timerDisplay = document.getElementById('timer');
let startBtn = document.getElementById('startBtn');
let resetBtn = document.getElementById('resetBtn');


let timer;
let seconds = 0;
let isRunning = false;

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

// CR add - toggle form
function toggleMessageForm() {
  const form = document.getElementById('event-message-form');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

// Enable for CR and load events
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

function saveManualEvent() {
  const title = document.getElementById("event-title").value.trim();
  const date = document.getElementById("event-date").value.trim();
  const time = document.getElementById("event-time").value.trim();
  const location = document.getElementById("event-location").value.trim();
  const desc = document.getElementById("event-description").value.trim();

  if (!title || !date) {
    alert("Please enter at least title and date.");
    return;
  }

  const newEvent = { title, date, time, location, desc };

  const events = JSON.parse(localStorage.getItem("events") || "[]");
  events.push(newEvent);
  localStorage.setItem("events", JSON.stringify(events));
  localStorage.setItem("event-notified", "true");

  alert("✅ Event saved!");
  document.getElementById("event-message-form").reset();
  renderEvents();
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

function renderEvents() {
  const container = document.getElementById("events-container");
  container.innerHTML = "";
  const events = JSON.parse(localStorage.getItem("events") || "[]");
  const role = localStorage.getItem("role");

   const today = new Date();

  // Sort events → upcoming first, past at bottom
  events.sort((a, b) => {
    const today = new Date();
  today.setHours(0, 0, 0, 0); // set to midnight → only date

  const dateA = new Date(a.date);
  const dateB = new Date(b.date);

  dateA.setHours(0, 0, 0, 0); // compare only date
  dateB.setHours(0, 0, 0, 0); // compare only date

  const isPastA = dateA < today;
  const isPastB = dateB < today;

  if (isPastA && !isPastB) return 1;  // move A after B
  if (!isPastA && isPastB) return -1; // move A before B

  return dateA - dateB;   // normal ascending for future/present
  });


  events.forEach((event, index) => {
    const div = document.createElement("div");
    div.classList.add("event-card");

    div.innerHTML = `
      <h3 class="event-title">${event.title}</h3>
      <span class="time-left">${getTimeLeftText(event.date)}</span>
      <div class="event-info">
        <p>📅 <input type="date" value="${event.date}" onchange="updateEvent(${index}, 'date', this.value)" ${role !== 'cr' ? 'disabled' : ''} /></p>
        <p>⏰ <input type="text" value="${event.time || ''}" placeholder="Time" onchange="updateEvent(${index}, 'time', this.value)" ${role !== 'cr' ? 'disabled' : ''} /></p>
        <p>📍 <input type="text" value="${event.location || ''}" placeholder="Location" onchange="updateEvent(${index}, 'location', this.value)" ${role !== 'cr' ? 'disabled' : ''} /></p>
      </div>
      <div class="event-desc">
        <strong>Description:</strong>
        <p>${event.desc || "No description provided."}</p>
      </div>
      ${event.link ? `<a href="${event.link}" target="_blank" class="event-link">🔗 More Info</a>` : ''}
      ${role === 'cr' ? `<button onclick="deleteEvent(${index})" class="delete-btn">Delete</button>` : ''}
    `;
    container.appendChild(div);
  });
}

function updateEvent(index, field, value) {
  const events = JSON.parse(localStorage.getItem("events") || "[]");
  events[index][field] = value;
  localStorage.setItem("events", JSON.stringify(events));
  renderEvents();
}

function deleteEvent(index) {
  if (!confirm("Are you sure you want to delete this event?")) return;
  const events = JSON.parse(localStorage.getItem("events") || "[]");
  events.splice(index, 1);
  localStorage.setItem("events", JSON.stringify(events));
  renderEvents();
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
let subjects = JSON.parse(localStorage.getItem("subjects") || "[]");
let selectedSubjectIndex = null;

function renderSubjects() {
  const container = document.getElementById("subjects-container");
  container.innerHTML = "";

  subjects.forEach((subj, i) => {
    const div = document.createElement("div");
    div.className = "class-card";
    div.style.backgroundColor = subj.color || "#3498db"; // fallback color
    div.innerHTML = `
      <p class="subject">${subj.name} (${subj.code})</p>
      <p class="count">${subj.dates?.length || 0}</p>
      ${localStorage.getItem("role") === "cr" ? `<button class="delete-subject" onclick="event.stopPropagation(); deleteSubject(${i})">Delete</button>` : ""}
    `;
    div.onclick = () => openModal(i);
    container.appendChild(div);
  });

  localStorage.setItem("subjects", JSON.stringify(subjects));
}
////test case 
function populateSubjectDropdown() {
  const subjects = JSON.parse(localStorage.getItem("subjects") || "[]");
  const select = document.getElementById("timetable-subject-code");
  select.innerHTML = `<option disabled selected>Select Subject</option>`;
  
  subjects.forEach(subj => {
    const opt = document.createElement("option");
    opt.value = subj.code;
    opt.textContent = `${subj.name} (${subj.code})`;
    select.appendChild(opt);
  });
}


///end

function deleteSubject(index) {
  if (!confirm("Are you sure you want to delete this subject?")) return;
  subjects.splice(index, 1);
  localStorage.setItem("subjects", JSON.stringify(subjects));
  renderSubjects();
}

function addSubject() {
  const name = document.getElementById("new-subject-name").value.trim();
  const code = document.getElementById("new-subject-code").value.trim();
  const color = document.getElementById("new-subject-color").value;
  if (!name) return alert("Enter subject name");
  subjects.push({ name,code,color, dates: [] });
  localStorage.setItem("subjects", JSON.stringify(subjects)); 
  document.getElementById("new-subject-name").value = "";
   
  document.getElementById("new-subject-code").value = "";
  renderSubjects();
  populateSubjectDropdown();
}

function openModal(index) {
  selectedSubjectIndex = index;
  const subj = subjects[index];
  document.getElementById("modal-subject-name").textContent = subj.name;
  document.getElementById("date-list").innerHTML = subj.dates.map(d => `<li>${formatDate(d)}</li>`).join("");
  document.getElementById("date-modal").style.display = "flex";

  document.getElementById("cr-date-controls").style.display = localStorage.getItem("role") === "cr" ? "block" : "none";
}

function closeModal() {
  document.getElementById("date-modal").style.display = "none";
  selectedSubjectIndex = null;
}

function addClassDate() {
  const date = document.getElementById("new-class-date").value;
  if (!date) return alert("Choose a date.");
  subjects[selectedSubjectIndex].dates.push(date);
  document.getElementById("new-class-date").value = "";
  openModal(selectedSubjectIndex);
  renderSubjects();
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y}`;
}

// TIMETABLE
let classData = JSON.parse(localStorage.getItem("calendar-classes") || "[]");
const isCR = localStorage.getItem("role") === "cr";
let editingId = null;

// Render time labels from 7:00 to 19:00
function renderTimeLabels() {
  const labels = document.querySelector(".time-labels");
  labels.innerHTML = "";
  for (let h = 7; h <= 19; h++) {
    const row = document.createElement("div");
    row.textContent = `${h.toString().padStart(2, '0')}:00`;
    labels.appendChild(row);
  }
}

// Render all class blocks on the timetable
function renderClassBlocks() {
  const subjects = JSON.parse(localStorage.getItem("subjects") || "[]");

  document.querySelectorAll(".day-column").forEach(col => {
    const header = col.querySelector(".day-header");
    col.innerHTML = "";
    col.appendChild(header);
  });

  classData.forEach(cls => {
    const col = document.querySelector(`.day-column[data-day='${cls.day}']`);
    if (!col) return;

    const start = timeToY(cls.start);
    const end = timeToY(cls.end);
    const height = end - start;

    const subjectData = subjects.find(sub => sub.code === cls.subject);
    const subjectName = subjectData ? subjectData.name : cls.subject;
    const subjectColor = subjectData ? subjectData.color : "#ccc";

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

// Convert time string (HH:MM) to Y pixel position
function timeToY(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const minutesSinceStart = (h - 7) * 60 + m;
  const pixelsPerMinute = 840 / (12 * 60); // 12 hours
  const headerHeight = 67;
  return minutesSinceStart * pixelsPerMinute + headerHeight;
}

// Add or update a class block
function addClassBlock() {
  const subject = document.getElementById("timetable-subject-code").value;
  const start = document.getElementById("class-start").value;
  const end = document.getElementById("class-end").value;
  const day = document.getElementById("class-day").value;

  if (!subject || !start || !end || start >= end) {
    alert("Please enter a valid subject and time range.");
    return;
  }

  if (editingId) {
    const index = classData.findIndex(cls => cls.id === editingId);
    if (index !== -1) {
      classData[index] = { id: editingId, subject, start, end, day };
    }
  } else {
    classData.push({ id: Date.now().toString(), subject, start, end, day });
  }

  localStorage.setItem("calendar-classes", JSON.stringify(classData));
  renderClassBlocks();
  clearForm();
}

// Delete a class block
function deleteClassBlock() {
  if (!editingId) return;
  if (confirm("Are you sure you want to delete this class?")) {
    const index = classData.findIndex(cls => cls.id === editingId);
    if (index !== -1) {
      classData.splice(index, 1);
      localStorage.setItem("calendar-classes", JSON.stringify(classData));
      renderClassBlocks();
      clearForm();
    }
  }
}

// Reset the form and controls
function clearForm() {
  document.getElementById("timetable-subject-code").value = "";
  document.getElementById("class-start").value = "";
  document.getElementById("class-end").value = "";
  document.getElementById("class-day").value = "mon";
  editingId = null;
  document.getElementById("add-btn").style.display = "inline";
  document.getElementById("update-btn").style.display = "none";
  document.getElementById("delete-btn").style.display = "none";
}

//Deadlines in dashboard//
// Deadlines in dashboard //
function toggleDeadlineForm() {
  const form = document.getElementById('Deadline-message-form'); // fixed id
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

// Save deadline
function saveDeadline() {
  const title = document.getElementById("Deadline-title").value.trim();
  const date = document.getElementById("Deadline-date").value.trim();
  const time = document.getElementById("Deadline-time").value.trim();
  const syllabus = document.getElementById("Deadline-syllabus").value.trim();

  if (!title || !date) {
    alert("Please enter at least title and date.");
    return;
  }

  const newDeadline = { title, date, time, syllabus };

  const Deadlines = JSON.parse(localStorage.getItem("Deadlines") || "[]");
  Deadlines.push(newDeadline); // fixed here
  localStorage.setItem("Deadlines", JSON.stringify(Deadlines));
  localStorage.setItem("Deadline-notified", "true");

  alert("✅ Deadline saved!");
  document.getElementById("Deadline-message-form").reset();
  renderDeadlines();
}


// Render deadlines
function renderDeadlines() {
  const container = document.getElementById("Deadlines-container");
  container.innerHTML = "";
  const Deadlines = JSON.parse(localStorage.getItem("Deadlines") || "[]");
  const role = localStorage.getItem("role");
  const today = new Date();

  // ✅ FIX 1: Sort FIRST before loop
 Deadlines.sort((a, b) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  // ✅ Now render
  Deadlines.forEach((Deadline, index) => {
    const div = document.createElement("div");
    div.classList.add("Deadline-card");

    div.innerHTML = `
      <h3 class="Deadline-title">${Deadline.title}</h3>
      <span class="time-left">${getTimeLeftText(Deadline.date)}</span>
      <div class="event-info">
        <p>📅 <input type="date" value="${Deadline.date}" onchange="updateDeadline(${index}, 'date', this.value)" ${role !== 'cr' ? 'disabled' : ''} /></p>
        <p>⏰ <input type="time" value="${Deadline.time || ''}" placeholder="Time" onchange="updateDeadline(${index}, 'time', this.value)" ${role !== 'cr' ? 'disabled' : ''} /></p>
      </div>
      <div class="Deadline-syllabus">
        <strong>Syllabus:</strong>
        <p>${Deadline.syllabus || "No syllabus provided."}</p>
      </div>
      ${role === 'cr' ? `<button onclick="deleteDeadline(${index})" class="delete-btn">Delete</button>` : ''}
    `;
    container.appendChild(div);
  });
}

// Update deadline
function updateDeadline(index, field, value) { // fixed function name
  const Deadlines = JSON.parse(localStorage.getItem("Deadlines") || "[]");
  Deadlines[index][field] = value;
  localStorage.setItem("Deadlines", JSON.stringify(Deadlines));
  renderDeadlines();
}

// Delete deadline
function deleteDeadline(index) {
  if (!confirm("Are you sure you want to delete this deadline?")) return;
  const Deadlines = JSON.parse(localStorage.getItem("Deadlines") || "[]");
  Deadlines.splice(index, 1);
  localStorage.setItem("Deadlines", JSON.stringify(Deadlines));
  renderDeadlines();
}

// Get time left
function getTimeLeftText(dateStr) {
  if (!dateStr) return "";
  const today = new Date();
  const DeadlineDate = new Date(dateStr);
  const diff = Math.ceil((DeadlineDate - today) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "🟡 Today";
  if (diff === 1) return "🟠 1 day left";
  if (diff > 1) return `🟢 ${diff} days left`;
  return "🔴 Past event";
}
function showAddDeadlineButtonIfCR() {
  const role = localStorage.getItem("role");
  const addBtn = document.getElementById("add-deadline-btn");
  if (role === "cr") {
    addBtn.style.display = "block";
  } else {
    addBtn.style.display = "none";
  }
}
//syllabus 
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("role") === "cr") {
    document.getElementById("syllabus-form").style.display = "block";
  }
  renderSyllabus();
});

// Extract Google Drive file ID
function extractDriveFileId(url) {
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)\//);
  return match ? match[1] : null;
}

// Save Syllabus to localStorage
function saveSyllabus() {
  const title = document.getElementById("syllabus-title").value.trim();
  const link = document.getElementById("syllabus-link").value.trim();

  if (!title || !link) {
    alert("Please enter both title and Drive link.");
    return;
  }

  const syllabus = JSON.parse(localStorage.getItem("syllabus") || "[]");
  syllabus.push({ title, link });
  localStorage.setItem("syllabus", JSON.stringify(syllabus));

  document.getElementById("syllabus-title").value = "";
  document.getElementById("syllabus-link").value = "";

  renderSyllabus();
}

// Render syllabus preview cards
function renderSyllabus() {
  const container = document.getElementById("syllabus-container");
  container.innerHTML = "";

  const syllabus = JSON.parse(localStorage.getItem("syllabus") || "[]");

  syllabus.forEach((item, index) => {
    const fileId = extractDriveFileId(item.link);
    const previewURL = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;

    const card = document.createElement("div");
    card.className = "syllabus-card";
    card.innerHTML = `
      <h4>${item.title}</h4>
      ${previewURL 
        ? `<iframe src="${previewURL}" width="100%" height="300" allow="autoplay"></iframe>`
        : `<p>Invalid Drive link</p>`}
      ${localStorage.getItem("role") === "cr" 
        ? `<br><button onclick="deleteSyllabus(${index})" class="delete-btn">Delete</button>` 
        : ""}
    `;
    container.appendChild(card);
  });
}

// Delete a syllabus item
function deleteSyllabus(index) {
  if (!confirm("Are you sure you want to delete this syllabus?")) return;
  const syllabus = JSON.parse(localStorage.getItem("syllabus") || "[]");
  syllabus.splice(index, 1);
  localStorage.setItem("syllabus", JSON.stringify(syllabus));
  renderSyllabus();
}


// 📌 Load CR permission
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("role") === "cr") {
    document.getElementById("resource-form").style.display = "block";
  }
  renderResources();
});

function saveResource() {
  const title = document.getElementById("resource-title").value.trim();
  const link = document.getElementById("resource-link").value.trim();

  if (!title || !link) {
    alert("Please enter both title and Drive link.");
    return;
  }

  const resources = JSON.parse(localStorage.getItem("resources") || "[]");
  resources.push({ title, link });
  localStorage.setItem("resources", JSON.stringify(resources));

  document.getElementById("resource-title").value = "";
  document.getElementById("resource-link").value = "";

  renderResources();
}

function renderResources() {
  const container = document.getElementById("resource-container");
  container.innerHTML = "";

  const resources = JSON.parse(localStorage.getItem("resources") || "[]");

  resources.forEach((res, index) => {
    const card = document.createElement("div");
    card.className = "resource-card";
    card.innerHTML = `
      <h4>${res.title}</h4>
      <a href="${res.link}" target="_blank"> 🔗   View Resource   </a>
      ${localStorage.getItem("role") === "cr" ? `<br><button onclick="deleteResource(${index})" class="delete-btn">Delete</button>` : ''}
    `;
    container.appendChild(card);
  });
}

function deleteResource(index) {
  if (!confirm("Are you sure you want to delete this resource?")) return;
  const resources = JSON.parse(localStorage.getItem("resources") || "[]");
  resources.splice(index, 1);
  localStorage.setItem("resources", JSON.stringify(resources));
  renderResources();
}
// calendar
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("role") === "cr") {
    document.getElementById("calendar-form").style.display = "block";
  }
  renderCalendar();
});

// Extract Google Drive file ID
function extractDriveFileId(url) {
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)\//);
  return match ? match[1] : null;
}

// Save calendar to localStorage
function saveCalendar() {
  const title = document.getElementById("calendar-title").value.trim();
  const link = document.getElementById("calendar-link").value.trim();

  if (!title || !link) {
    alert("Please enter both title and Drive link.");
    return;
  }

  const calendar = JSON.parse(localStorage.getItem("calendar") || "[]");
  calendar.push({ title, link });
  localStorage.setItem("calendar", JSON.stringify(calendar));

  document.getElementById("calendar-title").value = "";
  document.getElementById("calendar-link").value = "";

  renderCalendar();
}

// Render calendar preview cards
function renderCalendar() {
  const container = document.getElementById("calendar-container");
  container.innerHTML = "";

  const calendar = JSON.parse(localStorage.getItem("calendar") || "[]");

  calendar.slice().reverse().forEach((item, index) => {
    const fileId = extractDriveFileId(item.link);
    const previewURL = fileId
      ? `https://drive.google.com/file/d/${fileId}/preview`
      : null;

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
        localStorage.getItem("role") === "cr"
          ? `<br><button onclick="deleteCalendar(${index})" class="delete-btn">Delete</button>`
          : ""
      }
    `;
    container.appendChild(card);
  });
}

// Delete a calendar item
function deleteCalendar(index) {
  if (!confirm("Are you sure you want to delete this calendar?")) return;

  const calendar = JSON.parse(localStorage.getItem("calendar") || "[]");
  calendar.splice(index, 1);
  localStorage.setItem("calendar", JSON.stringify(calendar));
  renderCalendar();
}


// logout button
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("role");
  window.location.href = "login_reg.html";
});

// 🔔 Final DOM Load
document.addEventListener("DOMContentLoaded", () => {
  setupSidebarNavigation();

  if (localStorage.getItem("role") === "cr") {
    document.getElementById("add-event-btn").style.display = "inline-block";
    document.getElementById("class-controls").style.display = "block";
    document.getElementById("class-form").style.display = "block";
  }

  renderTimeLabels();
  renderDeadlines();
  showAddDeadlineButtonIfCR();
  renderClassBlocks();
  populateSubjectDropdown();   
  renderSubjects();
  renderEvents();
});

