const deptSelect = document.getElementById("deptSelect");
const doctorSelect = document.getElementById("doctorSelect");
const timeSelect = document.getElementById("timeSelect");
const appointmentForm = document.getElementById("appointmentForm");
const appointmentList = document.getElementById("appointmentList");

// Get all doctors from backend
async function getDoctors() {
  const response = await fetch('http://localhost:5000/api/doctors');
  return response.json();
}

// Get all appointments from backend
async function getAppointments() {
  const response = await fetch('http://localhost:5000/api/appointments');
  return response.json();
}

// Populate departments dropdown from doctors data
async function populateDepartments() {
  deptSelect.innerHTML = `<option value="">Select Department</option>`;
  const doctors = await getDoctors();

  // Defensive check to avoid JS errors if fetch fails
  if (!Array.isArray(doctors)) {
    alert("Could not load doctors. Please try again later.");
    return;
  }

  const departments = [...new Set(doctors.map(doc => doc.department))];
  departments.forEach(dept => {
    const option = document.createElement("option");
    option.value = dept;
    option.textContent = dept;
    deptSelect.appendChild(option);
  });
}

// Populate doctors dropdown based on selected department
deptSelect.onchange = async function () {
  const selectedDept = deptSelect.value;
  doctorSelect.innerHTML = `<option value="">Select Doctor</option>`;
  if (!selectedDept) return;
  const doctors = await getDoctors();
  doctors
    .filter(doc => doc.department === selectedDept)
    .forEach(doc => {
      const option = document.createElement("option");
      option.value = doc.name;
      option.textContent = doc.name;
      doctorSelect.appendChild(option);
    });
};

const appointmentDateInput = document.getElementById("appointmentDate");
const todayStr = new Date().toISOString().split("T")[0];
appointmentDateInput.min = todayStr;
appointmentDateInput.addEventListener("input", function() {
  if (this.value < todayStr) {
    this.value = todayStr;
  }
});

// Generate 15-min intervals from timeRanges
function generateIntervals(timeRanges, intervalMinutes = 15) {
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

// Populate available time slots based on selected doctor and date
doctorSelect.onchange = updateTimeSlots;
appointmentDateInput.onchange = updateTimeSlots;

async function updateTimeSlots() {
  timeSelect.innerHTML = `<option value="">Select Time Slot</option>`;
  const selectedDoctorName = doctorSelect.value;
  const selectedDate = appointmentDateInput.value;
  if (!selectedDoctorName || !selectedDate) return;

  const doctors = await getDoctors();
  const selectedDoc = doctors.find(doc => doc.name === selectedDoctorName);
  if (!selectedDoc || !selectedDoc.timeSlots || selectedDoc.timeSlots.length === 0) return;

  // Generate slots from ranges
  let formattedSlots = generateIntervals(selectedDoc.timeSlots);

  // Remove already booked slots for this doctor and date
  const appointments = await getAppointments();
  const bookedSlots = appointments
    .filter(app => app.doctorName === selectedDoctorName && app.date === selectedDate)
    .map(app => app.time);

  formattedSlots.filter(time => !bookedSlots.includes(time)).forEach(time => {
    const option = document.createElement("option");
    option.value = time;
    option.textContent = time;
    timeSelect.appendChild(option);
  });
}




appointmentForm.onsubmit = async function (e) {
  e.preventDefault();
  const patientName = document.getElementById("patientName").value.trim();
  const patientContact = document.getElementById("patientContact").value.trim();
  const patientAddress = document.getElementById("patientAddress").value.trim();
  const symptoms = document.getElementById("symptoms").value.trim();
  const department = deptSelect.value;
  const doctorName = doctorSelect.value;
  const date = document.getElementById("appointmentDate").value;
  const time = timeSelect.value;

  // Validate contact number
  if (!/^\d{10}$/.test(patientContact)) {
    alert("Please enter a valid 10 digit contact number.");
    return;
  }

  // Prevent booking for past dates
  const today = new Date().toISOString().split("T")[0];
  if (date < today) {
    alert("Please select today or a future date for appointment.");
    return;
  }

  // Prevent double booking
  const appointments = await getAppointments();
  const alreadyBooked = appointments.some(app =>
    app.doctorName === doctorName && app.date === date && app.time === time
  );
  if (alreadyBooked) {
    alert("This time slot is already booked for the selected doctor.");
    return;
  }

  const appointment = {
    patientName,
    patientContact,
    patientAddress,
    symptoms,
    department,
    doctorName,
    date,
    time
  };
  await addAppointment(appointment);
  appointmentForm.reset();
  displayAppointments();
  alert("Appointment booked successfully!");
};

// In displayAppointments, show contact and address with labels
async function displayAppointments() {
  appointmentList.innerHTML = "";
  const appointments = await getAppointments();
  if (appointments.length === 0) {
    appointmentList.innerHTML = "<li class='list-group-item'>No appointments found.</li>";
    return;
  }

  appointments.forEach((app, idx) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <div>
        <strong>${app.patientName}</strong><br>
        <span>Contact: ${app.patientContact}</span><br>
        <span>Address: ${app.patientAddress}</span><br>
        Symptoms: <em>${app.symptoms}</em><br>
        Dept: ${app.department}, Doctor: ${app.doctorName}<br>
        Date: ${app.date}, Time: <span class="badge bg-primary">${app.time}</span>
      </div>
      <button class="btn btn-danger btn-sm cancel-btn" data-id="${app._id}">Cancel</button>
    `;
    appointmentList.appendChild(li);
  });
}

appointmentList.addEventListener('click', async function(e) {
  if (e.target.classList.contains('cancel-btn')) {
    const id = e.target.getAttribute('data-id');
    if (confirm("Are you sure you want to cancel this appointment?")) {
      await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      // Refresh the appointment list
      displayAppointments(); // <-- use this
    }
  }
});

// Example: Add appointment (in patient.js)
async function addAppointment(appointment) {
  const response = await fetch('http://localhost:5000/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appointment)
  });
  return response.json();
}

// Example: Delete appointment
async function deleteAppointment(index) {
  const response = await fetch(`http://localhost:5000/api/appointments/${index}`, {
    method: 'DELETE'
  });
  return response.json();
}

// On Load
populateDepartments();
displayAppointments();
