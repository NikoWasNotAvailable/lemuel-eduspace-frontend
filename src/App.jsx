import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import Login from './pages/Login';
import LoginStudent from './pages/LoginStudent';
import LoginParent from './pages/LoginParent';
import LoginTeacher from './pages/LoginTeacher';
import LoginAdmin from './pages/LoginAdmin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import RegionsList from './pages/RegionsList';
import RegionGrades from './pages/RegionGrades';
import GradeClasses from './pages/GradeClasses';
import ClassSubjects from './pages/ClassSubjects';
import SubjectSessions from './pages/SubjectSessions';
import SessionDetail from './pages/SessionDetail';
import Notifications from './pages/Notifications';
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/login-student" element={<LoginStudent />} />
            <Route path="/login-parent" element={<LoginParent />} />
            <Route path="/login-teacher" element={<LoginTeacher />} />
            <Route path="/login-admin" element={<LoginAdmin />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'student', 'parent', 'student_parent']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/students"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <Students />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teachers"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <Teachers />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute requiredRoles={['admin', 'teacher', 'student', 'student_parent']}>
                  <Notifications />
                </ProtectedRoute>
              }
            />

            {/* Legacy route - redirect to new structure */}
            {/* <Route
              path="/classes"
              element={
                <ProtectedRoute requiredRoles={['admin', 'teacher', 'student', 'parent', 'student_parent']}>
                  <Classes />
                </ProtectedRoute>
              }
            /> */}

            {/* New structured navigation routes */}
            <Route
              path="/classes"
              element={
                <ProtectedRoute requiredRoles={['admin', 'teacher', 'student', 'parent', 'student_parent']}>
                  <RegionsList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/classes/:regionId"
              element={
                <ProtectedRoute requiredRoles={['admin', 'teacher', 'student', 'parent', 'student_parent']}>
                  <RegionGrades />
                </ProtectedRoute>
              }
            />

            <Route
              path="/classes/:regionId/grade/:category"
              element={
                <ProtectedRoute requiredRoles={['admin', 'teacher', 'student', 'parent', 'student_parent']}>
                  <GradeClasses />
                </ProtectedRoute>
              }
            />

            <Route
              path="/classes/:regionId/class/:classId"
              element={
                <ProtectedRoute requiredRoles={['admin', 'teacher', 'student', 'parent', 'student_parent']}>
                  <ClassSubjects />
                </ProtectedRoute>
              }
            />

            <Route
              path="/subjects/:subjectId/sessions"
              element={
                <ProtectedRoute requiredRoles={['admin', 'teacher', 'student', 'parent', 'student_parent']}>
                  <SubjectSessions />
                </ProtectedRoute>
              }
            />

            <Route
              path="/subjects/:subjectId/sessions/:sessionId"
              element={
                <ProtectedRoute requiredRoles={['admin', 'teacher', 'student', 'parent', 'student_parent']}>
                  <SessionDetail />
                </ProtectedRoute>
              }
            />

            {/* Redirect root to appropriate page based on role */}
            <Route path="/" element={<RoleBasedRedirect />} />

            {/* Catch all route */}
            <Route path="*" element={<RoleBasedRedirect />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
