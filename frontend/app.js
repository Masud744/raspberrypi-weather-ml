// ==================== JWT AUTHENTICATION SYSTEM ====================

// Mock user database (In production, this would be on backend)
let usersDB = [
  {
    id: 1,
    name: "Shahriar Alom Masud",
    email: "masud.nil74@gmail.com",
    password: "123456" // In production: hashed password
  }
];

// JWT Token generation (simplified - in production use proper JWT library)
function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  return btoa(JSON.stringify(payload)); // Base64 encode
}

function verifyToken(token) {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) {
      return null; // Token expired
    }
    return payload;
  } catch (e) {
    return null;
  }
}

// ==================== PAGE NAVIGATION ====================

function showLogin(e) {
  if (e) e.preventDefault();
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('signupPage').style.display = 'none';
  document.getElementById('forgotPasswordPage').style.display = 'none';
  clearErrors();
}

function showSignup(e) {
  if (e) e.preventDefault();
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('signupPage').style.display = 'flex';
  document.getElementById('forgotPasswordPage').style.display = 'none';
  clearErrors();
}

function showForgotPassword(e) {
  if (e) e.preventDefault();
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('signupPage').style.display = 'none';
  document.getElementById('forgotPasswordPage').style.display = 'flex';
  clearErrors();
}

function clearErrors() {
  document.querySelectorAll('.error-message, .success-message').forEach(el => {
    el.classList.remove('show');
  });
}

// ==================== LOGIN HANDLER ====================

document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  const errorMsg = document.getElementById('loginError');
  
  // Find user in database
  const user = usersDB.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Login successful - generate JWT token
    const token = generateToken(user);
    
    // Store token based on remember me
    if (rememberMe) {
      localStorage.setItem('authToken', token);
    } else {
      sessionStorage.setItem('authToken', token);
    }
    
    errorMsg.classList.remove('show');
    showDashboard(user);
  } else {
    // Login failed
    errorMsg.classList.add('show');
  }
});

// ==================== SIGNUP HANDLER ====================

document.getElementById('signupForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  const errorMsg = document.getElementById('signupError');
  const successMsg = document.getElementById('signupSuccess');
  
  // Validation
  if (password !== confirmPassword) {
    errorMsg.textContent = "Passwords don't match!";
    errorMsg.classList.add('show');
    successMsg.classList.remove('show');
    return;
  }
  
  if (password.length < 6) {
    errorMsg.textContent = "Password must be at least 6 characters!";
    errorMsg.classList.add('show');
    successMsg.classList.remove('show');
    return;
  }
  
  // Check if email already exists
  if (usersDB.find(u => u.email === email)) {
    errorMsg.textContent = "Email already registered!";
    errorMsg.classList.add('show');
    successMsg.classList.remove('show');
    return;
  }
  
  // Create new user
  const newUser = {
    id: usersDB.length + 1,
    name: name,
    email: email,
    password: password // In production: hash this
  };
  
  usersDB.push(newUser);
  
  // Save to localStorage to persist (in production: save to backend)
  localStorage.setItem('usersDB', JSON.stringify(usersDB));
  
  // Show success message
  errorMsg.classList.remove('show');
  successMsg.classList.add('show');
  
  // Redirect to login after 2 seconds
  setTimeout(() => {
    showLogin();
  }, 2000);
});

// ==================== FORGOT PASSWORD HANDLER ====================

document.getElementById('forgotPasswordForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const email = document.getElementById('forgotEmail').value;
  const errorMsg = document.getElementById('forgotError');
  const successMsg = document.getElementById('forgotSuccess');
  
  // Check if email exists
  const user = usersDB.find(u => u.email === email);
  
  if (user) {
    // In production: send actual reset email
    console.log('Password reset link would be sent to:', email);
    
    errorMsg.classList.remove('show');
    successMsg.classList.add('show');
    
    // Redirect to login after 3 seconds
    setTimeout(() => {
      showLogin();
    }, 3000);
  } else {
    successMsg.classList.remove('show');
    errorMsg.classList.add('show');
  }
});

// ==================== LOGOUT HANDLER ====================

function logout() {
  // Clear auth tokens
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
  
  // Hide dashboard, show login
  document.getElementById('dashboardPage').classList.remove('active');
  showLogin();
  
  // Stop dashboard updates
  if (weatherInterval) clearInterval(weatherInterval);
  if (predictionInterval) clearInterval(predictionInterval);
  if (timeInterval) clearInterval(timeInterval);
  
  console.log('Logged out successfully');
}

// ==================== SHOW DASHBOARD ====================

function showDashboard(user) {
  // Hide all auth pages
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('signupPage').style.display = 'none';
  document.getElementById('forgotPasswordPage').style.display = 'none';
  
  // Show dashboard
  document.getElementById('dashboardPage').classList.add('active');
  
  // Set user name
  document.getElementById('userName').textContent = user.name.split(' ')[0];
  
  // Initialize dashboard
  initializeDashboard();
}

// ==================== CHECK AUTH ON LOAD ====================

window.addEventListener('DOMContentLoaded', () => {
  // Load users from localStorage if exists
  const savedUsers = localStorage.getItem('usersDB');
  if (savedUsers) {
    usersDB = JSON.parse(savedUsers);
  }
  
  // Check for existing auth token
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      // Valid token - auto login
      const user = usersDB.find(u => u.id === payload.id);
      if (user) {
        showDashboard(user);
        return;
      }
    } else {
      // Invalid or expired token
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
    }
  }
  
  // No valid token - show login
  showLogin();
});

// ==================== WEATHER DASHBOARD CODE ====================

const API_BASE = "https://weather-iot-ml-backend.onrender.com";
const LIVE_API_URL = API_BASE + "/api/weather/latest";
const PREDICT_API_URL = API_BASE + "/api/weather/predict";
const TIMEZONE = "Asia/Dhaka";

let tempChart = null;
let weatherInterval = null;
let predictionInterval = null;
let timeInterval = null;

// ==================== LOCAL TIME ====================

function updateLocalTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const dateString = now.toLocaleDateString('en-US', {
    timeZone: TIMEZONE,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  const timeEl = document.getElementById("time");
  const dateEl = document.getElementById("date");
  if (timeEl) timeEl.textContent = timeString;
  if (dateEl) dateEl.textContent = dateString;
}

// ==================== HELPER FUNCTIONS ====================

function updateElement(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.opacity = '0.5';
  setTimeout(() => {
    el.textContent = value;
    el.style.opacity = '1';
  }, 150);
}

function updateStatus(message, isError = false) {
  const statusEl = document.getElementById("status");
  const dotEl = document.querySelector('.status-dot');
  if (!statusEl) return;
  statusEl.textContent = message;
  if (dotEl) {
    dotEl.style.background = isError ? '#ef4444' : '#10b981';
  }
}

function formatTime(isoString) {
  try {
    return new Date(isoString).toLocaleTimeString('en-US', {
      timeZone: TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    return isoString;
  }
}

// ==================== CHART ====================

function initializeChart() {
  const ctx = document.getElementById("tempChart")?.getContext("2d");
  if (!ctx) return;

  const gradient = ctx.createLinearGradient(0, 0, 0, 360);
  gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
  gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');

  tempChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Temperature (°C)",
        data: [],
        borderColor: "#3b82f6",
        backgroundColor: gradient,
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#f1f5f9',
          bodyColor: '#e2e8f0',
          borderColor: 'rgba(71, 85, 105, 0.3)',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: (context) => `${context.parsed.y}°C`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(71, 85, 105, 0.2)', drawBorder: false },
          ticks: { color: '#94a3b8', font: { size: 11 } }
        },
        y: {
          grid: { color: 'rgba(71, 85, 105, 0.2)', drawBorder: false },
          ticks: { color: '#94a3b8', font: { size: 11 } }
        }
      }
    }
  });
}

// ==================== FETCH WEATHER ====================

async function fetchWeather() {
  try {
    const response = await fetch(LIVE_API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data) throw new Error("No data");

    updateElement("temperature", data.temperature ?? "--");
    updateElement("humidity", data.humidity ?? "--");
    updateElement("pressure", data.pressure ?? "--");
    updateElement("wind_speed", data.wind_speed ?? "--");
    updateElement("wind_direction", data.wind_direction ?? "--");
    updateStatus("Live", false);
    updateChart(data.temperature, data.time);
  } catch (error) {
    updateStatus("Error", true);
    console.error("Weather fetch error:", error);
  }
}

function updateChart(temp, time) {
  if (!tempChart) return;
  try {
    const label = formatTime(time);
    tempChart.data.labels.push(label);
    tempChart.data.datasets[0].data.push(temp);
    if (tempChart.data.labels.length > 20) {
      tempChart.data.labels.shift();
      tempChart.data.datasets[0].data.shift();
    }
    tempChart.update('none');
  } catch (error) {
    console.error("Chart error:", error);
  }
}

// ==================== FETCH PREDICTIONS ====================

async function fetchPrediction() {
  try {
    const response = await fetch(PREDICT_API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data) throw new Error("No prediction");

    const values = document.querySelectorAll(".prediction-value");
    if (values[0]) {
      values[0].style.opacity = '0.5';
      setTimeout(() => {
        values[0].textContent = data.temperature ?? "--";
        values[0].style.opacity = '1';
      }, 150);
    }
    if (values[1]) {
      values[1].style.opacity = '0.5';
      setTimeout(() => {
        values[1].textContent = data.humidity ?? "--";
        values[1].style.opacity = '1';
      }, 150);
    }
  } catch (error) {
    console.error("Prediction error:", error);
  }
}

// ==================== INITIALIZE DASHBOARD ====================

function initializeDashboard() {
  console.log("🌦 Weather Analytics Dashboard - Kaliakair");
  
  initializeChart();
  updateLocalTime();
  timeInterval = setInterval(updateLocalTime, 1000);
  fetchWeather();
  fetchPrediction();
  weatherInterval = setInterval(fetchWeather, 5000);
  predictionInterval = setInterval(fetchPrediction, 30000);
  
  console.log("✓ Dashboard initialized");
}

// ==================== SMOOTH TRANSITIONS ====================

document.addEventListener('DOMContentLoaded', () => {
  const dynamicElements = document.querySelectorAll(
    '.metric-value, .prediction-value, #time, #date'
  );
  dynamicElements.forEach(element => {
    element.style.transition = 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  });
});

console.log("🚀 Weather Analytics System with JWT Authentication Ready!");
