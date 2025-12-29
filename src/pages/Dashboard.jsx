import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/AuthContext";
import { bannerService, notificationService } from "../services";
import { ClockIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const Dashboard = () => {
    const { user } = useAuth();
    const [banners, setBanners] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    // Fetch Banners
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const data = await bannerService.getMyBanners();
                setBanners(data);
            } catch (err) {
                console.error("Error fetching banners:", err);
            }
        };

        if (user) {
            fetchBanners();
        }
    }, [user]);

    // Fetch Upcoming Events (Notifications)
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                let data = [];
                if (user?.role === 'admin') {
                    const response = await notificationService.getAllNotifications({ page_size: 100 });
                    data = response.notifications || [];
                } else {
                    const response = await notificationService.getMyNotifications({ page_size: 100 });
                    data = Array.isArray(response) ? response.map(item => item.notification) : [];
                }

                // Filter for scheduled events in the future
                const now = new Date();
                const events = data
                    .filter(n => (n.is_scheduled === true || n.is_scheduled === 1) && n.date && new Date(n.date) >= now)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, 5); // Take top 5

                setUpcomingEvents(events);
            } catch (err) {
                console.error("Error fetching events:", err);
            }
        };

        if (user) {
            fetchEvents();
        }
    }, [user]);

    // Banner Slideshow Timer
    useEffect(() => {
        if (banners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
        }, 5000); // 5 seconds

        return () => clearInterval(interval);
    }, [banners.length]);

    const nextBanner = () => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    };

    const prevBanner = () => {
        setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `http://localhost:8000${url}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            day: date.getDate(),
            month: date.toLocaleString('default', { month: 'short' }),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    };

    return (
        <Layout>
            <div className="px-0 py-10">
                {/* Header */}
                {/* <h1 className="text-2xl font-semibold text-gray-800 mb-8">
                    Hi, {user?.role === "admin" ? "Admin" : user?.first_name || "User"}
                </h1> */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT SECTION - Upcoming Activities */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Upcoming Activities
                            </h2>
                            <Link to="/calendar" className="px-4 py-1.5 bg-black text-white text-sm rounded-lg shadow hover:bg-gray-900 transition">
                                See all
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map((event) => {
                                    const { day, month, time } = formatDate(event.date);
                                    return (
                                        <div
                                            key={event.id}
                                            className="flex items-center justify-between bg-[#EEF1FD] rounded-lg px-5 py-4 hover:bg-[#E3E7FB] transition"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-[#C9D3F7] text-[#2F2F4F] font-bold w-12 h-12 flex flex-col items-center justify-center rounded-lg text-sm leading-tight">
                                                    <span className="text-lg">{day}</span>
                                                    <span className="text-[10px] uppercase">{month}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {event.title}
                                                    </p>
                                                    {event.description && (
                                                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                                            {event.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-gray-500 flex items-center">
                                                    <ClockIcon className="h-4 w-4 mr-1" /> {time}
                                                </span>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1
                                                    ${event.type === 'event' ? 'bg-purple-100 text-purple-700' :
                                                        event.type === 'assignment' ? 'bg-orange-100 text-orange-700' :
                                                            event.type === 'payment' ? 'bg-green-100 text-green-700' :
                                                                'bg-blue-100 text-blue-700'
                                                    }
                                                `}>
                                                    {event.type}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No upcoming activities scheduled.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SECTION - Banners Slideshow */}
                    <div className="space-y-6">
                        {banners.length > 0 ? (
                            <div className="bg-white rounded-2xl shadow-md overflow-hidden relative group h-64">
                                {/* Banner Image */}
                                <div className="relative h-full w-full">
                                    <img
                                        src={getImageUrl(banners[currentBannerIndex].image_url)}
                                        alt={banners[currentBannerIndex].description || "Banner"}
                                        className="w-full h-full object-cover transition-opacity duration-500"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/400x200?text=Image+Error';
                                        }}
                                    />
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                                    {/* Description */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                        <h2 className="text-lg font-semibold truncate">
                                            {banners[currentBannerIndex].description || "Information"}
                                        </h2>
                                    </div>
                                </div>

                                {/* Navigation Arrows */}
                                {banners.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevBanner}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronLeftIcon className="h-6 w-6" />
                                        </button>
                                        <button
                                            onClick={nextBanner}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronRightIcon className="h-6 w-6" />
                                        </button>

                                        {/* Dots */}
                                        <div className="absolute bottom-2 right-4 flex space-x-1.5">
                                            {banners.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentBannerIndex(idx)}
                                                    className={`w-2 h-2 rounded-full transition-colors ${idx === currentBannerIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/80'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-md p-6 text-center text-gray-500 h-64 flex items-center justify-center">
                                No banners available for your region.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
