import React from 'react';

const LoginLeftPanel = () => {
    return (
        <div className="w-1/2 bg-[#F5F6FA] flex flex-col items-center justify-center text-center p-6">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">Welcome!</h2>
            <div className="flex items-center justify-center gap-6">
                <img
                    src="src\assets\Lemuel_Logo.png"
                    alt="Logo BINUS"
                    className="h-14 object-contain"
                />
                <img
                    src="src\assets\Binus_Logo.png"
                    alt="Logo BINUS"
                    className="h-14 object-contain"
                />
            </div>
        </div>
    );
};

export default LoginLeftPanel;