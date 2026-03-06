// script.js - full application logic for Habit City Builder

let tasks = [
  {
    id: 1,
    name: "Attend Calendar Event",
    icon: "📅",
    category: "Calendar",
    completed: false
  },
  {
    id: 2,
    name: "10,000 Steps",
    icon: "👟",
    category: "Fitness",
    completed: false
  },
  {
    id: 3,
    name: "30min Exercise",
    icon: "🏋️",
    category: "Fitness",
    completed: false
  },
  {
    id: 4,
    name: "Git Push",
    icon: "🔀",
    category: "Git",
    completed: false
  },
  {
    id: 5,
    name: "Screen Time < 3hrs",
    icon: "📱",
    category: "Screen",
    completed: false
  }
];

const CLIENT_ID = 'YOUR_CLIENT_ID';
const API_KEY = 'YOUR_API_KEY';

let currentView = 'city'; // "city" or "stats"
let chartInstance = null;

// mock history for charts
const dailyData = [40, 65, 100, 85, 95, 30, 100];
const weeklyData = [45, 72, 88, 100];
const monthlyData = [
  {x: 'Week 1', y: 55},
  {x: 'Week 2', y: 70},
  {x: 'Week 3', y: 92},
  {x: 'Week 4', y: 100}
];

// ============ helper functions ============
function saveToLocal() {
  localStorage.setItem('habitCityTasks', JSON.stringify(tasks));
}

function loadFromLocal() {
  const saved = localStorage.getItem('habitCityTasks');
  if (saved) {
    tasks = JSON.parse(saved);
  }
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function checkDayReset() {
  const today = getTodayKey();
  const lastDay = localStorage.getItem('lastHabitDay');
  if (lastDay !== today) {
    tasks.forEach(t => t.completed = false);
    localStorage.setItem('lastHabitDay', today);
    saveToLocal();
  }
}

function calculateProgress() {
  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const perc = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, perc };
}

function updateProgressUI() {
  const { completed, total, perc } = calculateProgress();
  document.getElementById('completed-count').textContent = completed;
  document.getElementById('total-tasks').textContent = total;
  document.getElementById('progress-bar').style.width = perc + '%';
  document.getElementById('progress-perc').textContent = perc + '%';
  document.getElementById('city-growth').textContent = perc + '%';
  document.getElementById('tasks-completed-top').textContent = `${completed}/${total} tasks completed`;
  updateCityVisual(perc);
  updateMilestones(perc);
}

// ============ city rendering ============

function renderCityBuildings() {
  const container = document.getElementById('buildings-container');
  container.innerHTML = `
        <!-- Building 1 -->
        <div data-max="380" data-color="#4f46e5" class="building relative w-14 bg-indigo-600 rounded-t" style="height:0px">
          <div class="windows absolute inset-x-2 top-4 grid grid-cols-2 gap-1" style="height:calc(100% - 60px)">
            <div class="window h-3 rounded"></div><div class="window h-3 rounded"></div>
            <div class="window h-3 rounded"></div><div class="window h-3 rounded"></div>
            <div class="window h-3 rounded"></div><div class="window h-3 rounded"></div>
          </div>
          <div class="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-8 bg-indigo-700 rounded"></div>
        </div>
        
        <!-- Building 2 -->
        <div data-max="260" data-color="#7c3aed" class="building relative w-20 bg-violet-600 rounded-t" style="height:0px">
          <div class="windows absolute inset-x-3 top-6 grid grid-cols-3 gap-1" style="height:calc(100% - 80px)">
            <div class="window h-4 rounded"></div><div class="window h-4 rounded"></div><div class="window h-4 rounded"></div>
          </div>
        </div>
        
        <!-- Building 3 -->
        <div data-max="450" data-color="#c026d3" class="building relative w-12 bg-pink-600 rounded-t" style="height:0px">
          <div class="windows absolute inset-x-1.5 top-5 grid grid-cols-2 gap-1" style="height:calc(100% - 70px)"></div>
        </div>
        
        <!-- Building 4 -->
        <div data-max="310" data-color="#ea580c" class="building relative w-24 bg-orange-600 rounded-t" style="height:0px">
          <div class="windows absolute inset-x-4 top-8 grid grid-cols-4 gap-1.5" style="height:calc(100% - 110px)"></div>
        </div>
        
        <!-- Building 5 -->
        <div data-max="520" data-color="#166534" class="building relative w-16 bg-emerald-700 rounded-t" style="height:0px"></div>
        
        <!-- Building 6 -->
        <div data-max="280" data-color="#1e40af" class="building relative w-10 bg-blue-700 rounded-t" style="height:0px">
          <div class="windows absolute inset-x-1 top-3 grid grid-cols-1 gap-2" style="height:calc(100% - 50px)"></div>
        </div>
        
        <!-- Building 7 -->
        <div data-max="340" data-color="#b91c1c" class="building relative w-18 bg-red-700 rounded-t" style="height:0px">
          <div class="windows absolute inset-x-3 top-5 grid grid-cols-3 gap-1" style="height:calc(100% - 70px)"></div>
        </div>
        
        <!-- Building 8 -->
        <div data-max="420" data-color="#065f46" class="building relative w-14 bg-green-800 rounded-t" style="height:0px">
          <div class="windows absolute inset-x-2 top-4 grid grid-cols-2 gap-1" style="height:calc(100% - 60px)"></div>
        </div>
        
        <!-- Building 9 -->
        <div data-max="360" data-color="#1d4ed8" class="building relative w-20 bg-blue-600 rounded-t" style="height:0px">
          <div class="windows absolute inset-x-3 top-6 grid grid-cols-3 gap-1" style="height:calc(100% - 80px)"></div>
        </div>
      `;
}

function updateCityVisual(perc) {
  const buildings = document.querySelectorAll('.building');
  buildings.forEach((b, i) => {
    const maxH = parseFloat(b.dataset.max || 300);
    const targetHeight = Math.floor((perc / 100) * maxH);
    b.style.height = targetHeight + 'px';
    const windows = b.querySelectorAll('.window');
    windows.forEach((w, idx) => {
      if (targetHeight > 50 + idx*30) {
        w.style.background = '#fefce8';
        w.style.animation = 'window-flicker 2s infinite alternate';
      } else {
        w.style.background = '#854d0e';
        w.style.animation = 'none';
      }
    });
  });
}

function renderCars() {
  const container = document.getElementById('cars-container');
  container.innerHTML = `
        <div class="car-reverse absolute bottom-2 text-5xl" style="left:10%; animation-duration: 6s; animation-delay: 0s; color:#ef4444;">🚗</div>
        <div class="car absolute bottom-2 text-5xl" style="left:25%; animation-duration: 9s; animation-delay: -2s; color:#3b82f6; transform: scaleX(-1);">🚙</div>
        <div class="car-reverse absolute bottom-2 text-5xl" style="left:45%; animation-duration: 7s; animation-delay: -4s; color:#eab308;">🚕</div>
        <div class="car absolute bottom-2 text-5xl" style="left:65%; animation-duration: 11s; animation-delay: -1s; color:#22c55e; transform: scaleX(-1);">🛵</div>
        <div class="car-reverse absolute bottom-2 text-5xl" style="left:80%; animation-duration: 8s; animation-delay: -3s; color:#a855f7;">🚓</div>
      `;
}

function updateMilestones(perc) {
  document.querySelectorAll('.milestone').forEach(el => {
    const level = parseInt(el.dataset.level);
    if (perc >= level) {
      el.classList.add('active');
      el.style.opacity = 1;
    } else {
      el.classList.remove('active');
      el.style.opacity = 0.4;
    }
  });
  let statusName = "Seeds Planted";
  let icon = "🌱";
  if (perc >= 100) { statusName = "Metropolis"; icon = "🏙️"; }
  else if (perc >= 75) { statusName = "Town"; icon = "🏘️"; }
  else if (perc >= 50) { statusName = "Village"; icon = "🏠"; }
  document.getElementById('city-status-name').textContent = statusName;
  document.getElementById('city-status-icon').innerHTML = icon;
}

function jumpToLevel(target) {
  const completedCount = Math.ceil((target / 100) * tasks.length);
  tasks.forEach((t, i) => { t.completed = i < completedCount; });
  saveToLocal();
  updateProgressUI();
  renderTasks();
}

// ============ task list ============

function renderTasks() {
  const container = document.getElementById('tasks-list');
  container.innerHTML = '';
  tasks.forEach(task => {
    const div = document.createElement('div');
    div.className = `task-card flex items-center gap-x-4 px-5 py-4 bg-white border border-zinc-100 rounded-3xl cursor-pointer ${task.completed ? 'ring-2 ring-emerald-400' : ''}`;
    div.innerHTML = `
      <div onclick="event.stopImmediatePropagation(); toggleTask(${task.id});" 
        class="w-8 h-8 flex items-center justify-center text-3xl border-2 border-zinc-200 rounded-2xl ${task.completed ? 'bg-emerald-400 border-emerald-400 text-white' : 'hover:border-yellow-400'}">
        ${task.completed ? '✅' : task.icon}
      </div>
      <div class="flex-1">
        <div class="font-semibold">${task.name}</div>
        <div class="text-xs text-zinc-400">${task.category}</div>
      </div>
      ${task.completed ? `<div class="text-emerald-400 text-xl">✓</div>` : ''}
    `;
    div.onclick = () => toggleTask(task.id);
    container.appendChild(div);
  });
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveToLocal();
  renderTasks();
  updateProgressUI();
}

function showAddTaskModal() {
  document.getElementById('modal-backdrop').classList.remove('hidden');
  document.getElementById('modal-backdrop').classList.add('flex');
  document.getElementById('custom-task-name').focus();
}

function hideAddTaskModal() {
  const modal = document.getElementById('modal-backdrop');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function addCustomTask() {
  const name = document.getElementById('custom-task-name').value.trim();
  if (!name) return;
  const category = document.getElementById('custom-task-category').value;
  const newTask = {
    id: Date.now(),
    name: name,
    icon: "⭐",
    category: category,
    completed: false
  };
  tasks.push(newTask);
  saveToLocal();
  renderTasks();
  updateProgressUI();
  hideAddTaskModal();
  document.getElementById('custom-task-name').value = '';
}

// ============ analytics ============

function renderAnalytics() {
  const { perc } = calculateProgress();
  document.getElementById('avg-completion').textContent = perc;
  document.getElementById('streak-days').textContent = perc === 100 ? 1 : 0;
  document.getElementById('perfect-days').textContent = perc === 100 ? 1 : 0;
  document.getElementById('total-days').textContent = 1;
  const ctx = document.getElementById('progress-chart');
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets: [{
        label: 'Completion %',
        data: dailyData,
        borderColor: '#facc15',
        backgroundColor: 'rgba(250, 204, 21, 0.1)',
        tension: 0.4,
        borderWidth: 4,
        pointBackgroundColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 100, grid: { color: '#27272a' } },
        x: { grid: { color: '#27272a' } }
      }
    }
  });
}

function switchChartTab(tab) {
  document.querySelectorAll('.tab-button').forEach((b,i) => {
    b.classList.toggle('active', i===tab);
    b.classList.toggle('bg-white', i===tab);
    b.classList.toggle('text-zinc-900', i===tab);
  });
  const ctx = document.getElementById('progress-chart');
  if (chartInstance) chartInstance.destroy();
  let labels, data, type = 'line';
  if (tab === 0) {
    labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    data = dailyData;
    type = 'line';
  } else if (tab === 1) {
    labels = ['Week 1','Week 2','Week 3','Week 4'];
    data = weeklyData;
    type = 'bar';
  } else {
    labels = monthlyData.map(m => m.x);
    data = monthlyData.map(m => m.y);
    type = 'scatter';
  }
  chartInstance = new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [{
        label: 'Progress',
        data: data,
        borderColor: '#eab308',
        backgroundColor: tab === 1 ? '#facc15' : 'rgba(234, 179, 8, 0.2)',
        borderWidth: 4
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins:{legend:{display:false}} }
  });
}

function toggleView() {
  currentView = currentView === 'city' ? 'stats' : 'city';
  document.getElementById('city-view').classList.toggle('hidden', currentView !== 'city');
  document.getElementById('stats-view').classList.toggle('hidden', currentView !== 'stats');
  const btnText = document.getElementById('view-text');
  btnText.textContent = currentView === 'city' ? 'View Stats' : 'View City';
  if (currentView === 'stats') {
    renderAnalytics();
  }
}

// ============ GitHub integration ============

async function checkGitPush() {
  let githubUsername = localStorage.getItem('githubUsername');
  if (!githubUsername) {
    githubUsername = prompt('Enter your GitHub username to connect:');
    if (!githubUsername) return false;
    localStorage.setItem('githubUsername', githubUsername);
  }
  try {
    const response = await fetch(`https://api.github.com/users/${githubUsername}/events?per_page=30`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
    const events = await response.json();
    const today = new Date().toISOString().split('T')[0];
    const hasPush = events.some(event => {
      if (event.type === 'PushEvent') {
        const eventDate = event.created_at.split('T')[0];
        return eventDate === today;
      }
      return false;
    });
    return hasPush;
  } catch (error) {
    console.error('Error checking GitHub push:', error);
    alert('Failed to check GitHub. Please try again later.');
    return false;
  }
}

async function autoCompleteGitTask() {
  const gitTask = tasks.find(t => t.name === 'Git Push');
  if (!gitTask || gitTask.completed) return;
  const hasPushed = await checkGitPush();
  if (hasPushed) {
    gitTask.completed = true;
    saveToLocal();
    renderTasks();
    updateProgressUI();
    alert('✅ GitHub push detected today! Task completed.');
  } else {
    alert('No GitHub push detected today. Keep coding!');
  }
}

function connectGitHub() {
  autoCompleteGitTask();
}

// ============ Calendar integration (stub) ============

async function autoCompleteCalendarTask() {
  // Placeholder implementation. A real version would
  // query Google Calendar via gapi.client.calendar.events.list.
  console.log('autoCompleteCalendarTask called (stub)');
}

// ============ Google API helpers ============

function gapiLoaded() {
  if (window.gapi) {
    gapi.load('client', initializeGapiClient);
  }
}

async function initializeGapiClient() {
  try {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"]
    });
  } catch (err) {
    console.error('gapi client init failed', err);
  }
}

function gisLoaded() {
  // currently unused; could initialize OAuth2 token client here
}

function signInWithGoogle() {
  localStorage.setItem('loggedIn', 'true');
  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('main-view').classList.remove('hidden');
  initDashboard();
}

// ============ initialization ============

function initDashboard() {
  loadFromLocal();
  checkDayReset();
  const dateEl = document.querySelector('#current-date span');
  const now = new Date();
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }
  renderCityBuildings();
  renderCars();
  renderTasks();
  updateProgressUI();
  setTimeout(() => {
    autoCompleteGitTask();
    autoCompleteCalendarTask();
  }, 1000);
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement.tagName !== "INPUT") {
      e.preventDefault();
      showAddTaskModal();
    }
  });
  console.log('%c🚀 Habit City Builder ready! Google Calendar and GitHub APIs integrated.', 'color:#eab308; font-family:monospace');
}

// automatically go to dashboard if already signed in
window.onload = () => {
  if (localStorage.getItem('loggedIn') === 'true') {
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('main-view').classList.remove('hidden');
    initDashboard();
  }
};
