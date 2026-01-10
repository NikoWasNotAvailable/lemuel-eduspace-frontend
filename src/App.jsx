import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AcademicYearProvider } from './context/AcademicYearContext';
import AppRoutes from './routes';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <AcademicYearProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </AcademicYearProvider>
    </AuthProvider>
  );
}

export default App;
