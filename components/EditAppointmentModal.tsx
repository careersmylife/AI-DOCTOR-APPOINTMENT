import React, { useState, useEffect } from 'react';
import type { Appointment } from '../types';

interface EditAppointmentModalProps {
  appointment: Appointment;
  onSave: (updatedAppointment: Appointment) => void;
  onClose: () => void;
}

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({ appointment, onSave, onClose }) => {
  const [formData, setFormData] = useState<Appointment>(appointment);

  useEffect(() => {
    setFormData(appointment);
  }, [appointment]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in" 
        onClick={onClose}
        aria-labelledby="edit-appointment-title" 
        role="dialog" 
        aria-modal="true"
    >
      <div 
        className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl p-6 w-full max-w-lg animate-scale-in"
        onClick={handleModalContentClick}
      >
        <form onSubmit={handleSubmit}>
          <h2 id="edit-appointment-title" className="text-2xl font-bold text-slate-800 mb-6">Edit Appointment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Patient Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-700">Date</label>
              <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-slate-700">Time</label>
              <input type="text" name="time" id="time" value={formData.time} placeholder="e.g., 10:30 AM" className="mt-1 block w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required />
            </div>
            <div>
              <label htmlFor="doctor" className="block text-sm font-medium text-slate-700">Doctor</label>
              <input type="text" name="doctor" id="doctor" value={formData.doctor} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required />
            </div>
            <div>
              <label htmlFor="clinic" className="block text-sm font-medium text-slate-700">Clinic</label>
              <input type="text" name="clinic" id="clinic" value={formData.clinic} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200/70 text-slate-800 rounded-md hover:bg-slate-300/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-lg shadow-indigo-500/30">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAppointmentModal;
