import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { notificationService } from '../services';
import { useAuth } from '../context/AuthContext';
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';

const Calendar = () => {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchScheduledNotifications();
    }, [user]);

    const fetchScheduledNotifications = async () => {
        try {
            setLoading(true);
            // Fetch all notifications and filter client-side for now
            // Ideally backend should support filtering by is_scheduled=1
            let data = [];
            if (user?.role === 'admin') {
                const response = await notificationService.getAllNotifications({ page_size: 1000 });
                data = response.notifications || [];
            } else {
                const response = await notificationService.getMyNotifications({ page_size: 1000 }, user?.parent_access || false);
                data = Array.isArray(response) ? response.map(item => item.notification) : [];
            }

            // Filter for scheduled notifications
            const scheduled = data.filter(n => (n.is_scheduled === true || n.is_scheduled === 1) && n.date);
            setNotifications(scheduled);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const isSameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    const getNotificationsForDate = (date) => {
        return notifications.filter(n => {
            const notifDate = new Date(n.date);
            return isSameDay(notifDate, date);
        });
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50/50 border border-gray-100"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayNotifications = getNotificationsForDate(date);
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());

            days.push(
                <div
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={`h-24 border border-gray-100 p-2 cursor-pointer transition-all hover:bg-blue-50 relative
                        ${isSelected ? 'bg-blue-50 ring-2 ring-inset ring-blue-500' : 'bg-white'}
                        ${isToday ? 'bg-blue-50/30' : ''}
                    `}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full
                            ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}
                        `}>
                            {day}
                        </span>
                        {dayNotifications.length > 0 && (
                            <span className="flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        )}
                    </div>

                    <div className="mt-2 space-y-1">
                        {dayNotifications.slice(0, 2).map((notif, idx) => (
                            <div key={idx} className="text-[10px] truncate px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-medium">
                                {notif.title}
                            </div>
                        ))}
                        {dayNotifications.length > 2 && (
                            <div className="text-[10px] text-gray-500 pl-1">
                                +{dayNotifications.length - 2} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    const selectedDateNotifications = getNotificationsForDate(selectedDate);

    return (
        <Layout>
            <div className="flex h-[calc(100vh-7rem)] gap-6">
                {/* Calendar Section */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex gap-2">
                            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                                <ChevronLeftIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md">
                                Today
                            </button>
                            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                                <ChevronRightIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Days Header */}
                    <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 flex-1 overflow-y-auto">
                        {renderCalendarDays()}
                    </div>
                </div>

                {/* Sidebar / Details Section */}
                <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-blue-600" />
                            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            </div>
                        ) : selectedDateNotifications.length > 0 ? (
                            selectedDateNotifications.map(notif => (
                                <div key={notif.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide
                                            ${notif.type === 'event' ? 'bg-purple-100 text-purple-700' :
                                                notif.type === 'assignment' ? 'bg-orange-100 text-orange-700' :
                                                    notif.type === 'payment' ? 'bg-green-100 text-green-700' :
                                                        'bg-blue-100 text-blue-700'
                                            }
                                        `}>
                                            {notif.type}
                                        </span>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <ClockIcon className="h-3 w-3" />
                                            {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-gray-800 text-sm mb-1">{notif.title}</h4>
                                    {notif.description && (
                                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">{notif.description}</p>
                                    )}
                                    {notif.image && (
                                        <img
                                            src={`http://localhost:8000${notif.image}`}
                                            alt="Attachment"
                                            className="w-full h-24 object-cover rounded-md mb-2"
                                        />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p className="text-sm">No events scheduled for this day.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Calendar;
