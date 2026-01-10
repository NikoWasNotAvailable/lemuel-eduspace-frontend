import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { academicYearService } from '../services';
import { useAuth } from './AuthContext';

const AcademicYearContext = createContext();

export const AcademicYearProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    
    const [allYears, setAllYears] = useState([]);
    const [currentYear, setCurrentYear] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null); // null = use current/live data
    const [userHistory, setUserHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch academic years and user history when authenticated
    const fetchAcademicData = useCallback(async () => {
        if (!isAuthenticated || !user) {
            setLoading(false);
            return;
        }

        // Admin doesn't need academic year context for their own data
        if (user.role === 'admin') {
            try {
                const years = await academicYearService.getAllYears();
                setAllYears(years);
                const current = years.find(y => y.is_current);
                setCurrentYear(current || null);
            } catch (err) {
                console.error('Error fetching academic years:', err);
            }
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Fetch all years and user's history in parallel
            const [years, history] = await Promise.all([
                academicYearService.getAllYears(),
                academicYearService.getMyHistory()
            ]);

            setAllYears(years);
            setUserHistory(history);

            // Find current year
            const current = years.find(y => y.is_current);
            setCurrentYear(current || null);

        } catch (err) {
            console.error('Error fetching academic year data:', err);
            setError('Failed to load academic year data');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        fetchAcademicData();
    }, [fetchAcademicData]);

    // Reset selected year when user logs out
    useEffect(() => {
        if (!isAuthenticated) {
            setSelectedYear(null);
            setUserHistory([]);
            setAllYears([]);
            setCurrentYear(null);
        }
    }, [isAuthenticated]);

    // Get active class ID based on selected year
    const getActiveClassId = useCallback(() => {
        if (!user) return null;

        // If no year selected (or current year selected), use live data
        if (!selectedYear || selectedYear.is_current) {
            return user.class_id;
        }

        // Find history for selected year
        const historyEntry = userHistory.find(
            h => h.academic_year.id === selectedYear.id
        );

        return historyEntry?.class_id || null;
    }, [selectedYear, userHistory, user]);

    // Get active grade based on selected year
    const getActiveGrade = useCallback(() => {
        if (!user) return null;

        // If no year selected (or current year selected), use live data
        if (!selectedYear || selectedYear.is_current) {
            return user.grade;
        }

        // Find history for selected year
        const historyEntry = userHistory.find(
            h => h.academic_year.id === selectedYear.id
        );

        return historyEntry?.grade || null;
    }, [selectedYear, userHistory, user]);

    // Get active class name based on selected year
    const getActiveClassName = useCallback(() => {
        if (!user) return null;

        // If no year selected (or current year selected), use live data
        if (!selectedYear || selectedYear.is_current) {
            return user.class_name || null;
        }

        // Find history for selected year
        const historyEntry = userHistory.find(
            h => h.academic_year.id === selectedYear.id
        );

        return historyEntry?.class_name || null;
    }, [selectedYear, userHistory, user]);

    // Get active region ID based on selected year
    const getActiveRegionId = useCallback(() => {
        if (!user) return null;

        // If no year selected (or current year selected), use live data
        if (!selectedYear || selectedYear.is_current) {
            return user.region_id;
        }

        // Find history for selected year
        const historyEntry = userHistory.find(
            h => h.academic_year.id === selectedYear.id
        );

        return historyEntry?.region_id || user.region_id;
    }, [selectedYear, userHistory, user]);

    // Check if viewing historical data
    const isHistoricalMode = selectedYear && !selectedYear.is_current;

    // Get history entry for currently selected year
    const getSelectedYearHistory = useCallback(() => {
        if (!selectedYear) return null;
        return userHistory.find(h => h.academic_year.id === selectedYear.id) || null;
    }, [selectedYear, userHistory]);

    // Select a year by ID
    const selectYear = useCallback((yearId) => {
        if (yearId === null || yearId === undefined || yearId === 'current') {
            setSelectedYear(null);
        } else {
            const year = allYears.find(y => y.id === parseInt(yearId));
            setSelectedYear(year || null);
        }
    }, [allYears]);

    // Refresh data
    const refresh = useCallback(() => {
        fetchAcademicData();
    }, [fetchAcademicData]);

    const value = {
        // State
        allYears,
        currentYear,
        selectedYear,
        userHistory,
        loading,
        error,
        
        // Derived values
        isHistoricalMode,
        activeClassId: getActiveClassId(),
        activeGrade: getActiveGrade(),
        activeClassName: getActiveClassName(),
        activeRegionId: getActiveRegionId(),
        
        // Methods
        selectYear,
        getActiveClassId,
        getActiveGrade,
        getActiveClassName,
        getActiveRegionId,
        getSelectedYearHistory,
        refresh,
    };

    return (
        <AcademicYearContext.Provider value={value}>
            {children}
        </AcademicYearContext.Provider>
    );
};

export const useAcademicYear = () => {
    const context = useContext(AcademicYearContext);
    if (!context) {
        throw new Error('useAcademicYear must be used within an AcademicYearProvider');
    }
    return context;
};

export default AcademicYearContext;
