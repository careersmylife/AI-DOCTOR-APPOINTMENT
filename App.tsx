

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import type { FunctionDeclaration, LiveServerMessage, LiveSession, FunctionCall, GenerateContentResponse, Content } from '@google/genai';
import { Appointment, ChatMessage, Language } from './types';
import { decode, decodeAudioData, createBlob } from './utils/audioUtils';
import Header from './components/Header';
import LanguageSelector from './components/LanguageSelector';
import RecordButton from './components/RecordButton';
import ConversationView from './components/ConversationView';
import AppointmentsTable from './components/AppointmentsTable';
import EditAppointmentModal from './components/EditAppointmentModal';
import SplashScreen from './components/SplashScreen';
import ChatInput from './components/ChatInput';
import ConfirmationModal from './components/ConfirmationModal';

// This application runs in a sandboxed browser environment that blocks network
// requests to `localhost`. Attempting to use a `localhost` URL will result in a
// "Failed to fetch" error. To resolve this, a public webhook endpoint is required.
// You can create a free one at services like webhook.site.
// IMPORTANT: The URL below is a placeholder. Please replace it with your own public endpoint.
const WEBHOOK_URL = 'https://webhook.site/c2c8f8a1-3a3f-4e0b-8d1a-4c9f1c8e7b9e';

const sendToWebhook = async (data: Appointment, eventType: 'appointment_created' | 'appointment_updated' | 'appointment_deleted') => {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventType,
        payload: data,
      }),
    });
    if (!response.ok) {
        console.error('Webhook response not OK:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Failed to send data to webhook:', error);
  }
};


const bookAppointmentFunctionDeclaration: FunctionDeclaration = {
  name: 'bookAppointment',
  parameters: {
    type: Type.OBJECT,
    description: 'Validates and books a doctor appointment with the provided details.',
    properties: {
      name: { type: Type.STRING, description: 'Full name of the patient.' },
      email: { type: Type.STRING, description: 'Email address of the patient.' },
      date: { type: Type.STRING, description: 'The desired date of the appointment, e.g., "2024-08-15".' },
      time: { type: Type.STRING, description: 'The desired time of the appointment, e.g., "10:30 AM".' },
      doctor: { type: Type.STRING, description: 'The name of the doctor.' },
      clinic: { type: Type.STRING, description: 'The location or name of the clinic.' },
    },
    required: ['name', 'email', 'date', 'time', 'doctor', 'clinic'],
  },
};

const editAppointmentFunctionDeclaration: FunctionDeclaration = {
  name: 'editAppointment',
  description: "Updates an existing doctor appointment with new details. To identify the appointment, you must provide the patient's name. You can also provide the doctor's name or the current appointment date for more specific matching.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      patientName: { type: Type.STRING, description: "The name of the patient whose appointment is to be edited." },
      doctorName: { type: Type.STRING, description: "(Optional) The name of the doctor for the appointment to be edited, for more specific matching." },
      currentDate: { type: Type.STRING, description: "(Optional) The current date of the appointment to be edited (YYYY-MM-DD), for more specific matching." },
      newName: { type: Type.STRING, description: "(Optional) The new name for the patient." },
      newEmail: { type: Type.STRING, description: "(Optional) The new email address for the patient." },
      newDate: { type: Type.STRING, description: "(Optional) The new date for the appointment, e.g., '2024-08-16'." },
      newTime: { type: Type.STRING, description: "(Optional) The new time for the appointment, e.g., '03:00 PM'." },
      newDoctor: { type: Type.STRING, description: "(Optional) The new doctor's name." },
      newClinic: { type: Type.STRING, description: "(Optional) The new clinic location or name." },
    },
    required: ['patientName'],
  },
};

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [sessionStatus, setSessionStatus] = useState<'idle' | 'recording' | 'paused'>('idle');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [conversation, setConversation] = useState<ChatMessage[]>([]);
    const [language, setLanguage] = useState<Language>(Language.EN);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [deletingAppointmentId, setDeletingAppointmentId] = useState<string | null>(null);
    
    const [liveUserTranscript, setLiveUserTranscript] = useState('');
    const [liveAiTranscript, setLiveAiTranscript] = useState('');

    const sessionRef = useRef<LiveSession | null>(null);
    const audioStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const appointmentsRef = useRef(appointments);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        appointmentsRef.current = appointments;
    }, [appointments]);

    const userTranscriptRef = useRef('');
    const aiTranscriptRef = useRef('');

    const processFunctionCall = (fc: FunctionCall): string => {
        if (fc.name === 'bookAppointment') {
            const args = fc.args as Omit<Appointment, 'id'>;
            const newAppointment: Appointment = { ...args, id: new Date().toISOString() };
            setAppointments(prev => [...prev, newAppointment]);
            sendToWebhook(newAppointment, 'appointment_created');
            return "Appointment booked successfully. A confirmation email has been sent.";
        } else if (fc.name === 'editAppointment') {
            const args = fc.args as any;
            const matchingAppointments = appointmentsRef.current.filter(appt => {
                let matches = true;
                if (args.patientName && appt.name.toLowerCase() !== args.patientName.toLowerCase()) matches = false;
                if (args.doctorName && appt.doctor.toLowerCase() !== args.doctorName.toLowerCase()) matches = false;
                if (args.currentDate && appt.date !== args.currentDate) matches = false;
                return matches;
            });

            if (matchingAppointments.length === 0) {
                return "No appointment found for that patient. Please ask the user to confirm the name and try again.";
            } else if (matchingAppointments.length > 1) {
                return "Multiple appointments found. Please ask the user for more details to identify the correct one, such as the doctor's name or the appointment date.";
            } else {
                const appointmentToUpdate = matchingAppointments[0];
                const updatedAppointment: Appointment = {
                    ...appointmentToUpdate,
                    name: args.newName || appointmentToUpdate.name,
                    email: args.newEmail || appointmentToUpdate.email,
                    date: args.newDate || appointmentToUpdate.date,
                    time: args.newTime || appointmentToUpdate.time,
                    doctor: args.newDoctor || appointmentToUpdate.doctor,
                    clinic: args.newClinic || appointmentToUpdate.clinic,
                };
                
                setAppointments(prev => prev.map(appt => appt.id === appointmentToUpdate.id ? updatedAppointment : appt));
                sendToWebhook(updatedAppointment, 'appointment_updated');
                return `Appointment for ${args.patientName} updated successfully. Please confirm the new details with the user.`;
            }
        }
        return "Function not recognized.";
    };
    
    const stopSession = useCallback(() => {
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(track => track.stop());
            audioStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
         if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
          outputAudioContextRef.current.close();
          outputAudioContextRef.current = null;
        }
        setSessionStatus('idle');
    }, []);

    const handleResetConversation = () => {
        setConversation([]);
        setLiveUserTranscript('');
        setLiveAiTranscript('');
        userTranscriptRef.current = '';
        aiTranscriptRef.current = '';
    }

    const startSession = useCallback(async () => {
        if (!process.env.API_KEY) {
            alert("API_KEY environment variable not set.");
            return;
        }
        setSessionStatus('recording');
        handleResetConversation();
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioStreamRef.current = stream;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            let nextStartTime = 0;
            const outputNode = outputAudioContextRef.current.createGain();
            outputNode.gain.value = 1.5; // Increase AI voice volume
            outputNode.connect(outputAudioContextRef.current.destination);

            // Play a start beep
            const oscillator = outputAudioContextRef.current.createOscillator();
            const gainNode = outputAudioContextRef.current.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(outputAudioContextRef.current.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, outputAudioContextRef.current.currentTime);
            gainNode.gain.setValueAtTime(0.1, outputAudioContextRef.current.currentTime);
            oscillator.start(outputAudioContextRef.current.currentTime);
            oscillator.stop(outputAudioContextRef.current.currentTime + 0.1);

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    tools: [{ functionDeclarations: [bookAppointmentFunctionDeclaration, editAppointmentFunctionDeclaration] }],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
                        },
                    },
                    systemInstruction: `You are an AI assistant for booking doctor's appointments. Your process for booking or editing an appointment MUST follow these steps strictly:
1.  **Gather Information**: Collect all necessary details from the user (e.g., patient name, date, time, changes for an edit).
2.  **Summarize and Confirm**: Once you have all the details, you MUST summarize them back to the user and ask for their explicit confirmation before proceeding. For example: "Okay, I have an appointment for Jane Doe on September 1st, 2024 at 3 PM with Dr. Smith. Is that correct and should I finalize it?".
3.  **Wait for Confirmation**: Do not proceed until the user gives a clear positive confirmation (e.g., "Yes, that's correct", "Confirm", "Go ahead").
4.  **Finalize**: Only after receiving the user's confirmation, you are allowed to call the 'bookAppointment' or 'editAppointment' function.
**NEVER call a function before getting explicit confirmation from the user.**

**CRITICAL LANGUAGE CONSTRAINT: You must ONLY speak English or Urdu.** Under NO circumstances should you use Hindi or any other language. If the user speaks another language, politely ask them to use English or Urdu.
You MUST respond in the same language the user is speaking. The current user's preferred language is ${language === Language.EN ? 'English' : 'Urdu'}.`,
                },
                callbacks: {
                    onopen: () => {
                        const source = audioContextRef.current!.createMediaStreamSource(stream);
                        sourceNodeRef.current = source;
                        scriptProcessorRef.current = audioContextRef.current!.createScriptProcessor(4096, 1, 1);

                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromise.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(audioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            userTranscriptRef.current += message.serverContent.inputTranscription.text;
                            setLiveUserTranscript(userTranscriptRef.current);
                        }
                        if (message.serverContent?.outputTranscription) {
                            aiTranscriptRef.current += message.serverContent.outputTranscription.text;
                            setLiveAiTranscript(aiTranscriptRef.current);
                        }
                        
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            nextStartTime = Math.max(nextStartTime, outputAudioContextRef.current.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                            const source = outputAudioContextRef.current.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode);
                            source.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                        }

                        if (message.toolCall) {
                            for (const fc of message.toolCall.functionCalls) {
                                const resultMessage = processFunctionCall(fc);
                                sessionPromise.then(session => {
                                  session.sendToolResponse({
                                      functionResponses: { id: fc.id, name: fc.name, response: { result: resultMessage } }
                                  });
                                });
                            }
                        }

                        if (message.serverContent?.turnComplete) {
                            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const userText = userTranscriptRef.current.trim();
                            const aiText = aiTranscriptRef.current.trim();

                            const newMessages: ChatMessage[] = [];
                            if (userText) {
                                newMessages.push({ id: crypto.randomUUID(), sender: 'user', text: userText, timestamp });
                            }
                            if (aiText) {
                                newMessages.push({ id: crypto.randomUUID(), sender: 'ai', text: aiText, timestamp });
                            }
                            
                            if (newMessages.length > 0) {
                                setConversation(prev => [...prev, ...newMessages]);
                            }

                            userTranscriptRef.current = '';
                            aiTranscriptRef.current = '';
                            setLiveUserTranscript('');
                            setLiveAiTranscript('');
                        }
                    },
                    onclose: () => {
                        stopSession();
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        alert(`An error occurred: ${e.message}. Please try again.`);
                        stopSession();
                    },
                },
            });
            sessionRef.current = await sessionPromise;
        } catch (error) {
            console.error("Failed to start session:", error);
            alert("Could not start the microphone. Please grant permission and try again.");
            setSessionStatus('idle');
        }
    }, [language, stopSession]);

    const pauseRecording = useCallback(() => {
        if (sessionStatus !== 'recording' || !scriptProcessorRef.current) return;
        scriptProcessorRef.current.disconnect();
        setSessionStatus('paused');
    }, [sessionStatus]);

    const resumeRecording = useCallback(() => {
        if (sessionStatus !== 'paused' || !scriptProcessorRef.current || !sourceNodeRef.current || !audioContextRef.current) return;
        sourceNodeRef.current.connect(scriptProcessorRef.current);
        scriptProcessorRef.current.connect(audioContextRef.current.destination);
        setSessionStatus('recording');
    }, [sessionStatus]);
    
    const handlePrimaryClick = () => {
        if (sessionStatus === 'idle') {
            startSession();
        } else if (sessionStatus === 'recording') {
            pauseRecording();
        } else if (sessionStatus === 'paused') {
            resumeRecording();
        }
    };

    const handleSendMessage = async (message: string) => {
      if (!process.env.API_KEY) {
        alert("API_KEY environment variable not set.");
        return;
      }
      setIsGenerating(true);
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newUserMessage: ChatMessage = { id: crypto.randomUUID(), sender: 'user', text: message, timestamp };
      
      const currentConversation = [...conversation, newUserMessage];
      setConversation(currentConversation);

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const contents: Content[] = currentConversation.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                tools: [{ functionDeclarations: [bookAppointmentFunctionDeclaration, editAppointmentFunctionDeclaration] }],
                systemInstruction: `You are a text-based AI assistant for booking doctor's appointments. Your process for booking or editing an appointment MUST follow these steps strictly:
1.  **Gather Information**: Collect all necessary details from the user (e.g., patient name, email, date, time for a new appointment; changes for an edit).
2.  **Summarize and Confirm**: Once you have all the details, you MUST summarize them back to the user in a clear list and ask for their explicit confirmation before proceeding. For example: "Before I finalize, please confirm the details: [list details]. Is this correct?".
3.  **Wait for Confirmation**: Do not proceed until the user gives a clear positive confirmation (e.g., "Yes", "Correct", "Looks good").
4.  **Finalize**: Only after receiving the user's confirmation, you are allowed to call the 'bookAppointment' or 'editAppointment' function.
**NEVER call a function before getting explicit confirmation from the user.**`,
            },
        });
        
        const newAiMessages: ChatMessage[] = [];
        const aiTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (response.functionCalls) {
            const resultMessages = response.functionCalls.map(processFunctionCall);
            resultMessages.forEach(text => {
                if(text) newAiMessages.push({ id: crypto.randomUUID(), sender: 'ai', text, timestamp: aiTimestamp });
            });
        }
        
        const aiText = response.text?.trim();
        if (aiText) {
            newAiMessages.push({ id: crypto.randomUUID(), sender: 'ai', text: aiText, timestamp: aiTimestamp });
        }

        if (newAiMessages.length > 0) {
            setConversation(prev => [...prev, ...newAiMessages]);
        }

      } catch(e) {
        console.error("Failed to send message:", e);
        const errorMessage: ChatMessage = { id: crypto.randomUUID(), sender: 'ai', text: "Sorry, I encountered an error. Please try again.", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setConversation(prev => [...prev, errorMessage]);
      } finally {
        setIsGenerating(false);
      }
    };

    const handleOpenEditModal = (appointment: Appointment) => {
        setEditingAppointment(appointment);
    };

    const handleCloseEditModal = () => {
        setEditingAppointment(null);
    };

    const handleUpdateAppointment = (updatedAppointment: Appointment) => {
        setAppointments(prevAppointments =>
            prevAppointments.map(appt =>
                appt.id === updatedAppointment.id ? updatedAppointment : appt
            )
        );
        sendToWebhook(updatedAppointment, 'appointment_updated');
        setEditingAppointment(null);
    };

    const handleDeleteAppointment = (id: string) => {
        setDeletingAppointmentId(id);
    };
    
    const confirmDeleteAppointment = () => {
        if (!deletingAppointmentId) return;
        const appointmentToDelete = appointments.find(appt => appt.id === deletingAppointmentId);
        if (appointmentToDelete) {
            setAppointments(prev => prev.filter(appt => appt.id !== deletingAppointmentId));
            sendToWebhook(appointmentToDelete, 'appointment_deleted');
        }
        setDeletingAppointmentId(null);
    };
    
    if (isLoading) {
        return <SplashScreen />;
    }

    const isSessionActive = sessionStatus !== 'idle';

    return (
        <div className="min-h-screen animate-fade-in">
            <Header />
            <main className="max-w-7xl mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white/30 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 p-6 animate-fade-in-up">
                        <h2 className="text-2xl font-bold mb-2 text-slate-800">Voice & Text Agent</h2>
                        <p className="text-sm text-slate-600 mb-4">Select language and talk, or type your message below.</p>
                        <LanguageSelector selectedLanguage={language} onSelectLanguage={setLanguage} isRecording={isSessionActive} />
                        <ConversationView messages={conversation} liveUserTranscript={liveUserTranscript} liveAiTranscript={liveAiTranscript} onReset={handleResetConversation} isRecording={isSessionActive}/>
                        <ChatInput onSendMessage={handleSendMessage} disabled={isSessionActive} isGenerating={isGenerating} />
                        <RecordButton sessionStatus={sessionStatus} onPrimaryClick={handlePrimaryClick} onStopClick={stopSession} />
                    </div>
                    <div className="bg-white/30 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 p-6 animate-fade-in-up delay-200">
                        <AppointmentsTable appointments={appointments} onEdit={handleOpenEditModal} onDelete={handleDeleteAppointment} />
                    </div>
                </div>
            </main>
            {editingAppointment && (
                <EditAppointmentModal
                    appointment={editingAppointment}
                    onSave={handleUpdateAppointment}
                    onClose={handleCloseEditModal}
                />
            )}
            <ConfirmationModal
                isOpen={!!deletingAppointmentId}
                onClose={() => setDeletingAppointmentId(null)}
                onConfirm={confirmDeleteAppointment}
                title="Confirm Deletion"
                message="Are you sure you want to delete this appointment?"
            />
        </div>
    );
};

export default App;