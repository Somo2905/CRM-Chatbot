import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '../ui/button';

export function TimeSlots({ slots }) {
  const [selectedSlot, setSelectedSlot] = useState(null);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b">
        <h3 className="font-semibold text-sm text-gray-900">Available Time Slots</h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => setSelectedSlot(slot.id)}
              className={`
                p-4 rounded-lg border-2 transition-all text-left
                ${selectedSlot === slot.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-gray-900">
                  {new Date(slot.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{slot.time}</span>
              </div>
            </button>
          ))}
        </div>

        {selectedSlot && (
          <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
            Confirm Appointment
          </Button>
        )}
      </div>
    </div>
  );
}
