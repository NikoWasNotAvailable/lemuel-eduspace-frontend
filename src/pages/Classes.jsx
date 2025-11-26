import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';

const Classes = () => {
    const navigate = useNavigate();

    // Redirect to new structured navigation
    useEffect(() => {
        navigate('/regions', { replace: true });
    }, [navigate]);

    return (
        <Layout>
            <div className="flex bg-white min-h-[calc(100vh-4rem)]">
                <div className="flex-1 transition-all duration-300">
                    <div className="p-8">
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                            <span className="ml-3 text-gray-600">Redirecting to regions...</span>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Classes;