import type {LanyardActivity, LanyardData} from "./lanyard.types";

const CUSTOM_ACTIVITY = 4;

export type ActivityProgress = {start?: number; end?: number};

export type ActivityVisual = {
  thumbnailUrl?: string;
  thumbnailAlt: string;
  iconUrl?: string;
  iconAlt: string;
  iconKind?: "spotify";
};

export type ActivitySummary = {
  eyebrow: string;
  title: string;
  detail?: string;
  visual?: ActivityVisual;
};

export type ActivityTooltip = {
  eyebrow: string;
  title: string;
  lines: string[];
  otherActivities: ActivitySummary[];
  progress?: ActivityProgress;
  visual?: ActivityVisual;
};

export type ActivityStatus = {
  type: "activity";
  activityId: string;
  activityType: number;
  text: string;
  tooltip: ActivityTooltip;
};

export type PresenceStatus = ActivityStatus | {type: "none"} | {type: "offline"};

export type Project = {
  name: string;
  stack: string;
  desc: string;
  github: string;
  img: string;
  url: string;
};

export function parseProjects(data?: LanyardData) {
  return parseProjectsJson(data?.kv?.projects);
}

export function parseProjectsJson(value?: string) {
  return parseJson<Project[]>(value, []);
}

export function parseFeaturedProject(data?: LanyardData) {
  return parseFeaturedProjectJson(data?.kv?.featured_project ?? data?.kv?.latest_project);
}

export function parseFeaturedProjectJson(value?: string) {
  return parseJson<Project | null>(value, null);
}

export function deriveStatus(data?: LanyardData): PresenceStatus | null {
  if (!data) return null;
  if (data.discord_status === "offline") return {type: "offline"};

  const activities = data.activities.filter((activity) => isCurrent(activity, data));
  const primary = activities.find((activity) => activity.type !== CUSTOM_ACTIVITY) ?? activities[0];
  if (!primary) return {type: "none"};

  return formatActivity(primary, activities.filter((activity) => activity !== primary), data);
}

export function deriveActivityStatuses(data?: LanyardData): ActivityStatus[] {
  if (!data || data.discord_status === "offline") return [];
  return data.activities
    .filter((activity) => activity.type !== CUSTOM_ACTIVITY && isCurrent(activity, data))
    .map((activity) => formatActivity(activity, [], data));
}

function parseJson<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return (JSON.parse(value) as T) ?? fallback;
  } catch {
    return fallback;
  }
}

function isSpotify(activity: LanyardActivity) {
  return activity.type === 2 && activity.name?.toLowerCase() === "spotify";
}

function isCurrent(activity: LanyardActivity, data: LanyardData) {
  return !isSpotify(activity) || (data.listening_to_spotify && data.spotify !== null);
}

function activityKey(activity: LanyardActivity) {
  return `${activity.type}-${activity.id || activity.application_id || activity.name || "activity"}`;
}

function displayText(activity: LanyardActivity) {
  if (activity.status_display_type === 1) return activity.state || activity.name || activity.details || "something";
  if (activity.status_display_type === 2) return activity.details || activity.name || activity.state || "something";
  return activity.name || activity.details || activity.state || "something";
}

function customActivityText(activity: LanyardActivity) {
  const text = activity.state || activity.name || "Custom status";
  return activity.emoji ? `${activity.emoji.name} ${text}` : text;
}

function activityEyebrow(type: number) {
  return ["Playing", "Streaming", "Listening", "Watching", "Custom status", "Competing"][type] ?? "Activity";
}

function assetUrl(activity: LanyardActivity, asset?: string) {
  if (!asset) return undefined;
  if (asset.startsWith("http")) return asset;
  if (asset.startsWith("mp:")) return `https://media.discordapp.net/${asset.slice(3)}`;
  if (asset.startsWith("spotify:")) return `https://i.scdn.co/image/${asset.slice(8)}`;
  if (activity.application_id) return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${asset}.png`;
  return undefined;
}

function activityVisual(activity: LanyardActivity, data: LanyardData): ActivityVisual | undefined {
  const spotify = isSpotify(activity);
  const thumbnailUrl = spotify
    ? data.spotify?.album_art_url ?? assetUrl(activity, activity.assets?.large_image)
    : assetUrl(activity, activity.assets?.large_image);
  const iconUrl = assetUrl(activity, activity.assets?.small_image);
  if (!thumbnailUrl && !iconUrl && !spotify) return undefined;

  return {
    thumbnailUrl,
    thumbnailAlt: spotify
      ? data.spotify?.album || "Spotify album artwork"
      : activity.assets?.large_text || activity.name || "Activity artwork",
    iconUrl,
    iconAlt: activity.assets?.small_text || activity.name || "Activity icon",
    iconKind: spotify && !iconUrl ? "spotify" : undefined,
  };
}

function activityProgress(activity: LanyardActivity, data: LanyardData): ActivityProgress | undefined {
  if (isSpotify(activity) && data.spotify?.timestamps) return {...data.spotify.timestamps};
  if (!activity.timestamps?.start && !activity.timestamps?.end) return undefined;
  return {...activity.timestamps};
}

function summary(activity: LanyardActivity, data: LanyardData): ActivitySummary {
  const title = activity.type === CUSTOM_ACTIVITY ? customActivityText(activity) : activity.name || "Activity";
  const detail = [activity.details, activity.state].find((line) => Boolean(line && line !== title));
  return {
    eyebrow: activityEyebrow(activity.type),
    title,
    detail,
    visual: activityVisual(activity, data),
  };
}

function formatActivity(activity: LanyardActivity, others: LanyardActivity[], data: LanyardData): ActivityStatus {
  const spotify = isSpotify(activity);
  const value = spotify && data.spotify ? data.spotify.song : displayText(activity);
  const title = activity.type === CUSTOM_ACTIVITY ? customActivityText(activity) : activity.name || "Activity";
  const lines = (spotify && data.spotify
    ? [data.spotify.song, data.spotify.artist, data.spotify.album]
    : [activity.details, activity.state, activity.assets?.large_text, activity.assets?.small_text])
    .filter((line): line is string => Boolean(line && line !== title))
    .filter((line, index, all) => all.indexOf(line) === index);
  const prefixes = ["Playing", "Streaming", "Listening to", "Watching", "", "Competing in"];
  const text = activity.type === CUSTOM_ACTIVITY ? customActivityText(activity) : `${prefixes[activity.type] ?? ""} ${value}`.trim();

  return {
    type: "activity",
    activityId: activityKey(activity),
    activityType: activity.type,
    text,
    tooltip: {
      eyebrow: activityEyebrow(activity.type),
      title,
      lines,
      otherActivities: others.map((item) => summary(item, data)),
      progress: activityProgress(activity, data),
      visual: activityVisual(activity, data),
    },
  };
}
