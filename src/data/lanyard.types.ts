export type LanyardActivity = {
  id?: string;
  application_id?: string;
  name?: string;
  type: number;
  details?: string;
  state?: string;
  status_display_type?: 0 | 1 | 2;
  emoji?: {name: string};
  timestamps?: {start?: number; end?: number};
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
};

export type SpotifyPresence = {
  album: string;
  album_art_url: string;
  artist: string;
  song: string;
  timestamps: {start: number; end: number};
  track_id?: string;
};

export type LanyardData = {
  activities: LanyardActivity[];
  discord_status: "online" | "idle" | "dnd" | "offline" | string;
  listening_to_spotify: boolean;
  spotify: SpotifyPresence | null;
  kv?: Record<string, string>;
};

export type LanyardRestPayload = {
  success: boolean;
  data?: LanyardData;
};

export type LanyardSocketPayload = {
  op?: number;
  t?: "INIT_STATE" | "PRESENCE_UPDATE" | string;
  d?: LanyardData | {heartbeat_interval?: number};
};
