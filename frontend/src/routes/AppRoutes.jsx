import { Routes, Route } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'

// Public Pages
import Home from '../pages/Home'
import About from '../pages/About'
import Departments from '../pages/Departments'
import Services from '../pages/Services'
import { Doctors } from '../pages/doctors'
import { Appointment } from '../pages/appointments'
import Contact from '../pages/Contact'
import NotFound from '../pages/NotFound'

// Auth Pages
import { Login, Register } from '../pages/auth'

// Management Pages
import { Dashboard } from '../pages/dashboard'
import { PatientList, PatientProfile } from '../pages/patients'
import { DoctorList } from '../pages/doctors'
import { AppointmentList } from '../pages/appointments'
import { MedicalRecordList } from '../pages/medical-records'
import { PrescriptionList } from '../pages/prescriptions'
import { InvoiceList } from '../pages/invoices'
import { UserList } from '../pages/users'

// Doctor Portal Pages
import {
  DoctorClinicRoom,
  DoctorAppointments,
  DoctorMedicalRecords,
  DoctorPrescriptions,
  DoctorPatients,
  DoctorSchedule
} from '../pages/doctor'

// Accountant Portal Page
import { AccountantPortal } from '../pages/accountant'

export default function AppRoutes() {

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/gioi-thieu" element={<MainLayout><About /></MainLayout>} />
      <Route path="/khoa-phong" element={<MainLayout><Departments /></MainLayout>} />
      <Route path="/dich-vu" element={<MainLayout><Services /></MainLayout>} />
      <Route path="/bac-si" element={<MainLayout><Doctors /></MainLayout>} />
      <Route path="/dat-lich-kham" element={<MainLayout><Appointment /></MainLayout>} />
      <Route path="/lien-he" element={<MainLayout><Contact /></MainLayout>} />

      {/* Patient Portal / Hồ sơ bệnh nhân & Sổ khám bệnh */}
      <Route path="/ho-so-ca-nhan" element={<MainLayout><PatientProfile /></MainLayout>} />
      <Route path="/so-kham-benh" element={<MainLayout><PatientProfile /></MainLayout>} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin / Clinic Management Portal */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/patients" element={<PatientList />} />
      <Route path="/doctors-manage" element={<DoctorList />} />
      <Route path="/appointments" element={<AppointmentList />} />
      <Route path="/medical-records" element={<MedicalRecordList />} />
      <Route path="/prescriptions" element={<PrescriptionList />} />
      <Route path="/invoices" element={<InvoiceList />} />
      <Route path="/users" element={<UserList />} />

      {/* Doctor Portal */}
      <Route path="/doctor" element={<DoctorClinicRoom />} />
      <Route path="/doctor/ban-kham" element={<DoctorClinicRoom />} />
      <Route path="/doctor/lich-kham" element={<DoctorAppointments />} />
      <Route path="/doctor/benh-an" element={<DoctorMedicalRecords />} />
      <Route path="/doctor/ke-don" element={<DoctorPrescriptions />} />
      <Route path="/doctor/benh-nhan" element={<DoctorPatients />} />
      <Route path="/doctor/lich-truc" element={<DoctorSchedule />} />

      {/* Accountant Portal */}
      <Route path="/accountant" element={<AccountantPortal />} />
      <Route path="/ke-toan" element={<AccountantPortal />} />

      {/* 404 */}

      <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
    </Routes>
  )
}
