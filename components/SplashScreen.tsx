import React from 'react';

const AppIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 text-indigo-600">
        <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V5.25A.75.75 0 0 1 9 4.5Zm6.75 0a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V5.25a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M2.25 9.75A1.5 1.5 0 0 1 3.75 8.25h16.5a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5v-9ZM12 11.25a.75.75 0 0 0-.75.75v3a.75.75 0 0 0 1.5 0v-3a.75.75 0 0 0-.75-.75Z" clipRule="evenodd" />
        <path d="M2.25 3.75c0-1.036.84-1.875 1.875-1.875h15.75c1.035 0 1.875.84 1.875 1.875v3.188c-.53-.26-1.102-.413-1.712-.413H5.438c-.61 0-1.182.153-1.712.413V3.75Z" />
    </svg>
);


const SplashScreen: React.FC = () => {
    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-transparent">
            <div className="animate-scale-in">
                <AppIcon />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mt-6 animate-fade-in delay-200">
                AI Appointment Booker
            </h1>
        </div>
    );
};

export default SplashScreen;
