

import React from 'react';

interface RecordButtonProps {
  sessionStatus: 'idle' | 'recording' | 'paused';
  onPrimaryClick: () => void;
  onStopClick: () => void;
}

const MicrophoneIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
        <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.75 6.75 0 1 1-13.5 0v-1.5a.75.75 0 0 1 .75-.75Z" />
    </svg>
);

const StopIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
    </svg>
);

const PauseIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
    </svg>
);


const RecordButton: React.FC<RecordButtonProps> = ({ sessionStatus, onPrimaryClick, onStopClick }) => {
    const isIdle = sessionStatus === 'idle';
    const isRecording = sessionStatus === 'recording';

    let primaryIcon, primaryClass, primaryText, ariaLabel;

    if (isIdle) {
        primaryIcon = <MicrophoneIcon className="w-8 h-8" />;
        primaryClass = 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:ring-indigo-300';
        primaryText = 'Tap to start booking';
        ariaLabel = 'Start recording';
    } else if (isRecording) {
        primaryIcon = <PauseIcon className="w-8 h-8" />;
        primaryClass = 'bg-red-500 text-white shadow-lg focus:ring-red-300';
        primaryText = 'Listening...';
        ariaLabel = 'Pause recording';
    } else { // isPaused
        primaryIcon = <MicrophoneIcon className="w-8 h-8" />;
        primaryClass = 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:ring-indigo-300';
        primaryText = 'Paused. Tap to resume.';
        ariaLabel = 'Resume recording';
    }

    return (
        <div className="flex flex-col items-center justify-center my-6 h-28">
            <div className="flex items-center justify-center space-x-6 h-20">
                {isIdle ? (
                    <button
                        onClick={onPrimaryClick}
                        className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 ${primaryClass}`}
                        aria-label={ariaLabel}
                    >
                        {primaryIcon}
                    </button>
                ) : (
                    <>
                        <button
                            onClick={onStopClick}
                            className="flex items-center justify-center w-16 h-16 bg-slate-600 text-white rounded-full shadow-md hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-400 transition-all"
                            aria-label="Stop session"
                        >
                            <StopIcon className="w-7 h-7" />
                        </button>
                        <button
                            onClick={onPrimaryClick}
                            className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 ${primaryClass}`}
                            aria-label={ariaLabel}
                        >
                            {isRecording && <span className="absolute h-full w-full rounded-full bg-red-500 animate-ping"></span>}
                            {primaryIcon}
                        </button>
                        {/* Placeholder for symmetry */}
                        <div className="w-16 h-16" />
                    </>
                )}
            </div>
            <p className="mt-4 text-sm font-medium text-slate-600 min-h-[20px]">
                {primaryText}
            </p>
        </div>
    );
};

export default RecordButton;