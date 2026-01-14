import React from 'react';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { useAuth } from '../../context/AuthContext';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

const YearSelector = ({ className = '' }) => {
    const { user } = useAuth();
    const {
        allYears,
        selectedYear,
        currentYear,
        userHistory,
        loading,
        selectYear,
        isHistoricalMode
    } = useAcademicYear();

    // Don't show for admin, teacher, or if no years available (only students and parents can change year)
    if (!user || user.role === 'admin' || user.role === 'teacher' || allYears.length === 0) {
        return null;
    }

    // Check if user has history for a specific year
    const hasHistoryForYear = (yearId) => {
        return userHistory.some(h => h.academic_year.id === yearId);
    };

    // Get display value
    const getDisplayValue = () => {
        if (!selectedYear || selectedYear.is_current) {
            return 'current';
        }
        return selectedYear.id.toString();
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
            <select
                value={getDisplayValue()}
                onChange={(e) => selectYear(e.target.value === 'current' ? null : parseInt(e.target.value))}
                disabled={loading}
                className={`
                    border rounded-md px-3 py-1.5 text-sm font-medium
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${isHistoricalMode 
                        ? 'bg-amber-50 border-amber-300 text-amber-800' 
                        : 'bg-white border-gray-300 text-gray-700'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                `}
            >
                <option value="current">
                    {currentYear ? `${currentYear.name} (Current)` : 'Current Year'}
                </option>
                {allYears
                    .filter(year => !year.is_current && hasHistoryForYear(year.id))
                    .map(year => (
                        <option key={year.id} value={year.id}>
                            {year.name}
                        </option>
                    ))
                }
            </select>
        </div>
    );
};

export default YearSelector;
