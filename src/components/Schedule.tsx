import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin } from 'lucide-react';
import type { Meeting } from '../types';

interface ScheduleProps {
  meetings: Meeting[];
}

export function Schedule({ meetings }: ScheduleProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Today's Schedule</h2>
      <div className="space-y-4">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="border-l-4 border-blue-500 pl-4 py-3 hover:bg-gray-50"
          >
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Clock className="w-4 h-4" />
              <span>
                {format(new Date(meeting.startTime), 'h:mm a')} -{' '}
                {format(new Date(meeting.endTime), 'h:mm a')}
              </span>
            </div>
            <h3 className="font-semibold text-lg">{meeting.title}</h3>
            <p className="text-gray-600 mb-2">{meeting.description}</p>
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>{meeting.location}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}