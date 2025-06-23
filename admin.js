// ===== Firebase Firestore Admin Logic =====




document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");

  // 🚫 Not logged in or not an admin
  if (role !== "admin") {
    // Force hard redirect, bypass back cache
    window.location.replace("login_reg.html");
  }

  // Prevent back cache from loading stale page
  window.addEventListener("pageshow", function (event) {
    if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
      // Reload page to enforce auth check
      window.location.reload();
    }
  });
});
const db = firebase.firestore();
// ✅ Handle class creation
document.getElementById("class-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const branch = document.getElementById("branch").value.trim().toUpperCase();
  const section = document.getElementById("section").value.trim().toUpperCase();
  const year = document.getElementById("year").value.trim();

  if (!branch || !section || !year) {
    alert("❗ Please fill all fields.");
    return;
  }

  const classID = `${branch}-${year}-${section}`;

  try {
    await db.collection("classes").doc(classID).set({
      classID,
      branch,
      section,
      year,
      crEmail: "",
      crPassword: "",
    });

    alert(`✅ Class ${classID} created.`);
    document.getElementById("class-form").reset();
    loadClassList();
    populateClassDropdown();
  } catch (error) {
    console.error("Error creating class:", error);
    alert("❌ Error creating class.");
  }
});

// ✅ Handle CR assignment
document.getElementById("assign-cr-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const crEmail = document.getElementById("cr-email").value.trim().toLowerCase();
  const crPassword = document.getElementById("cr-password").value.trim();
  const classID = document.getElementById("assign-class-id").value.trim().toUpperCase();

  if (!crEmail || !crPassword || !classID) {
    alert("❗ Please fill all fields.");
    return;
  }

  try {
    await db.collection("classes").doc(classID).update({
      crEmail,
      crPassword
    });

    alert(`✅ CR assigned to ${classID}`);
    document.getElementById("assign-cr-form").reset();
    loadClassList();
  } catch (error) {
    console.error("Error assigning CR:", error);
    alert("❌ Failed to assign CR.");
  }
});

// ✅ Load class list
async function loadClassList() {
  const table = document.getElementById("users-table");
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
    <tbody></tbody>
  `;

  const snapshot = await db.collection("classes").get();
  const tbody = table.querySelector("tbody");

  snapshot.forEach((doc) => {
    const data = doc.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.classID}</td>
      <td>${data.branch}</td>
      <td>${data.section}</td>
      <td>${data.year}</td>
      <td>${data.crEmail || "-"}</td>
      <td>${data.crPassword || "-"}</td>
      <td><button onclick="deleteClass('${data.classID}')" class="delete-btn">Delete</button></td>
    `;
    tbody.appendChild(row);
  });
}

// ✅ Delete class
async function deleteClass(classID) {
  if (!confirm("Are you sure you want to delete this class?")) return;

  try {
    await db.collection("classes").doc(classID).delete();
    alert("✅ Class deleted.");
    loadClassList();
    populateClassDropdown();
  } catch (error) {
    console.error("Error deleting class:", error);
    alert("❌ Failed to delete class.");
  }
}

// ✅ Populate dropdown
async function populateClassDropdown() {
  const dropdown = document.getElementById("assign-class-id");
  dropdown.innerHTML = '<option disabled selected>Select Class</option>';

  const snapshot = await db.collection("classes").get();
  snapshot.forEach((doc) => {
    const data = doc.data();
    const option = document.createElement("option");
    option.value = data.classID;
    option.textContent = data.classID;
    dropdown.appendChild(option);
  });
}

function logout() {
  // Clear only session-related data
  localStorage.removeItem("role");
  localStorage.removeItem("classID");
  localStorage.removeItem("adminEmail");
  localStorage.removeItem("adminPassword");

  // Sign out from Firebase (if using auth)
  if (firebase?.auth?.().currentUser) {
    firebase.auth().signOut().catch(err => {
      console.error("Error signing out:", err.message);
    });
  }

  // Replace current page in history to prevent back
  window.location.replace("login_reg.html");
}
// On load
window.onload = () => {
  loadClassList();
  populateClassDropdown();
};

document.addEventListener("DOMContentLoaded", () => {
  const userEmail = localStorage.getItem("email") || "Admin";
  document.getElementById("header-user-info").textContent = `Logged in as ${userEmail}`;
});