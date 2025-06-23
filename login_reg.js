
if (localStorage.getItem("role") && localStorage.getItem("classID")) {
  // Already logged in
  window.location.href = "dashboard.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("container");
  const registerBtn = document.getElementById("register");
  const loginBtn = document.getElementById("login");

  const auth = firebase.auth();
  const db = firebase.firestore();

  // Toggle login/register panel
  registerBtn.addEventListener("click", () => container.classList.add("active"));
  loginBtn.addEventListener("click", () => container.classList.remove("active"));

  // 🔽 Populate Class Dropdown from Firestore
  async function populateClassDropdown() {
    const classSelect = document.getElementById("reg-class");
    classSelect.innerHTML = "";

    const snapshot = await db.collection("classes").get();

    if (snapshot.empty) {
      const opt = document.createElement("option");
      opt.textContent = "❌ No classes available. Contact Admin.";
      opt.disabled = true;
      opt.selected = true;
      classSelect.appendChild(opt);
      document.querySelector(".sign-up form button").disabled = true;
      return;
    }

    const defaultOpt = document.createElement("option");
    defaultOpt.textContent = "Select a Class";
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    classSelect.appendChild(defaultOpt);

    snapshot.forEach(doc => {
      const option = document.createElement("option");
      option.value = doc.id;
      option.textContent = doc.id;
      classSelect.appendChild(option);
    });

    document.querySelector(".sign-up form button").disabled = false;
  }

  populateClassDropdown();

  // ✅ Register Student
  document.querySelector(".sign-up form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("reg-email").value.trim().toLowerCase();
    const password = document.getElementById("reg-password").value;
    const confirm = document.getElementById("reg-confirm-password").value;
    const selectedClass = document.getElementById("reg-class").value;

    if (!selectedClass || selectedClass === "Select a Class") {
      alert("❗ Please select a valid class.");
      return;
    }

    if (password !== confirm) {
      alert("❗ Passwords do not match");
      return;
    }

    try {
      // 🔍 Check if email already exists
      const existing = await db.collection("users").where("email", "==", email).get();
      if (!existing.empty) {
        alert("⚠️ Email already registered.");
        return;
      }

      const { user } = await auth.createUserWithEmailAndPassword(email, password);

      // Store student data
      await db.collection("users").doc(user.uid).set({
        email,
        role: "student",
        classID: selectedClass
      });

      // Add student to class document array
      await db.collection("classes").doc(selectedClass).update({
        students: firebase.firestore.FieldValue.arrayUnion(email)
      });

      alert("✅ Registered successfully!");
      container.classList.remove("active");

    } catch (err) {
      alert("❌ " + err.message);
    }
  });

  // ✅ Login Logic (All roles)
  document.querySelector(".sign-in form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value.trim();
    const role = document.getElementById("user-role").value;

    if (!email || !password || !role) {
      alert("❗ Please fill all fields.");
      return;
    }

    // 🔐 Admin
    if (role === "admin") {
      if (email === "admin@chronoclass.in" && password === "admin123") {
        localStorage.setItem("role", "admin");
        alert("✅ Logged in as Admin");
        window.location.replace("admin.html");
      } else {
        alert("❌ Invalid Admin credentials");
      }
      return;
    }

    // 🧑‍🏫 CR
    if (role === "cr") {
      try {
        const snapshot = await db.collection("classes").get();
        let matchedClassID = null;

        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.crEmail === email && data.crPassword === password) {
            matchedClassID = doc.id;
          }
        });

        if (matchedClassID) {
          localStorage.setItem("role", "cr");
          localStorage.setItem("classID", matchedClassID);
          alert("✅ Logged in as CR");
          window.location.href = "dashboard.html";
        } else {
          alert("❌ Invalid CR credentials");
        }
      } catch (err) {
        console.error("CR login error:", err);
        alert("❌ Failed to log in as CR");
      }
      return;
    }

    // 👨‍🎓 Student
    if (role === "student") {
      try {
        const userCred = await auth.signInWithEmailAndPassword(email, password);
        const uid = userCred.user.uid;

        const userDoc = await db.collection("users").doc(uid).get();
        if (!userDoc.exists) {
          alert("❌ Student record not found.");
          return;
        }

        const data = userDoc.data();
        if (data.role !== "student") {
          alert("❌ This is not a student account.");
          return;
        }

        localStorage.setItem("role", "student");
        localStorage.setItem("classID", data.classID);
        alert("✅ Logged in as Student");
        window.location.href = "dashboard.html";

      } catch (err) {
        console.error("Student login error:", err);
        alert("❌ " + err.message);
      }
    }
  });
});