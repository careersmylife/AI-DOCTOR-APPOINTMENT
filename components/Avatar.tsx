import React from 'react';

const UserIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
  </svg>
);

const AiIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M11.47 1.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1-1.06 1.06l-1.72-1.72V7.5h-1.5V4.06L9.53 5.78a.75.75 0 0 1-1.06-1.06l3-3ZM11.25 7.5V15a.75.75 0 0 0 1.5 0V7.5h-1.5Z" />
        <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06L16.44 10.5H7.5v-1.5h8.94L12.97 5.03a.75.75 0 0 1 0-1.06ZM12 15.75a.75.75 0 0 1 .75.75v2.25h1.5a.75.75 0 0 1 0 1.5h-1.5v2.25a.75.75 0 0 1-1.5 0v-2.25h-1.5a.75.75 0 0 1 0-1.5h1.5v-2.25a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    </svg>
);

interface AvatarProps {
  sender: 'user' | 'ai';
}

const Avatar: React.FC<AvatarProps> = ({ sender }) => {
  const isUser = sender === 'user';
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
      ${isUser ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-200 text-slate-700'}`
    }>
      {isUser ? <UserIcon className="w-6 h-6" /> : <AiIcon className="w-6 h-6" />}
    </div>
  );
};

export default Avatar;
