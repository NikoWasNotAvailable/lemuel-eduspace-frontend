import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowPathIcon, ArrowUturnLeftIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { promotionService } from '../services';

const PromotionHistoryModal = ({ isOpen, onClose, onSuccess }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [undoing, setUndoing] = useState(null); // ID of the promotion being undone
    const [error, setError] = useState(null);
    const [expandedId, setExpandedId] = useState(null); // ID of expanded history item
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsCache, setDetailsCache] = useState({}); // Cache for loaded details

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await promotionService.getPromotionHistory();
            setHistory(data);
        } catch (err) {
            console.error('Failed to fetch promotion history:', err);
            setError('Failed to load history.');
        } finally {
            setLoading(false);
        }
    };

    const toggleDetails = async (historyId) => {
        if (expandedId === historyId) {
            setExpandedId(null);
            return;
        }

        // Check if details are already cached
        if (detailsCache[historyId]) {
            setExpandedId(historyId);
            return;
        }

        // Load details from API
        setDetailsLoading(true);
        try {
            const data = await promotionService.getPromotionHistoryDetail(historyId);
            setDetailsCache(prev => ({ ...prev, [historyId]: data.details || [] }));
            setExpandedId(historyId);
        } catch (err) {
            console.error('Failed to fetch promotion details:', err);
            alert('Failed to load promotion details.');
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleUndo = async (historyId) => {
        if (!window.confirm('Are you sure you want to UNDO this promotion? This will revert student grades and classes.')) {
            return;
        }

        setUndoing(historyId);
        try {
            await promotionService.undoPromotion(historyId);
            await fetchHistory(); // Refresh history
            if (onSuccess) onSuccess(); // Refresh student list
        } catch (err) {
            console.error('Undo failed:', err);
            let errorMessage = err.message;
            if (err.response?.data?.detail) {
                if (typeof err.response.data.detail === 'string') {
                    errorMessage = err.response.data.detail;
                } else if (Array.isArray(err.response.data.detail)) {
                    errorMessage = err.response.data.detail.map(e => e.msg).join(', ');
                } else {
                    errorMessage = JSON.stringify(err.response.data.detail);
                }
            }
            alert('Failed to undo promotion: ' + errorMessage);
        } finally {
            setUndoing(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Promotion History</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-red-600 text-center py-8">{error}</div>
                    ) : history.length === 0 ? (
                        <div className="text-gray-500 text-center py-8">No promotion history found.</div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((item) => (
                                <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">
                                                {new Date(item.promotion_date).toLocaleDateString()} {new Date(item.promotion_date).toLocaleTimeString()}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Promoted: <span className="font-medium text-green-600">{item.summary?.promoted || 0}</span>,
                                                Graduated: <span className="font-medium text-blue-600">{item.summary?.graduated || 0}</span>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Total affected: {item.total_affected} • Status: <span className={`font-medium ${item.status === 'applied' ? 'text-green-600' : 'text-yellow-600'}`}>{item.status}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleDetails(item.id)}
                                                disabled={detailsLoading && expandedId !== item.id}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-600 rounded hover:bg-gray-100 text-sm font-medium disabled:opacity-50"
                                            >
                                                {expandedId === item.id ? (
                                                    <><ChevronUpIcon className="h-4 w-4" /> Hide Details</>
                                                ) : (
                                                    <><ChevronDownIcon className="h-4 w-4" /> {detailsLoading ? 'Loading...' : 'View Details'}</>
                                                )}
                                            </button>
                                            {item.status === 'applied' && (
                                                <button
                                                    onClick={() => handleUndo(item.id)}
                                                    disabled={undoing === item.id}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-red-300 text-red-600 rounded hover:bg-red-50 text-sm font-medium disabled:opacity-50"
                                                >
                                                    <ArrowUturnLeftIcon className="h-4 w-4" />
                                                    {undoing === item.id ? 'Undoing...' : 'Undo'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expandable Details Section */}
                                    {expandedId === item.id && detailsCache[item.id] && (
                                        <div className="border-t border-gray-200 bg-white p-4">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Student Details</h4>
                                            {detailsCache[item.id].length === 0 ? (
                                                <p className="text-sm text-gray-500">No details available.</p>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full text-sm">
                                                        <thead>
                                                            <tr className="bg-gray-100">
                                                                <th className="px-3 py-2 text-left font-medium text-gray-600">Student</th>
                                                                <th className="px-3 py-2 text-left font-medium text-gray-600">Old Grade/Class</th>
                                                                <th className="px-3 py-2 text-left font-medium text-gray-600">New Grade/Class</th>
                                                                <th className="px-3 py-2 text-left font-medium text-gray-600">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {detailsCache[item.id].map((detail, idx) => (
                                                                <tr key={idx} className="hover:bg-gray-50">
                                                                    <td className="px-3 py-2 text-gray-900">{detail.student_name}</td>
                                                                    <td className="px-3 py-2 text-gray-600">
                                                                        {detail.old_grade} - {detail.old_class_name || 'N/A'}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-gray-600">
                                                                        {detail.new_grade ? `${detail.new_grade} - ${detail.new_class_name || 'N/A'}` : 'Graduated'}
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${detail.status === 'promoted' ? 'bg-green-100 text-green-700' :
                                                                                detail.status === 'graduated' ? 'bg-blue-100 text-blue-700' :
                                                                                    'bg-gray-100 text-gray-700'
                                                                            }`}>
                                                                            {detail.status}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromotionHistoryModal;
