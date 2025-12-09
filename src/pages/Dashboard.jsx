import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/AuthContext";
import { bannerService } from "../services";
import { ClockIcon } from "@heroicons/react/24/outline";

const Dashboard = () => {
    const { user } = useAuth();
    const [banners, setBanners] = useState([]);
    const [activities] = useState([
        {
            id: 1,
            date: "31",
            title: "Meeting with the VC",
            link: "https://zoom.com/abc",
            status: "Due soon",
        },
        {
            id: 2,
            date: "04",
            title: "Meeting with the J...",
            link: "https://zoom.com/def",
            status: "Upcoming",
        },
        {
            id: 3,
            date: "12",
            title: "Class 8 middle sess...",
            link: "https://zoom.com/ghi",
            status: "Upcoming",
        },
        {
            id: 4,
            date: "16",
            title: "Send Mr Ayo class...",
            link: "Send Document via email",
            status: "Upcoming",
        },
    ]);

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

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `http://localhost:8000${url}`;
    };

    return (
        <Layout>
            <div className="px-0 py-0">
                {/* Header */}
                <h1 className="text-2xl font-semibold text-gray-800 mb-8">
                    Hi, {user?.role === "admin" ? "Admin" : user?.first_name || "User"}
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT SECTION */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Upcoming Activities
                            </h2>
                            <button className="px-4 py-1.5 bg-black text-white text-sm rounded-lg shadow hover:bg-gray-900 transition">
                                See all
                            </button>
                        </div>

                        <div className="space-y-4">
                            {activities.map((a) => (
                                <div
                                    key={a.id}
                                    className="flex items-center justify-between bg-[#EEF1FD] rounded-lg px-5 py-4 hover:bg-[#E3E7FB] transition"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-[#C9D3F7] text-[#2F2F4F] font-bold w-12 h-12 flex items-center justify-center rounded-lg text-lg">
                                            {a.date}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">
                                                {a.title}
                                            </p>
                                            <a
                                                href={a.link}
                                                className="text-xs text-blue-500 hover:underline truncate block"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                {a.link}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-gray-500 flex items-center">
                                            <ClockIcon className="h-4 w-4 mr-1" /> 10 A.M. - 11 A.M.
                                        </span>
                                        <span
                                            className={`text-xs font-medium ${a.status === "Due soon"
                                                ? "text-red-500"
                                                : "text-orange-500"
                                                }`}
                                        >
                                            {a.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT SECTION */}
                    <div className="space-y-6">
                        {/* Banners Section */}
                        {banners.length > 0 ? (
                            banners.map((banner) => (
                                <div key={banner.id} className="bg-white rounded-2xl shadow-md overflow-hidden relative">
                                    <div className="px-6 py-3 border-b">
                                        <h2 className="text-lg font-semibold text-gray-800">
                                            {banner.description || "Information"}
                                        </h2>
                                    </div>
                                    <div className="relative">
                                        <img
                                            src={getImageUrl(banner.image_url)}
                                            alt={banner.description || "Banner"}
                                            className="w-full h-44 object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/400x200?text=Image+Error';
                                            }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-2xl shadow-md p-6 text-center text-gray-500">
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
