export interface Person {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  schedule: Meeting[];
}

export interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
}