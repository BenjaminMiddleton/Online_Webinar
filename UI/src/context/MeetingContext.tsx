import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MinutesData } from '../api/apiService';

interface MeetingContextProps {
  meetingData: MinutesData | null;
  setMeetingData: (data: MinutesData | null) => void;
}

const defaultMeetingData: MinutesData = {
  title: "Meeting title",
  duration: "00:00",
  summary: "",
  action_points: [],
  transcription: "",
  speakers: []
};

const MeetingContext = createContext<MeetingContextProps>({
  meetingData: defaultMeetingData,
  setMeetingData: () => {}
});

export const useMeetingContext = () => useContext(MeetingContext);

export const MeetingProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [meetingData, setMeetingData] = useState<MinutesData | null>(defaultMeetingData);

  return (
    <MeetingContext.Provider value={{ meetingData, setMeetingData }}>
      {children}
    </MeetingContext.Provider>
  );
};
