import React, { useState } from 'react';
import { FaceRecognition } from './components/FaceRecognition';
import { Schedule } from './components/Schedule';
import { Brain } from 'lucide-react';
import type { Person } from './types';

// Sample data - in a real app, this would come from a backend
const samplePerson: Person = {
  id: '1',
  name: 'John Doe',
  role: 'Software Engineer',
  imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80',
  schedule: [
    {
      id: '1',
      title: 'Team Standup',
      startTime: '2024-03-15T09:00:00',
      endTime: '2024-03-15T09:30:00',
      description: 'Daily team sync meeting',
      location: 'Conference Room A'
    },
    {
      id: '2',
      title: 'Project Review',
      startTime: '2024-03-15T11:00:00',
      endTime: '2024-03-15T12:00:00',
      description: 'Q1 project progress review',
      location: 'Virtual Meeting'
    }
  ]
};

function App() {
  const [recognizedPerson] = useState<Person | null>(samplePerson);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              AI Face Recognition Scheduler
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold mb-4">Face Recognition</h2>
            <FaceRecognition />
          </div>

          <div>
            {recognizedPerson ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={recognizedPerson.imageUrl}
                      alt={recognizedPerson.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h2 className="text-xl font-bold">{recognizedPerson.name}</h2>
                      <p className="text-gray-600">{recognizedPerson.role}</p>
                    </div>
                  </div>
                </div>
                <Schedule meetings={recognizedPerson.schedule} />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <p className="text-gray-600">
                  No person recognized. Please start the camera and look directly at it.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;