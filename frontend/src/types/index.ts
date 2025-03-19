export interface Room {
  id: string;
  name: string;
  url: string;
  privacy: string;
  created_at: string;
  config?: Record<string, any>;
}

export interface Participant {
  id: string;
  name?: string;
  isLocal: boolean;
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
} 