# Utom Meet - Video Meeting Platform

A feature-rich video meeting platform built with Daily.co, Flask, and React. This platform supports automated meeting scheduling, cloud recording, and intelligent meeting summaries.

## Features

### Core Functionality
- Instant video meetings with customizable settings
- AI-powered meeting description processing
- Automated meeting scheduling and organization
- Real-time chat during meetings
- Screen sharing capabilities
- Support for up to 20 participants per meeting

### Recording System
- Automatic cloud recording of meetings
- High-quality recording settings (1920x1080, 30fps)
- Unique ID system for each recording
- Recording status tracking (pending, recording, completed, failed, deleted)
- Automatic S3 storage integration
- Recording metadata management
- Automatic cleanup of old recordings (configurable retention period)

### AI Integration
- OpenAI GPT-4 powered meeting description processing
- Automatic meeting structure generation
- Intelligent agenda creation
- Relevant attendee suggestions
- Meeting duration optimization

## Technical Stack

### Backend (Flask)
- Python 3.x
- Flask web framework
- SQLite for database
- Daily.co API integration
- OpenAI API integration
- AWS S3 for storage
- Custom queue management system

### Frontend (React)
- React.js
- Daily.co React components
- Modern UI/UX design
- TypeScript support

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd Utom_Meet
```

2. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Set up environment variables:
Create a `.env` file in the backend directory with:
```
DAILY_API_KEY=your_daily_api_key
OPENAI_API_KEY=your_openai_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
S3_BUCKET_NAME=your_bucket_name
CORS_ORIGIN=http://localhost:3000
```

5. Start the servers:

Backend:
```bash
cd backend
python app.py
```

Frontend:
```bash
cd frontend
npm start
```

## API Endpoints

### Meeting Management
- `POST /api/process-description` - Process meeting description with AI
- `POST /api/rooms` - Create a new meeting room
- `GET /api/rooms/<room_name>` - Join an existing room
- `POST /api/rooms/invite` - Send meeting invitations

### Recording Management
- `GET /api/recordings/<unique_id>` - Get recording metadata
- `GET /api/recordings` - List all recordings
- `POST /api/webhooks/recording-complete` - Handle recording completion
- `GET /api/recordings?status=<status>` - Filter recordings by status

## Recording System

### Unique ID System
Each recording is assigned a unique ID using the format:
```
rec_<uuid4>
```

### Recording Metadata
Metadata stored includes:
- Meeting details
- Recording status
- Start/end times
- Participants
- Recording settings
- S3 storage paths

### Recording Statuses
- `pending`: Recording is about to start
- `recording`: Currently recording
- `completed`: Recording finished and processed
- `failed`: Recording failed
- `deleted`: Recording was cleaned up

## Development

### Adding New Features
1. Create feature branch
2. Implement changes
3. Test thoroughly
4. Submit pull request

### Code Style
- Follow PEP 8 for Python code
- Use TypeScript for frontend development
- Document all new functions and endpoints

## License

[Your License Here]

## Contributing

[Contribution Guidelines]
