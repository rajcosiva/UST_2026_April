// Global variables
let currentPatient = null;
let authToken = localStorage.getItem('patientToken');

// DOM elements
const authSection = document.getElementById('authSection');
const patientDashboard = document.getElementById('patientDashboard');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const logoutBtn = document.getElementById('logoutBtn');

// Initialize UI enhancements when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Clear forms to prevent browser autofill persistence
  clearLoginForm();
  clearRegistrationForm();
  
  // Add real-time validation to all forms
  ui.addRealTimeValidation(document.getElementById('loginFormElement'));
  ui.addRealTimeValidation(document.getElementById('registerFormElement'));
  ui.addRealTimeValidation(document.getElementById('appointmentForm'));
  ui.addRealTimeValidation(document.getElementById('editProfileForm'));
  ui.addRealTimeValidation(document.getElementById('editAppointmentForm'));
  
  // Format phone inputs
  ui.formatPhoneInput(document.getElementById('regContact'));
  ui.formatPhoneInput(document.getElementById('editContact'));
});

// Check if user is already logged in
if (authToken) {
  checkAuthStatus();
}

// Authentication functions
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/patients/profile', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.ok) {
      currentPatient = await response.json();
      showDashboard();
      loadPatientData();
    } else {
      localStorage.removeItem('patientToken');
      showAuth();
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    localStorage.removeItem('patientToken');
    showAuth();
  }
}

function showAuth() {
  authSection.style.display = 'flex';
  patientDashboard.style.display = 'none';
  logoutBtn.style.display = 'none';
}

function showDashboard() {
  authSection.style.display = 'none';
  patientDashboard.style.display = 'block';
  logoutBtn.style.display = 'block';
}

// Login form submission
document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const response = await fetch('/api/patients/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      authToken = data.token;
      currentPatient = data.patient;
      localStorage.setItem('patientToken', authToken);
      showDashboard();
      loadPatientData();
      showAlert('Login successful!', 'success');
    } else {
      showAlert(data.error || 'Login failed', 'danger');
    }
  } catch (error) {
    showAlert('Login failed. Please try again.', 'danger');
  }
});

// Registration form submission
document.getElementById('registerFormElement').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;
  
  if (password !== confirmPassword) {
    showAlert('Passwords do not match', 'danger');
    return;
  }
  
  const formData = {
    name: document.getElementById('regName').value,
    username: document.getElementById('regUsername').value,
    email: document.getElementById('regEmail').value,
    contact: document.getElementById('regContact').value,
    password: password
  };
  
  try {
    const response = await fetch('/api/patients/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      authToken = data.token;
      currentPatient = data.patient;
      localStorage.setItem('patientToken', authToken);
      
      // Clear the registration form
      document.getElementById('registerFormElement').reset();
      
      showDashboard();
      loadPatientData();
      showAlert('Registration successful!', 'success');
    } else {
      showAlert(data.error || 'Registration failed', 'danger');
    }
  } catch (error) {
    showAlert('Registration failed. Please try again.', 'danger');
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('patientToken');
  authToken = null;
  currentPatient = null;
  
  // Clear all forms to prevent data persistence
  clearLoginForm();
  clearRegistrationForm();
  
  // Redirect to home page
  window.location.href = '/index.html';
});

// Toggle between login and register forms
document.getElementById('showRegister').addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.style.display = 'none';
  registerForm.style.display = 'block';
  
  // Clear registration form when showing it
  clearRegistrationForm();
});

document.getElementById('showLogin').addEventListener('click', (e) => {
  e.preventDefault();
  registerForm.style.display = 'none';
  loginForm.style.display = 'block';
  
  // Clear login form when showing it
  clearLoginForm();
});

// Load patient data
async function loadPatientData() {
  if (!currentPatient) return;
  
  // Update profile display
  document.getElementById('patientName').textContent = currentPatient.name;
  document.getElementById('profileName').textContent = currentPatient.name;
  document.getElementById('profileContact').textContent = currentPatient.contact;
  document.getElementById('profileEmail').textContent = currentPatient.email;
  
  // Load appointments
  await loadAppointments();
  
  // Load appointment booking form data
  await loadBookingFormData();
}

// Load appointments
async function loadAppointments() {
  try {
    const response = await fetch('/api/patients/appointments', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.ok) {
      const appointments = await response.json();
      displayAppointments(appointments);
      updateStats(appointments);
    }
  } catch (error) {
    console.error('Failed to load appointments:', error);
  }
}

// Display appointments
function displayAppointments(appointments) {
  const appointmentsList = document.getElementById('appointmentsList');
  
  if (appointments.length === 0) {
    appointmentsList.innerHTML = '<p class="text-muted text-center">No appointments found.</p>';
    return;
  }
  
  appointmentsList.innerHTML = appointments.map(appointment => `
    <div class="card appointment-card ${appointment.status === 'cancelled' ? 'cancelled' : ''}">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-8">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="mb-1">${appointment.doctorName}</h6>
                <p class="mb-1 text-muted">${appointment.department}</p>
                <p class="mb-1"><strong>Date:</strong> ${appointment.date} | <strong>Time:</strong> ${appointment.time}</p>
                <p class="mb-1"><strong>Symptoms:</strong> ${appointment.symptoms}</p>
                <span class="badge bg-${getStatusColor(appointment.status)} status-badge">${appointment.status}</span>
              </div>
            </div>
          </div>
          <div class="col-md-4 text-end">
            ${appointment.status !== 'cancelled' ? `
              <button class="btn btn-outline-primary btn-sm me-2" onclick="editAppointment('${appointment._id}')">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="btn btn-outline-danger btn-sm" onclick="cancelAppointment('${appointment._id}')">
                <i class="fas fa-times"></i> Cancel
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Update stats
function updateStats(appointments) {
  const total = appointments.length;
  const upcoming = appointments.filter(app => 
    app.status === 'scheduled' && new Date(app.date) >= new Date()
  ).length;
  const completed = appointments.filter(app => 
    app.status === 'completed'
  ).length;
  
  document.getElementById('totalAppointments').textContent = total;
  document.getElementById('upcomingAppointments').textContent = upcoming;
  document.getElementById('completedAppointments').textContent = completed;
}

// Get status color
function getStatusColor(status) {
  switch (status) {
    case 'scheduled': return 'primary';
    case 'confirmed': return 'success';
    case 'completed': return 'info';
    case 'cancelled': return 'danger';
    default: return 'secondary';
  }
}

// Cancel appointment
async function cancelAppointment(appointmentId) {
  if (!confirm('Are you sure you want to cancel this appointment?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/patients/appointments/${appointmentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.ok) {
      showAlert('Appointment cancelled successfully', 'success');
      loadAppointments();
    } else {
      const data = await response.json();
      showAlert(data.error || 'Failed to cancel appointment', 'danger');
    }
  } catch (error) {
    showAlert('Failed to cancel appointment', 'danger');
  }
}

// Global variables for edit functionality
let currentEditingAppointment = null;
let editDoctors = [];

// Edit appointment functionality
async function editAppointment(appointmentId) {
  try {
    // Find the appointment to edit
    const response = await fetch('/api/patients/appointments', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch appointments');
    }
    
    const appointments = await response.json();
    const appointment = appointments.find(app => app._id === appointmentId);
    
    if (!appointment) {
      showAlert('Appointment not found', 'danger');
      return;
    }
    
    // Check if appointment can be edited (not cancelled and is future appointment)
    if (appointment.status === 'cancelled') {
      showAlert('Cannot edit cancelled appointment', 'warning');
      return;
    }
    
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      showAlert('Cannot edit past appointments', 'warning');
      return;
    }
    
    // Store current editing appointment
    currentEditingAppointment = appointment;
    
    // Load doctors and populate edit form
    await loadEditFormData();
    
    // Populate form with current appointment data
    populateEditForm(appointment);
    
    // Show edit modal
    const editModal = new bootstrap.Modal(document.getElementById('editAppointmentModal'));
    editModal.show();
    
  } catch (error) {
    console.error('Edit appointment error:', error);
    showAlert('Failed to load appointment for editing', 'danger');
  }
}

// Load data for edit form
async function loadEditFormData() {
  try {
    const response = await fetch('/api/doctors');
    editDoctors = await response.json();
    
    // Populate departments in edit form
    const editDeptSelect = document.getElementById('editDeptSelect');
    editDeptSelect.innerHTML = '<option value="">Select Department</option>';
    const departments = [...new Set(editDoctors.map(doc => doc.department))];
    departments.forEach(dept => {
      const option = document.createElement('option');
      option.value = dept;
      option.textContent = dept;
      editDeptSelect.appendChild(option);
    });
    
    // Set minimum date for edit form
    const editAppointmentDate = document.getElementById('editAppointmentDate');
    const today = new Date().toISOString().split('T')[0];
    editAppointmentDate.min = today;
    
    // Add event listeners for edit form
    setupEditFormEventListeners();
    
  } catch (error) {
    console.error('Failed to load edit form data:', error);
  }
}

// Setup event listeners for edit form
function setupEditFormEventListeners() {
  const editDeptSelect = document.getElementById('editDeptSelect');
  const editDoctorSelect = document.getElementById('editDoctorSelect');
  const editAppointmentDate = document.getElementById('editAppointmentDate');
  
  // Remove existing listeners to prevent duplicates
  editDeptSelect.removeEventListener('change', handleEditDeptChange);
  editDoctorSelect.removeEventListener('change', updateEditTimeSlots);
  editAppointmentDate.removeEventListener('change', updateEditTimeSlots);
  
  // Add fresh listeners
  editDeptSelect.addEventListener('change', handleEditDeptChange);
  editDoctorSelect.addEventListener('change', updateEditTimeSlots);
  editAppointmentDate.addEventListener('change', updateEditTimeSlots);
}

// Handle department change in edit form
function handleEditDeptChange() {
  const editDeptSelect = document.getElementById('editDeptSelect');
  const editDoctorSelect = document.getElementById('editDoctorSelect');
  
  editDoctorSelect.innerHTML = '<option value="">Select Doctor</option>';
  
  const selectedDept = editDeptSelect.value;
  if (selectedDept) {
    editDoctors
      .filter(doc => doc.department === selectedDept)
      .forEach(doc => {
        const option = document.createElement('option');
        option.value = doc.name;
        option.textContent = doc.name;
        editDoctorSelect.appendChild(option);
      });
  }
}

// Update time slots for edit form
async function updateEditTimeSlots() {
  const editDoctorSelect = document.getElementById('editDoctorSelect');
  const editAppointmentDate = document.getElementById('editAppointmentDate');
  const editTimeSelect = document.getElementById('editTimeSelect');
  
  editTimeSelect.innerHTML = '<option value="">Select Time Slot</option>';
  
  const selectedDoctor = editDoctorSelect.value;
  const selectedDate = editAppointmentDate.value;
  
  if (!selectedDoctor || !selectedDate) return;
  
  try {
    const appointmentsResponse = await fetch('/api/appointments');
    const appointments = await appointmentsResponse.json();
    
    const selectedDoc = editDoctors.find(doc => doc.name === selectedDoctor);
    if (!selectedDoc || !selectedDoc.timeSlots) return;
    
    // Generate time slots
    const slots = generateTimeSlots(selectedDoc.timeSlots);
    
    // Filter out booked slots (excluding current appointment being edited)
    const bookedSlots = appointments
      .filter(app => 
        app.doctorName === selectedDoctor && 
        app.date === selectedDate &&
        app.status !== 'cancelled' &&
        app._id !== currentEditingAppointment._id // Exclude current appointment
      )
      .map(app => app.time);
    
    const availableSlots = slots.filter(slot => !bookedSlots.includes(slot));
    
    // Add current appointment's time slot even if it would be "booked"
    if (currentEditingAppointment && 
        currentEditingAppointment.time && 
        !availableSlots.includes(currentEditingAppointment.time)) {
      availableSlots.push(currentEditingAppointment.time);
      availableSlots.sort();
    }
    
    availableSlots.forEach(slot => {
      const option = document.createElement('option');
      option.value = slot;
      option.textContent = slot;
      editTimeSelect.appendChild(option);
    });
    
  } catch (error) {
    console.error('Failed to update edit time slots:', error);
  }
}

// Populate edit form with appointment data
function populateEditForm(appointment) {
  document.getElementById('editDeptSelect').value = appointment.department;
  document.getElementById('editAppointmentDate').value = appointment.date;
  document.getElementById('editSymptoms').value = appointment.symptoms;
  document.getElementById('editPatientAddress').value = appointment.patientAddress;
  
  // Trigger department change to populate doctors
  handleEditDeptChange();
  
  // Set doctor after a brief delay to ensure options are populated
  setTimeout(() => {
    document.getElementById('editDoctorSelect').value = appointment.doctorName;
    // Trigger doctor change to populate time slots
    updateEditTimeSlots().then(() => {
      // Set time after time slots are loaded
      setTimeout(() => {
        document.getElementById('editTimeSelect').value = appointment.time;
      }, 100);
    });
  }, 100);
}

// Load booking form data
async function loadBookingFormData() {
  try {
    const response = await fetch('/api/doctors');
    const doctors = await response.json();
    
    // Populate departments
    const deptSelect = document.getElementById('deptSelect');
    deptSelect.innerHTML = '<option value="">Select Department</option>';
    const departments = [...new Set(doctors.map(doc => doc.department))];
    departments.forEach(dept => {
      const option = document.createElement('option');
      option.value = dept;
      option.textContent = dept;
      deptSelect.appendChild(option);
    });
    
    // Set minimum date
    const appointmentDate = document.getElementById('appointmentDate');
    const today = new Date().toISOString().split('T')[0];
    appointmentDate.min = today;
    
    // Populate doctors based on department
    deptSelect.addEventListener('change', () => {
      const doctorSelect = document.getElementById('doctorSelect');
      doctorSelect.innerHTML = '<option value="">Select Doctor</option>';
      
      const selectedDept = deptSelect.value;
      if (selectedDept) {
        doctors
          .filter(doc => doc.department === selectedDept)
          .forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.name;
            option.textContent = doc.name;
            doctorSelect.appendChild(option);
          });
      }
    });
    
    // Update time slots when doctor or date changes
    document.getElementById('doctorSelect').addEventListener('change', updateTimeSlots);
    document.getElementById('appointmentDate').addEventListener('change', updateTimeSlots);
    
  } catch (error) {
    console.error('Failed to load booking form data:', error);
  }
}

// Update time slots
async function updateTimeSlots() {
  const doctorSelect = document.getElementById('doctorSelect');
  const appointmentDate = document.getElementById('appointmentDate');
  const timeSelect = document.getElementById('timeSelect');
  
  timeSelect.innerHTML = '<option value="">Select Time Slot</option>';
  
  const selectedDoctor = doctorSelect.value;
  const selectedDate = appointmentDate.value;
  
  if (!selectedDoctor || !selectedDate) return;
  
  try {
    const [doctorsResponse, appointmentsResponse] = await Promise.all([
      fetch('/api/doctors'),
      fetch('/api/appointments')
    ]);
    
    const doctors = await doctorsResponse.json();
    const appointments = await appointmentsResponse.json();
    
    const selectedDoc = doctors.find(doc => doc.name === selectedDoctor);
    if (!selectedDoc || !selectedDoc.timeSlots) return;
    
    // Generate time slots
    const slots = generateTimeSlots(selectedDoc.timeSlots);
    
    // Filter out booked slots
    const bookedSlots = appointments
      .filter(app => 
        app.doctorName === selectedDoctor && 
        app.date === selectedDate &&
        app.status !== 'cancelled'
      )
      .map(app => app.time);
    
    const availableSlots = slots.filter(slot => !bookedSlots.includes(slot));
    
    availableSlots.forEach(slot => {
      const option = document.createElement('option');
      option.value = slot;
      option.textContent = slot;
      timeSelect.appendChild(option);
    });
    
  } catch (error) {
    console.error('Failed to update time slots:', error);
  }
}

// Generate time slots from ranges
function generateTimeSlots(timeRanges, intervalMinutes = 15) {
  const slots = [];
  timeRanges.forEach(range => {
    let [h, m] = range.start.split(':').map(Number);
    const [endH, endM] = range.end.split(':').map(Number);
    
    while (h < endH || (h === endH && m < endM)) {
      const slot = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      slots.push(slot);
      m += intervalMinutes;
      if (m >= 60) {
        h += 1;
        m -= 60;
      }
    }
  });
  return slots;
}

// Book appointment
document.getElementById('bookAppointmentBtn').addEventListener('click', async () => {
  const form = document.getElementById('appointmentForm');
  
  const appointmentData = {
    patientAddress: document.getElementById('patientAddress').value,
    symptoms: document.getElementById('symptoms').value,
    department: document.getElementById('deptSelect').value,
    doctorName: document.getElementById('doctorSelect').value,
    date: document.getElementById('appointmentDate').value,
    time: document.getElementById('timeSelect').value
  };
  
  // Validate form
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  try {
    const response = await fetch('/api/patients/book-appointment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(appointmentData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showAlert('Appointment booked successfully!', 'success');
      form.reset();
      
      // Reset all select elements to default state
      document.getElementById('deptSelect').value = '';
      document.getElementById('doctorSelect').innerHTML = '<option value="">Select Doctor</option>';
      document.getElementById('timeSelect').innerHTML = '<option value="">Select Time Slot</option>';
      
      // Close modal and reload appointments
      const modal = bootstrap.Modal.getInstance(document.getElementById('bookAppointmentModal'));
      if (modal) {
        modal.hide();
      }
      
      // Reload appointments to show the new one immediately
      await loadAppointments();
    } else {
      showAlert(data.error || 'Failed to book appointment', 'danger');
    }
  } catch (error) {
    console.error('Appointment booking error:', error);
    showAlert('Failed to book appointment', 'danger');
  }
});

// Update profile
document.getElementById('updateProfileBtn').addEventListener('click', async () => {
  const form = document.getElementById('editProfileForm');
  
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const profileData = {
    name: document.getElementById('editName').value,
    contact: document.getElementById('editContact').value,
    email: document.getElementById('editEmail').value
  };
  
  try {
    const response = await fetch('/api/patients/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(profileData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      currentPatient = data;
      
      // Update profile display immediately
      document.getElementById('patientName').textContent = currentPatient.name;
      document.getElementById('profileName').textContent = currentPatient.name;
      document.getElementById('profileContact').textContent = currentPatient.contact;
      document.getElementById('profileEmail').textContent = currentPatient.email;
      
      // Reload appointments to ensure they show up with updated patient info
      await loadAppointments();
      
      showAlert('Profile updated successfully!', 'success');
      
      const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
      if (modal) {
        modal.hide();
      }
    } else {
      showAlert(data.error || 'Failed to update profile', 'danger');
    }
  } catch (error) {
    console.error('Profile update error:', error);
    showAlert('Failed to update profile', 'danger');
  }
});

// Update appointment
document.getElementById('updateAppointmentBtn').addEventListener('click', async () => {
  const form = document.getElementById('editAppointmentForm');
  
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  if (!currentEditingAppointment) {
    showAlert('No appointment selected for editing', 'danger');
    return;
  }
  
  const appointmentData = {
    patientAddress: document.getElementById('editPatientAddress').value,
    symptoms: document.getElementById('editSymptoms').value,
    department: document.getElementById('editDeptSelect').value,
    doctorName: document.getElementById('editDoctorSelect').value,
    date: document.getElementById('editAppointmentDate').value,
    time: document.getElementById('editTimeSelect').value
  };
  
  try {
    const response = await fetch(`/api/patients/appointments/${currentEditingAppointment._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(appointmentData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showAlert('Appointment updated successfully!', 'success');
      
      // Reset form and close modal
      form.reset();
      currentEditingAppointment = null;
      
      const modal = bootstrap.Modal.getInstance(document.getElementById('editAppointmentModal'));
      if (modal) {
        modal.hide();
      }
      
      // Reload appointments to show the updated one
      await loadAppointments();
    } else {
      showAlert(data.error || 'Failed to update appointment', 'danger');
    }
  } catch (error) {
    console.error('Appointment update error:', error);
    showAlert('Failed to update appointment', 'danger');
  }
});

// Clear edit form when modal is closed
document.getElementById('editAppointmentModal').addEventListener('hidden.bs.modal', () => {
  currentEditingAppointment = null;
  const form = document.getElementById('editAppointmentForm');
  form.reset();
  
  // Reset all select elements
  document.getElementById('editDeptSelect').value = '';
  document.getElementById('editDoctorSelect').innerHTML = '<option value="">Select Doctor</option>';
  document.getElementById('editTimeSelect').innerHTML = '<option value="">Select Time Slot</option>';
});

// Populate edit profile form
document.getElementById('editProfileModal').addEventListener('show.bs.modal', () => {
  if (currentPatient) {
    document.getElementById('editName').value = currentPatient.name;
    document.getElementById('editContact').value = currentPatient.contact;
    document.getElementById('editEmail').value = currentPatient.email;
  }
});

// Utility functions to clear forms
function clearLoginForm() {
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
  
  // Remove any validation states
  const loginFormElement = document.getElementById('loginFormElement');
  loginFormElement.classList.remove('was-validated');
  
  // Clear any custom validation messages
  const loginInputs = loginFormElement.querySelectorAll('input');
  loginInputs.forEach(input => {
    input.classList.remove('is-valid', 'is-invalid');
  });
}

function clearRegistrationForm() {
  document.getElementById('regName').value = '';
  document.getElementById('regUsername').value = '';
  document.getElementById('regEmail').value = '';
  document.getElementById('regContact').value = '';
  document.getElementById('regPassword').value = '';
  document.getElementById('regConfirmPassword').value = '';
  
  // Remove any validation states
  const regFormElement = document.getElementById('registerFormElement');
  regFormElement.classList.remove('was-validated');
  
  // Clear any custom validation messages
  const regInputs = regFormElement.querySelectorAll('input');
  regInputs.forEach(input => {
    input.classList.remove('is-valid', 'is-invalid');
  });
}

// Utility function to show alerts using UI utilities
function showAlert(message, type) {
  if (window.ui && window.ui.showAlert) {
    window.ui.showAlert(message, type);
  } else {
    // Fallback to old method if UI utility is not loaded
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove();
      }
    }, 5000);
  }
}
