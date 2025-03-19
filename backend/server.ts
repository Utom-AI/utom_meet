import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { config } from 'dotenv';
import { join } from 'path';

// Initialize dotenv
config({ path: join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = 'https://api.daily.co/v1';

// Type definitions
interface RoomRequest {
  name?: string;
}

interface RoomParams {
  name: string;
}

// Create a new room or get an existing one
app.post('/api/rooms', async (req: Request<{}, {}, RoomRequest>, res: Response) => {
  try {
    const { name } = req.body;
    
    const response = await axios.post(
      `${DAILY_API_URL}/rooms`,
      {
        name: name || `room-${Math.random().toString(36).substr(2, 9)}`,
        properties: {
          enable_screenshare: true,
          enable_chat: true,
          start_video_off: false,
          start_audio_off: false,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DAILY_API_KEY}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Get room details
app.get('/api/rooms/:name', async (req: Request<RoomParams>, res: Response) => {
  try {
    const { name } = req.params;
    
    const response = await axios.get(
      `${DAILY_API_URL}/rooms/${name}`,
      {
        headers: {
          Authorization: `Bearer ${DAILY_API_KEY}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error getting room:', error);
    res.status(500).json({ error: 'Failed to get room details' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 