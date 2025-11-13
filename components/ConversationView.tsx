import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import Avatar from './Avatar';

interface ConversationViewProps {
  messages: ChatMessage[];
  liveUserTranscript: string;
  liveAiTranscript: string;
  onReset: () => void;
  isRecording: boolean;
}

const ResetIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0m0 0c1.863-1.863 1.863-4.891 0-6.754M21.015 10.356c-1.863-1.863-4.891-1.863-6.754 0m0 0-3.181-3.183m0 0h-4.992m4.992 0v4.992" />
    </svg>
);


const ConversationView: React.FC<ConversationViewProps> = ({ messages, liveUserTranscript, liveAiTranscript, onReset, isRecording }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, liveUserTranscript, liveAiTranscript]);

  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.sender === 'user';
    return (
      <div className={`flex w-full items-end gap-3 animate-message-in ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && <Avatar sender="ai" />}
        <div className={`flex flex-col max-w-xs md:max-w-md lg:max-w-lg ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`px-4 py-3 shadow-md ${isUser 
                ? 'bg-indigo-600 text-white rounded-t-2xl rounded-bl-2xl' 
                : 'bg-white text-slate-700 rounded-t-2xl rounded-br-2xl'}`}
          >
            <p className="text-sm">{message.text}</p>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 px-1">{message.timestamp}</p>
        </div>
        {isUser && <Avatar sender="user" />}
      </div>
    );
  };
  
  const LiveTranscriptBubble: React.FC<{ transcript: string; sender: 'user' | 'ai' }> = ({ transcript, sender }) => {
    if (!transcript) return null;
    const isUser = sender === 'user';
    return (
        <div className={`flex w-full items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && <Avatar sender="ai" />}
             <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 shadow-md opacity-80 ${isUser 
                ? 'bg-indigo-400 text-white rounded-t-2xl rounded-bl-2xl' 
                : 'bg-slate-100 text-slate-600 rounded-t-2xl rounded-br-2xl'}`}
            >
                <p className="italic text-sm">{transcript}</p>
            </div>
            {isUser && <Avatar sender="user" />}
        </div>
    );
  };

  return (
    <div className="relative">
      <button 
          onClick={onReset} 
          disabled={isRecording}
          className="absolute top-2 right-2 z-10 p-1.5 text-slate-500 rounded-full hover:bg-black/10 hover:text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Reset conversation"
      >
          <ResetIcon className="w-5 h-5" />
      </button>
      <div className="w-full h-96 bg-slate-100 rounded-lg p-4 overflow-y-auto flex flex-col space-y-4">
        {messages.length === 0 && !liveUserTranscript && (
          <div className="flex-grow flex items-center justify-center">
              <p className="text-slate-500">Your conversation will appear here.</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <LiveTranscriptBubble transcript={liveUserTranscript} sender="user" />
        <LiveTranscriptBubble transcript={liveAiTranscript} sender="ai" />
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
};

export default ConversationView;