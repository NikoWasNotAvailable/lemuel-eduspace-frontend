import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import AddNotificationModal from '../components/AddNotificationModal';
import EditNotificationModal from '../components/EditNotificationModal';
import { notificationService } from '../services';
import { useAuth } from '../context/AuthContext';
import {
    BellIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    MegaphoneIcon,
    DocumentTextIcon,
    ClockIcon,
    TrashIcon,
    PencilIcon,
    FunnelIcon,
    UsersIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    UserIcon
} from '@heroicons/react/24/outline';

const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addingNotification, setAddingNotification] = useState(false);
    
    // Edit state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);
    const [updatingNotification, setUpdatingNotification] = useState(false);

    // Recipients
    const [expandedNotifications, setExpandedNotifications] = useState({});
    const [recipients, setRecipients] = useState({});
    const [loadingRecipients, setLoadingRecipients] = useState({});

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 20;

    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [currentPage, selectedType, user]);

    useEffect(() => {
        applyFilters();
    }, [notifications, searchTerm]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                page_size: pageSize
            };

            if (selectedType) {
                params.type = selectedType;
            }

            let fetchedNotifications = [];
            let fetchedTotalPages = 1;

            if (user?.role === 'admin') {
                const data = await notificationService.getAllNotifications(params);
                fetchedNotifications = data.notifications || [];
                fetchedTotalPages = data.total_pages || 1;
            } else {
                const data = await notificationService.getMyNotifications(params, user?.parent_access || false);
                // Normalize data structure for non-admins
                fetchedNotifications = Array.isArray(data) ? data.map(item => ({
                    ...item.notification,
                    is_read: item.is_read,
                    user_notification_id: item.user_notification_id
                })) : [];
                fetchedTotalPages = 1; // Backend doesn't return total pages for my-notifications
            }

            setNotifications(fetchedNotifications);
            setTotalPages(fetchedTotalPages);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const toggleRecipients = async (notificationId) => {
        const isExpanded = expandedNotifications[notificationId];

        setExpandedNotifications(prev => ({
            ...prev,
            [notificationId]: !isExpanded
        }));

        // Fetch recipients if expanding and not already loaded
        if (!isExpanded && !recipients[notificationId]) {
            setLoadingRecipients(prev => ({ ...prev, [notificationId]: true }));
            try {
                const data = await notificationService.getNotificationRecipients(notificationId);
                setRecipients(prev => ({
                    ...prev,
                    [notificationId]: data
                }));
            } catch (err) {
                console.error('Error fetching recipients:', err);
                setRecipients(prev => ({
                    ...prev,
                    [notificationId]: []
                }));
            } finally {
                setLoadingRecipients(prev => ({ ...prev, [notificationId]: false }));
            }
        }
    };

    const applyFilters = () => {
        let filtered = [...notifications];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(notif =>
                notif.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                notif.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredNotifications(filtered);
    };

    const handleAddNotification = async (submitData) => {
        try {
            setAddingNotification(true);

            // Create FormData
            const formData = new FormData();
            formData.append('title', submitData.notificationData.title);
            if (submitData.notificationData.description) formData.append('description', submitData.notificationData.description);
            formData.append('type', submitData.notificationData.type);
            formData.append('is_scheduled', submitData.notificationData.is_scheduled);
            if (submitData.notificationData.nominal) formData.append('nominal', submitData.notificationData.nominal);
            if (submitData.notificationData.date) formData.append('date', submitData.notificationData.date);
            if (submitData.notificationData.image) formData.append('image', submitData.notificationData.image);

            // Create the notification first
            const notification = await notificationService.createNotification(formData);

            // Assign to users based on assignment type
            if (submitData.assignmentType !== 'none') {
                const notificationId = notification.id;

                switch (submitData.assignmentType) {
                    case 'all':
                        // Assign to all users by role (all roles)
                        await notificationService.assignByRole(notificationId, ['admin', 'teacher', 'student']);
                        break;
                    case 'region':
                        await notificationService.assignByRegion(notificationId, submitData.regionId);
                        break;
                    case 'class':
                        await notificationService.assignByClass(notificationId, submitData.classId);
                        break;
                    case 'specific':
                        await notificationService.assignToUsers(notificationId, submitData.userIds);
                        break;
                }
            }

            await fetchNotifications();
            setIsAddModalOpen(false);
            setError(null);
        } catch (err) {
            console.error('Error adding notification:', err);
            setError(err.response?.data?.detail || 'Failed to add notification');
        } finally {
            setAddingNotification(false);
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        if (!window.confirm('Are you sure you want to delete this notification?')) {
            return;
        }

        try {
            await notificationService.deleteNotification(notificationId);
            await fetchNotifications();
            setError(null);
        } catch (err) {
            console.error('Error deleting notification:', err);
            setError(err.response?.data?.detail || 'Failed to delete notification');
        }
    };

    const handleOpenEditModal = (notification) => {
        setEditingNotification(notification);
        setIsEditModalOpen(true);
    };

    const handleEditNotification = async (notificationId, updateData) => {
        try {
            setUpdatingNotification(true);
            await notificationService.updateNotification(notificationId, updateData);
            await fetchNotifications();
            setIsEditModalOpen(false);
            setEditingNotification(null);
            setError(null);
        } catch (err) {
            console.error('Error updating notification:', err);
            setError(err.response?.data?.detail || 'Failed to update notification');
        } finally {
            setUpdatingNotification(false);
        }
    };

    const getTypeIcon = (type) => {
        const className = "h-8 w-8 text-gray-900";
        switch (type) {
            case 'announcement':
                return <MegaphoneIcon className={className} />;
            case 'assignment':
                return <DocumentTextIcon className={className} />;
            case 'event':
                return <CalendarIcon className={className} />;
            case 'payment':
                return <CurrencyDollarIcon className={className} />;
            default:
                return <BellIcon className={className} />;
        }
    };

    const getTypeBadgeColor = (type) => {
        switch (type) {
            case 'announcement':
                return 'bg-blue-100 text-blue-800';
            case 'assignment':
                return 'bg-purple-100 text-purple-800';
            case 'event':
                return 'bg-green-100 text-green-800';
            case 'payment':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    };

    return (
        <Layout>
            <div className="flex bg-white min-h-[calc(100vh-4rem)]">
                <div className="flex-1 p-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-gray-800">Notifications</h1>
                        <p className="text-gray-600 mt-1">Manage and send notifications to users</p>
                    </div>

                    {/* Actions and Filters */}
                    <div className="flex items-center justify-between mb-6 gap-4">
                        <div className="flex items-center gap-4 flex-1">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search notifications..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                            </div>

                            {/* Type Filter */}
                            <div className="flex items-center gap-2">
                                <FunnelIcon className="h-5 w-5 text-gray-500" />
                                <select
                                    value={selectedType}
                                    onChange={(e) => {
                                        setSelectedType(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">All Types</option>
                                    <option value="general">General</option>
                                    <option value="announcement">Announcement</option>
                                    <option value="assignment">Assignment</option>
                                    <option value="event">Event</option>
                                    {(['admin', 'teacher'].includes(user?.role) || user?.parent_access) && (
                                        <option value="payment">Payment</option>
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* Add Button */}
                        {user?.role === 'admin' && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-[#6B7280] text-white text-sm font-medium px-6 py-2.5 rounded-md hover:bg-[#5B6170] transition flex items-center gap-2"
                            >
                                <PlusIcon className="h-5 w-5" />
                                ADD NOTIFICATION
                            </button>
                        )}
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                        </div>
                    )}

                    {/* Notifications List */}
                    {!loading && (
                        <div>
                            {filteredNotifications.length === 0 ? (
                                <div className="text-center py-12">
                                    <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications found</h3>
                                    <p className="text-gray-600 mb-6">
                                        {searchTerm || selectedType
                                            ? 'Try adjusting your filters'
                                            : 'Create your first notification to get started'}
                                    </p>
                                    {!searchTerm && !selectedType && user?.role === 'admin' && (
                                        <button
                                            onClick={() => setIsAddModalOpen(true)}
                                            className="bg-[#6B7280] text-white px-4 py-2 rounded-lg hover:bg-[#5B6170] transition-colors flex items-center mx-auto gap-2"
                                        >
                                            <PlusIcon className="h-5 w-5" />
                                            Create First Notification
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredNotifications.map((notification) => (
                                        <div key={notification.id} className="flex items-start gap-4 group">
                                            {/* Card */}
                                            <div className="flex-1 bg-[#7e89c9] rounded-xl p-4 text-white relative shadow-sm hover:shadow-md transition-shadow">
                                                {/* Title Row */}
                                                <div className="mb-3 pr-8">
                                                    <h3 className="text-lg font-bold text-white truncate text-left">
                                                        {notification.title}
                                                    </h3>
                                                </div>

                                                {/* Edit Button (Inside) */}
                                                {user?.role === 'admin' && (
                                                    <button 
                                                        onClick={() => handleOpenEditModal(notification)}
                                                        className="text-white/70 hover:text-white transition-colors p-1 absolute top-4 right-4"
                                                        title="Edit notification"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                )}

                                                <div className="flex items-start gap-4">
                                                    {/* Icon Container */}
                                                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
                                                        {getTypeIcon(notification.type)}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0 pt-1">
                                                        {notification.image && (
                                                            <div className="mb-3">
                                                                <img
                                                                    src={`http://localhost:8000${notification.image}`}
                                                                    alt="Notification"
                                                                    className="max-h-48 rounded-lg object-cover"
                                                                />
                                                            </div>
                                                        )}
                                                        {notification.description && (
                                                            <p className="text-white/90 text-sm mb-3 font-medium text-left">
                                                                {notification.description}
                                                            </p>
                                                        )}

                                                        {/* Metadata */}
                                                        <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 font-medium mb-2">
                                                            <div className="flex items-center gap-1">
                                                                <CalendarIcon className="h-4 w-4" />
                                                                <span>{formatDate(notification.created_at)}</span>
                                                            </div>

                                                            {notification.is_scheduled === 1 && notification.date && (
                                                                <div className="flex items-center gap-1 text-white">
                                                                    <ClockIcon className="h-4 w-4" />
                                                                    <span>Scheduled: {formatDate(notification.date)}</span>
                                                                </div>
                                                            )}

                                                            {notification.nominal && (
                                                                <div className="flex items-center gap-1 font-bold text-white">
                                                                    <CurrencyDollarIcon className="h-4 w-4" />
                                                                    <span>{formatCurrency(notification.nominal)}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Recipients Toggle */}
                                                        {user?.role === 'admin' && (
                                                            <button
                                                                onClick={() => toggleRecipients(notification.id)}
                                                                className="flex items-center gap-2 text-xs text-white/80 hover:text-white mt-2 font-medium transition-colors"
                                                            >
                                                                <UsersIcon className="h-3.5 w-3.5" />
                                                                <span>
                                                                    {expandedNotifications[notification.id] ? 'Hide' : 'Show'} Recipients
                                                                </span>
                                                                {expandedNotifications[notification.id]
                                                                    ? <ChevronUpIcon className="h-3.5 w-3.5" />
                                                                    : <ChevronDownIcon className="h-3.5 w-3.5" />
                                                                }
                                                            </button>
                                                        )}

                                                        {/* Recipients List */}
                                                        {expandedNotifications[notification.id] && user?.role === 'admin' && (
                                                            <div className="mt-3 pt-3 border-t border-white/20">
                                                                {loadingRecipients[notification.id] ? (
                                                                    <div className="flex items-center gap-2 text-sm text-white/80">
                                                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                                                        Loading recipients...
                                                                    </div>
                                                                ) : recipients[notification.id]?.length > 0 ? (
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-2 text-sm text-white/90">
                                                                            <span className="font-medium">{recipients[notification.id].length} recipient(s)</span>
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                                                                            {recipients[notification.id].map((recipient) => (
                                                                                <div
                                                                                    key={recipient.user_id || recipient.id}
                                                                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${recipient.is_read
                                                                                        ? 'bg-green-500/20 border-green-400/30 text-green-50'
                                                                                        : 'bg-white/10 border-white/20 text-white'
                                                                                        }`}
                                                                                    title={recipient.is_read ? 'Read' : 'Unread'}
                                                                                >
                                                                                    <UserIcon className="h-3 w-3" />
                                                                                    <span>{recipient.user_name || `User #${recipient.user_id}`}</span>
                                                                                    {recipient.is_read && (
                                                                                        <span className="text-green-300 text-[10px]">✓</span>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm text-white/60 italic">No recipients assigned to this notification</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Delete Button (Outside) */}
                                            {user?.role === 'admin' && (
                                                <button
                                                    onClick={() => handleDeleteNotification(notification.id)}
                                                    className="mt-6 p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Delete notification"
                                                >
                                                    <TrashIcon className="h-6 w-6" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-8">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-700">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Notification Modal */}
            <AddNotificationModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddNotification}
                loading={addingNotification}
            />

            {/* Edit Notification Modal */}
            <EditNotificationModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingNotification(null);
                }}
                onSubmit={handleEditNotification}
                loading={updatingNotification}
                notification={editingNotification}
            />
        </Layout>
    );
};

export default Notifications;
