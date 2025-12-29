import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowPathIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { promotionService } from '../services';

const PromotionHistoryModal = ({ isOpen, onClose, onSuccess }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [undoing, setUndoing] = useState(null); // ID of the promotion being undone
    const [error, setError] = useState(null);

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
                                <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString()}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Promoted: <span className="font-medium text-green-600">{item.promoted_count}</span>, 
                                            Graduated: <span className="font-medium text-blue-600">{item.graduated_count}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">By: {item.created_by_name || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        {/* Only allow undoing the latest one? Or any? 
                                            Usually undoing older ones is dangerous. 
                                            For now, I'll enable it for all but warn. 
                                            Or maybe the backend restricts it.
                                        */}
                                        <button
                                            onClick={() => handleUndo(item.id)}
                                            disabled={undoing === item.id}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-red-300 text-red-600 rounded hover:bg-red-50 text-sm font-medium disabled:opacity-50"
                                        >
                                            <ArrowUturnLeftIcon className="h-4 w-4" />
                                            {undoing === item.id ? 'Undoing...' : 'Undo'}
                                        </button>
                                    </div>
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
