const API_URL = 'http://localhost:5000/api';

interface MeetingResponse {
  title: string;
  description: string;
  duration: number;
  agenda: string[];
  attendees: string[];
}

export const processWithAI = async (userInput: string): Promise<MeetingResponse> => {
  try {
    console.log('Sending request to process description:', userInput);
    
    if (!userInput || userInput.trim() === '') {
      throw new Error('Meeting description cannot be empty');
    }

    const requestBody = { description: userInput };
    console.log('Request body:', requestBody);
    
    const response = await fetch(`${API_URL}/process-description`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received response:', data);
    return data;
  } catch (error) {
    console.error('Error in processWithAI:', error);
    throw error;
  }
};

export const createMeeting = async (meetingDetails: {
  title: string;
  description: string;
  duration: number;
  agenda: string[];
  attendees: string[];
}): Promise<{ url: string }> => {
  try {
    const response = await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: meetingDetails.title.toLowerCase().replace(/\s+/g, '-'),
        meeting_name: meetingDetails.title,
        description: meetingDetails.description,
        duration: meetingDetails.duration,
        agenda: meetingDetails.agenda,
        attendees: meetingDetails.attendees,
        start_time: Math.floor(Date.now() / 1000),
        end_time: Math.floor(Date.now() / 1000) + (meetingDetails.duration * 60)
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create meeting');
    }

    const data = await response.json();
    console.log('Daily.co meeting created:', data);

    if (!data.url) {
      throw new Error('Meeting URL not received from server');
    }

    return { url: data.url };
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
}; 