// ===== LocalStorage Admin Logic =====

const CLASS_KEY = "classList";

function getClassList() {
  return JSON.parse(localStorage.getItem(CLASS_KEY) || "[]");
}

function saveClassList(classes) {
  localStorage.setItem(CLASS_KEY, JSON.stringify(classes));
}

// ✅ Handle class creation
document.getElementById("class-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const branch = document.getElementById("branch").value.trim().toUpperCase();
  const section = document.getElementById("section").value.trim().toUpperCase();
  const year = document.getElementById("year").value.trim();

  if (!branch || !section || !year) {
    alert("❗ Please fill all fields.");
    return;
  }

  const classID = `${branch}-${year}-${section}`;
  const classList = getClassList();

  const alreadyExists = classList.some(cls => cls.classID === classID);
  if (alreadyExists) {
    alert(`⚠️ Class ${classID} already exists.`);
    return;
  }

  classList.push({
    classID,
    branch,
    section,
    year,
    crEmail: "",
    crPassword: ""
  });

  saveClassList(classList);
  alert(`✅ Class ${classID} created.`);
  document.getElementById("class-form").reset();
  loadClassList();
  populateClassDropdown();
});

// ✅ Handle CR assignment
document.getElementById("assign-cr-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const crEmail = document.getElementById("cr-email").value.trim().toLowerCase();
  const crPassword = document.getElementById("cr-password").value.trim();
  const classID = document.getElementById("assign-class-id").value.trim().toUpperCase();

  if (!crEmail || !crPassword || !classID) {
    alert("❗ Please fill all fields.");
    return;
  }

  const classList = getClassList();
  const index = classList.findIndex(cls => cls.classID === classID);

  if (index === -1) {
    alert("❌ Class not found.");
    return;
  }

  classList[index].crEmail = crEmail;
  classList[index].crPassword = crPassword;
  saveClassList(classList);

  alert(`✅ CR assigned to ${classID}`);
  document.getElementById("assign-cr-form").reset();
  loadClassList();
});

function loadClassList() {
  const table = document.getElementById("users-table");
  const classList = getClassList();

  table.innerHTML = `
    <thead>
      <tr>
        <th>Class ID</th>
        <th>Branch</th>
        <th>Section</th>
        <th>Year</th>
        <th>Assigned CR</th>
        <th>CR Password</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${classList.map((cls, index) => `
        <tr>
          <td>${cls.classID}</td>
          <td>${cls.branch}</td>
          <td>${cls.section}</td>
          <td>${cls.year}</td>
          <td>${cls.crEmail || "-"}</td>
          <td>${cls.crPassword || "-"}</td>
          <td>
            <button onclick="deleteClass(${index})" class="delete-btn">Delete</button>
          </td>
        </tr>
      `).join("")}
    </tbody>
  `;
}
function deleteClass(index) {
  if (!confirm("Are you sure you want to delete this class?")) return;

  const classList = getClassList();
  classList.splice(index, 1);
  saveClassList(classList);

  alert("✅ Class deleted.");
  loadClassList();
  populateClassDropdown();
}

function populateClassDropdown() {
  const dropdown = document.getElementById("assign-class-id");
  const classList = getClassList();

  dropdown.innerHTML = '<option disabled selected>Select Class</option>';
  classList.forEach(cls => {
    const option = document.createElement("option");
    option.value = cls.classID;
    option.textContent = cls.classID;
    dropdown.appendChild(option);
  });
}

// logout button
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("role");
  window.location.href = "login_reg.html";
});

window.onload = () => {
  loadClassList();
  populateClassDropdown();
};