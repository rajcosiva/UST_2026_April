// Enhanced Admin Dashboard JavaScript
const doctorForm = document.getElementById("doctorForm");
const logoutBtn = document.getElementById("logoutBtn");
let editingDoctorId = null;
let charts = {};

// Global variables for data
let appointmentsData = [];
let doctorsData = [];
let patientsData = [];

// Initialize admin dashboard
window.addEventListener("DOMContentLoaded", () => {
  initializeAdminDashboard();
  generateTimeSlots();
  setupNavigationEvents();
  setupFormEvents();
});

// Initialize dashboard data
async function initializeAdminDashboard() {
  try {
    await loadAllData();
    updateDashboardStats();
    initializeCharts();
    updateAllTables();
  } catch (error) {
    console.error('Error initializing admin dashboard:', error);
  }
}

// Load all data from API
async function loadAllData() {
  try {
    const [appointments, doctors, patients] = await Promise.all([
      fetch('/api/appointments').then(res => res.json()),
      fetch('/api/doctors').then(res => res.json()),
      fetchPatients()
    ]);
    
    appointmentsData = appointments;
    doctorsData = doctors;
    patientsData = patients;
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Fetch patients data (mock for now since we need to implement this endpoint)
async function fetchPatients() {
  try {
    const response = await fetch('/api/patients/all');
    if (response.ok) {
      return await response.json();
    }
    return []; // Return empty array if endpoint doesn't exist yet
  } catch (error) {
    console.warn('Patients endpoint not available yet');
    return [];
  }
}

// Setup navigation events
function setupNavigationEvents() {
  const navLinks = document.querySelectorAll('#admin-nav .nav-link');
  const sections = document.querySelectorAll('.content-section');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all links and sections
      navLinks.forEach(l => l.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      
      // Add active class to clicked link
      link.classList.add('active');
      
      // Show corresponding section
      const sectionId = link.getAttribute('data-section');
      const targetSection = document.getElementById(`${sectionId}-section`);
      if (targetSection) {
        targetSection.classList.add('active');
      }
      
      // Load section-specific data
      loadSectionData(sectionId);
    });
  });
}

// Load section-specific data
async function loadSectionData(sectionId) {
  switch (sectionId) {
    case 'dashboard':
      await loadAllData();
      updateDashboardStats();
      updateRecentAppointmentsTable();
      break;
    case 'appointments':
      updateAppointmentsTable();
      break;
    case 'doctors':
      updateDoctorsTable();
      break;
    case 'patients':
      updatePatientsTable();
      break;
    case 'analytics':
      initializeAnalyticsCharts();
      break;
  }
}

// Setup form events
function setupFormEvents() {
  // Logout button
  if (logoutBtn) {
    logoutBtn.onclick = async function () {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = "/index.html";
    };
  }
  
  // Doctor form submit
  if (doctorForm) {
    doctorForm.onsubmit = handleDoctorFormSubmit;
  }
  
  // Appointment filters
  const dateFilter = document.getElementById('appointmentDateFilter');
  const statusFilter = document.getElementById('appointmentStatusFilter');
  
  if (dateFilter) {
    dateFilter.addEventListener('change', updateAppointmentsTable);
  }
  
  if (statusFilter) {
    statusFilter.addEventListener('change', updateAppointmentsTable);
  }
}

// Update dashboard statistics
function updateDashboardStats() {
  const totalAppointments = appointmentsData.length;
  const totalDoctors = doctorsData.length;
  const totalPatients = patientsData.length;
  const pendingToday = appointmentsData.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.date === today && apt.status === 'scheduled';
  }).length;
  
  document.getElementById('totalAppointmentsAdmin').textContent = totalAppointments;
  document.getElementById('totalDoctors').textContent = totalDoctors;
  document.getElementById('totalPatients').textContent = totalPatients;
  document.getElementById('pendingAppointments').textContent = pendingToday;
}

// Initialize charts
function initializeCharts() {
  initializeAppointmentsChart();
  initializeDepartmentChart();
}

// Initialize appointments overview chart
function initializeAppointmentsChart() {
  const ctx = document.getElementById('appointmentsChart');
  if (!ctx) return;
  
  // Prepare data for last 7 days
  const last7Days = [];
  const appointmentCounts = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    last7Days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    
    const count = appointmentsData.filter(apt => apt.date === dateStr).length;
    appointmentCounts.push(count);
  }
  
  charts.appointmentsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: last7Days,
      datasets: [{
        label: 'Appointments',
        data: appointmentCounts,
        borderColor: '#4facfe',
        backgroundColor: 'rgba(79, 172, 254, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

// Initialize department distribution chart
function initializeDepartmentChart() {
  const ctx = document.getElementById('departmentChart');
  if (!ctx) return;
  
  // Count appointments by department
  const departmentCounts = {};
  appointmentsData.forEach(apt => {
    departmentCounts[apt.department] = (departmentCounts[apt.department] || 0) + 1;
  });
  
  const departments = Object.keys(departmentCounts);
  const counts = Object.values(departmentCounts);
  
  charts.departmentChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: departments,
      datasets: [{
        data: counts,
        backgroundColor: [
          '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
          '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Initialize analytics charts
function initializeAnalyticsCharts() {
  initializeMonthlyTrendChart();
  initializeTimeSlotsChart();
  initializeAgeDistributionChart();
  initializeRevenueChart();
}

// Initialize monthly trend chart
function initializeMonthlyTrendChart() {
  const ctx = document.getElementById('monthlyTrendChart');
  if (!ctx) return;
  
  // Mock data for monthly trend
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Appointments',
      data: [65, 75, 80, 68, 85, 90],
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };
  
  new Chart(ctx, {
    type: 'line',
    data: monthlyData,
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Initialize time slots chart
function initializeTimeSlotsChart() {
  const ctx = document.getElementById('timeSlotsChart');
  if (!ctx) return;
  
  // Mock data for popular time slots
  const timeSlotsData = {
    labels: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'],
    datasets: [{
      label: 'Bookings',
      data: [15, 25, 20, 18, 22, 12],
      backgroundColor: '#43e97b',
      borderRadius: 5
    }]
  };
  
  new Chart(ctx, {
    type: 'bar',
    data: timeSlotsData,
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Initialize age distribution chart
function initializeAgeDistributionChart() {
  const ctx = document.getElementById('ageDistributionChart');
  if (!ctx) return;
  
  // Mock data for age distribution
  const ageData = {
    labels: ['0-18', '19-35', '36-50', '51-65', '65+'],
    datasets: [{
      data: [15, 35, 25, 20, 5],
      backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
    }]
  };
  
  new Chart(ctx, {
    type: 'pie',
    data: ageData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Initialize revenue chart
function initializeRevenueChart() {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;
  
  // Calculate revenue by department
  const departmentRevenue = {};
  appointmentsData.forEach(apt => {
    const doctor = doctorsData.find(doc => doc.name === apt.doctorName);
    const fee = doctor ? parseInt(doctor.fee) : 500; // Default fee
    departmentRevenue[apt.department] = (departmentRevenue[apt.department] || 0) + fee;
  });
  
  const departments = Object.keys(departmentRevenue);
  const revenues = Object.values(departmentRevenue);
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: departments,
      datasets: [{
        label: 'Revenue (₹)',
        data: revenues,
        backgroundColor: '#667eea',
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₹' + value;
            }
          }
        }
      }
    }
  });
}

// Update all tables
function updateAllTables() {
  updateRecentAppointmentsTable();
  updateAppointmentsTable();
  updateDoctorsTable();
  updatePatientsTable();
}

// Update recent appointments table
function updateRecentAppointmentsTable() {
  const tbody = document.getElementById('recentAppointmentsTable');
  if (!tbody) return;
  
  const recentAppointments = appointmentsData
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  
  tbody.innerHTML = recentAppointments.map(apt => `
    <tr>
      <td>${apt.patientName}</td>
      <td>${apt.doctorName}</td>
      <td>${apt.department}</td>
      <td>${apt.date}</td>
      <td>${apt.time}</td>
      <td><span class="status-badge status-${apt.status}">${apt.status}</span></td>
    </tr>
  `).join('');
}

// Update appointments table
function updateAppointmentsTable() {
  const tbody = document.getElementById('appointmentsTableBody');
  if (!tbody) return;
  
  let filteredAppointments = [...appointmentsData];
  
  // Apply date filter
  const dateFilter = document.getElementById('appointmentDateFilter');
  if (dateFilter && dateFilter.value) {
    filteredAppointments = filteredAppointments.filter(apt => apt.date === dateFilter.value);
  }
  
  // Apply status filter
  const statusFilter = document.getElementById('appointmentStatusFilter');
  if (statusFilter && statusFilter.value) {
    filteredAppointments = filteredAppointments.filter(apt => apt.status === statusFilter.value);
  }
  
  tbody.innerHTML = filteredAppointments.map(apt => `
    <tr>
      <td>${apt._id ? apt._id.slice(-6) : 'N/A'}</td>
      <td>${apt.patientName}</td>
      <td>${apt.patientContact}</td>
      <td>${apt.doctorName}</td>
      <td>${apt.department}</td>
      <td>${apt.date}</td>
      <td>${apt.time}</td>
      <td><span class="status-badge status-${apt.status}">${apt.status}</span></td>
      <td>
        <button class="btn btn-action btn-sm btn-primary" onclick="updateAppointmentStatus('${apt._id}', 'scheduled')">Schedule</button>
        <button class="btn btn-action btn-sm btn-success" onclick="updateAppointmentStatus('${apt._id}', 'completed')">Complete</button>
        <button class="btn btn-action btn-sm btn-danger" onclick="updateAppointmentStatus('${apt._id}', 'cancelled')">Cancel</button>
      </td>
    </tr>
  `).join('');
}

// Update doctors table
function updateDoctorsTable() {
  const tbody = document.getElementById('doctorsTableBody');
  if (!tbody) return;
  
  tbody.innerHTML = doctorsData.map(doc => {
    const appointmentCount = appointmentsData.filter(apt => apt.doctorName === doc.name).length;
    const timeSlots = doc.timeSlots.map(slot => `${slot.start}-${slot.end}`).join(', ');
    
    return `
      <tr>
        <td>${doc.name}</td>
        <td>${doc.department}</td>
        <td>${timeSlots}</td>
        <td>₹${doc.fee}</td>
        <td>${appointmentCount}</td>
        <td>
          <button class="btn btn-action btn-sm btn-warning" onclick="editDoctor('${doc._id}')">Edit</button>
          <button class="btn btn-action btn-sm btn-danger" onclick="deleteDoctor('${doc._id}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Update patients table
function updatePatientsTable() {
  const tbody = document.getElementById('patientsTableBody');
  if (!tbody) return;
  
  tbody.innerHTML = patientsData.map(patient => {
    const appointmentCount = appointmentsData.filter(apt => apt.patientName === patient.name).length;
    const joinDate = new Date(patient.createdAt).toLocaleDateString();
    
    return `
      <tr>
        <td>${patient.name}</td>
        <td>${patient.username}</td>
        <td>${patient.email}</td>
        <td>${patient.contact}</td>
        <td>${joinDate}</td>
        <td>${appointmentCount}</td>
      </tr>
    `;
  }).join('');
}

// Update appointment status
async function updateAppointmentStatus(appointmentId, status) {
  try {
    const response = await fetch(`/api/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    
    if (response.ok) {
      await loadAllData();
      updateAllTables();
      updateDashboardStats();
    }
  } catch (error) {
    console.error('Error updating appointment status:', error);
  }
}

// Doctor management functions
function generateTimeSlots() {
  const dropdown = document.getElementById("timeSlotDropdown");
  if (!dropdown) return;

  dropdown.innerHTML = "";
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="form-check px-3">
          <input class="form-check-input time-checkbox" type="checkbox" value="${time}" id="slot-${time}">
          <label class="form-check-label" for="slot-${time}">${time}</label>
        </div>
      `;
      dropdown.appendChild(li);
    }
  }
}

function getSelectedTimeSlots() {
  const checkboxes = document.querySelectorAll(".time-checkbox:checked");
  return Array.from(checkboxes).map(cb => cb.value);
}

function groupTimeSlotsToRanges(slots) {
  if (!slots.length) return [];
  const sorted = slots.slice().sort();
  const ranges = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const [ph, pm] = prev.split(":").map(Number);
    const [ch, cm] = sorted[i].split(":").map(Number);
    const prevMinutes = ph * 60 + pm;
    const currMinutes = ch * 60 + cm;
    if (currMinutes - prevMinutes !== 30) {
      ranges.push({ start, end: prev });
      start = sorted[i];
    }
    prev = sorted[i];
  }
  ranges.push({ start, end: prev });
  return ranges;
}

async function handleDoctorFormSubmit(e) {
  e.preventDefault();
  
  let name = document.getElementById("doctorName").value.trim();
  name = name.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  if (!name.startsWith("Dr.")) {
    name = "Dr. " + name;
  }
  
  const dept = document.getElementById("department").value.trim();
  const fee = document.getElementById("fee").value.trim();
  const timeSlots = getSelectedTimeSlots();
  const timeRanges = groupTimeSlotsToRanges(timeSlots);

  const doctor = { name, department: dept, timeSlots: timeRanges, fee };

  try {
    if (editingDoctorId) {
      await updateDoctor(editingDoctorId, doctor);
      editingDoctorId = null;
      document.querySelector("button[type='submit']").innerText = "Add Doctor";
    } else {
      await addDoctor(doctor);
    }
    
    // Close modal and refresh data
    const modal = bootstrap.Modal.getInstance(document.getElementById('addDoctorModal'));
    if (modal) modal.hide();
    
    doctorForm.reset();
    document.querySelectorAll(".time-checkbox").forEach(cb => cb.checked = false);
    
    await loadAllData();
    updateAllTables();
    updateDashboardStats();
  } catch (error) {
    console.error('Error handling doctor form:', error);
  }
}

async function editDoctor(id) {
  const doctor = doctorsData.find(doc => doc._id === id);
  if (!doctor) return;
  
  document.getElementById("doctorName").value = doctor.name;
  document.getElementById("department").value = doctor.department;
  document.getElementById("fee").value = doctor.fee;
  
  // Set time slots
  const selectedSlots = expandRangesToSlots(doctor.timeSlots || []);
  document.querySelectorAll(".time-checkbox").forEach(cb => {
    cb.checked = selectedSlots.includes(cb.value);
  });
  
  editingDoctorId = id;
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('addDoctorModal'));
  modal.show();
}

function expandRangesToSlots(ranges) {
  const slots = [];
  ranges.forEach(range => {
    let [h, m] = range.start.split(":").map(Number);
    const [endH, endM] = range.end.split(":").map(Number);
    while (h < endH || (h === endH && m <= endM)) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      m += 30;
      if (m >= 60) {
        h += 1;
        m -= 60;
      }
    }
  });
  return slots;
}

async function deleteDoctor(id) {
  if (!confirm("Are you sure you want to delete this doctor?")) return;
  
  try {
    const response = await fetch(`/api/doctors/${id}`, { method: 'DELETE' });
    if (response.ok) {
      await loadAllData();
      updateAllTables();
      updateDashboardStats();
    }
  } catch (error) {
    console.error('Error deleting doctor:', error);
  }
}

// API helpers
async function addDoctor(doctor) {
  const response = await fetch('/api/doctors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doctor),
    credentials: 'include'   // ✅ ensures connect.sid cookie is sent
  });

  if (!response.ok) {
    throw new Error(`Failed to add doctor: ${response.status}`);
  }

  return response.json();
}


async function updateDoctor(id, doctor) {
  const response = await fetch(`/api/doctors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doctor),
    credentials: 'include'   // ✅ ensures session cookie is sent
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update doctor: ${response.status}`);
  }
  
  return response.json();
}

// Placeholder functions for patient management
function viewPatientDetails(patientId) {
  console.log('View patient details:', patientId);
}

function editPatient(patientId) {
  console.log('Edit patient:', patientId);
}

