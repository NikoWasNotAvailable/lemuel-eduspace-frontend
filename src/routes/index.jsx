import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleBasedRedirect from '../components/RoleBasedRedirect';

// Auth pages
import Login from '../pages/Login';
import LoginStudent from '../pages/LoginStudent';
import LoginParent from '../pages/LoginParent';
import LoginTeacher from '../pages/LoginTeacher';
import LoginAdmin from '../pages/LoginAdmin';
import Register from '../pages/Register';

// Protected pages
import Dashboard from '../pages/Dashboard';
import Students from '../pages/Students';
import Teachers from '../pages/Teachers';
import RegionsList from '../pages/RegionsList';
import RegionGrades from '../pages/RegionGrades';
import GradeClasses from '../pages/GradeClasses';
import ClassSubjects from '../pages/ClassSubjects';
import SubjectSessions from '../pages/SubjectSessions';
import SessionDetail from '../pages/SessionDetail';
import Notifications from '../pages/Notifications';
import Calendar from '../pages/Calendar';
import Banners from '../pages/Banners';
import TeacherClasses from '../pages/TeacherClasses';
import Profile from '../pages/Profile';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/login-student" element={<LoginStudent />} />
            <Route path="/login-parent" element={<LoginParent />} />
            <Route path="/login-teacher" element={<LoginTeacher />} />
            <Route path="/login-admin" element={<LoginAdmin />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes - Dashboard */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute requiredRoles={['teacher', 'student', 'parent', 'student_parent']}>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />

            {/* Protected routes - Admin only */}
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
                path="/banner"
                element={
                    <ProtectedRoute requiredRoles={['admin']}>
                        <Banners />
                    </ProtectedRoute>
                }
            />

            {/* Protected routes - Notifications & Calendar */}
            <Route
                path="/notifications"
                element={
                    <ProtectedRoute requiredRoles={['admin', 'teacher', 'student', 'student_parent']}>
                        <Notifications />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/calendar"
                element={
                    <ProtectedRoute requiredRoles={['admin', 'teacher', 'student', 'parent', 'student_parent']}>
                        <Calendar />
                    </ProtectedRoute>
                }
            />

            {/* Protected routes - Classes & Subjects */}
            <Route
                path="/teacher-classes"
                element={
                    <ProtectedRoute requiredRoles={['teacher']}>
                        <TeacherClasses />
                    </ProtectedRoute>
                }
            />

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

            {/* Redirect routes */}
            <Route path="/" element={<RoleBasedRedirect />} />
            <Route path="*" element={<RoleBasedRedirect />} />
        </Routes>
    );
};

export default AppRoutes;
