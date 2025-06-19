const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});


/// here starts the login code 
// script.js (connect this in your HTML if needed separately)
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("container");
  const registerBtn = document.getElementById("register");
  const loginBtn = document.getElementById("login");

  // Toggle UI between login/register
  registerBtn.addEventListener("click", () => container.classList.add("active"));
  loginBtn.addEventListener("click", () => container.classList.remove("active"));

  // ======= UTILITIES =======
  function getClassList() {
    return JSON.parse(localStorage.getItem("classList") || "[]");
  }

  function getUserList() {
    return JSON.parse(localStorage.getItem("userList") || "[]");
  }

  function saveUserList(users) {
    localStorage.setItem("userList", JSON.stringify(users));
  }

  function populateClassDropdown() {
    const classList = getClassList();
    const classSelect = document.getElementById("reg-class");

    classList.forEach(cls => {
      const option = document.createElement("option");
      option.value = cls.classID;
      option.textContent = cls.classID;
      classSelect.appendChild(option);
    });
  }

  populateClassDropdown();

  // ======= SIGN UP HANDLER =======
  document.querySelector(".sign-up form").addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("reg-email").value.trim().toLowerCase();
    const password = document.getElementById("reg-password").value;
    const confirmPassword = document.getElementById("reg-confirm-password").value;
    const selectedClass = document.getElementById("reg-class").value;

    if (password !== confirmPassword) {
      alert("❗ Passwords do not match");
      return;
    }

    const users = getUserList();
    const alreadyExists = users.some(u => u.email === email);

    if (alreadyExists) {
      alert("⚠️ Email already registered");
      return;
    }

    users.push({
      email,
      password,
      role: "student",
      classID: selectedClass
    });

    saveUserList(users);
    alert("✅ Registered successfully! You can now log in.");
    container.classList.remove("active");
  });

  // ======= LOGIN HANDLER =======
});


registerBtn.addEventListener('click', () => {
  container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
  container.classList.remove("active");
});

const CLASS_KEY = "classList";

// ================= LOGIN =================
document.querySelector(".sign-in form").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value.trim().toLowerCase();
  const password = document.getElementById("login-password").value.trim();
  const role = document.getElementById("user-role").value;
 localStorage.setItem("role",role);
  if (!email || !password || !role) {
    alert("❗ Please fill all fields.");
    return;
  }

  if (role === "admin") {
    if (email === "admin@chronoclass.in" && password === "admin123") {
      alert("✅ Logged in as Admin");
      window.location.href = "admin.html";
    } else {
      alert("❌ Invalid Admin Credentials");
    }
    return;
  }

  // For CR and Student
  const classList = JSON.parse(localStorage.getItem(CLASS_KEY) || "[]");
  const targetClass = classList.find(cls => cls.classID === "EEE-24-28-A");

  if (!targetClass) {
    alert("❌ Class not found");
    return;
  }

  if (role === "cr") {
    if (email === targetClass.crEmail && password === targetClass.crPassword) {
      alert("✅ Logged in as CR");
     
      window.location.href = "dashboard.html";  // CR Dashboard
    } else {
      alert("❌ Invalid CR credentials");
    }
  } else if (role === "student" ) {
    if(email === targetClass.crEmail ){
        alert(" ❌ set your role to cr ");
    }
    else{
    alert("✅ Logged in as Student");
    window.location.href = "dashboard.html";  // Student Dashboard
    }
  }
});