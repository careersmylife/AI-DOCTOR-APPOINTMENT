import React from 'react';
import type { Appointment } from '../types';

interface AppointmentsTableProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
}

const AppointmentsTable: React.FC<AppointmentsTableProps> = ({ appointments, onEdit, onDelete }) => {
  return (
    <div className="w-full h-full">
      <h2 className="text-2xl font-bold mb-4 text-slate-800">Booked Appointments</h2>
      <div className="overflow-auto h-[calc(100%-40px)]">
        {appointments.length === 0 ? (
          <div className="text-center py-8 bg-black/10 rounded-md h-full flex items-center justify-center">
            <p className="text-slate-500">No appointments booked yet.</p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="sticky top-0 bg-white/30 backdrop-blur-xl">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Patient</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Doctor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Clinic</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-transparent">
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="border-b border-white/20 hover:bg-black/10 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {appointment.name}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                    {appointment.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                    {appointment.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                    {appointment.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{appointment.doctor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{appointment.clinic}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <button 
                      onClick={() => onEdit(appointment)}
                      className="text-indigo-600 hover:text-indigo-800 transition-colors font-semibold"
                      aria-label={`Edit appointment for ${appointment.name}`}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => onDelete(appointment.id)}
                      className="text-red-600 hover:text-red-800 transition-colors font-semibold ml-4"
                      aria-label={`Delete appointment for ${appointment.name}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AppointmentsTable;