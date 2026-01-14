import React from 'react';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { useAuth } from '../../context/AuthContext';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

const HistoricalModeBanner = () => {
    const { isHistoricalMode, selectedYear, getSelectedYearHistory } = useAcademicYear();
    const { user } = useAuth();

    // Only show for students and parents, not for teachers
    if (!isHistoricalMode || !user || user.role === 'teacher') {
        return null;
    }

    const historyEntry = getSelectedYearHistory();

    return (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
            <div className="flex items-center gap-3 max-w-7xl mx-auto">
                <InformationCircleIcon className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div className="flex-1">
                    <p className="text-sm text-amber-800">
                        <span className="font-medium">📚 Viewing historical data from {selectedYear?.name}</span>
                        {historyEntry && (
                            <span className="ml-2 text-amber-600">
                                — {historyEntry.grade} • {historyEntry.class_name}
                            </span>
                        )}
                    </p>
                </div>
                <p className="text-xs text-amber-600">
                    Some actions may be disabled
                </p>
            </div>
        </div>
    );
};

export default HistoricalModeBanner;
