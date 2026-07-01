import {atom, computed} from "nanostores";
import * as lanyard from "lanyard-wrapper";

export const $isLoading = atom(true);
export const $data = atom<lanyard.Data>();

function parseKV<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) || fallback;
  } catch {
    return fallback;
  }
}

const CUSTOM_ACTIVITY_TYPE = 4;

type DiscordActivity = lanyard.Activity & {
  emoji?: {
    name: string;
  };
  status_display_type?: 0 | 1 | 2;
}

type ActivityTooltip = {
  eyebrow: string;
  title: string;
  lines: string[];
  otherActivitiesCount: number;
  otherActivities: ActivitySummary[];
  progress?: ActivityProgress;
  visual?: ActivityVisual;
}

type ActivitySummary = {
  eyebrow: string;
  title: string;
  detail?: string;
  visual?: ActivityVisual;
}

type ActivityProgress = {
  start?: number;
  end?: number;
}

type ActivityVisual = {
  thumbnailUrl?: string;
  thumbnailAlt: string;
  iconUrl?: string;
  iconAlt: string;
  iconKind?: "spotify";
}

function getPrimaryActivity(activities: DiscordActivity[]) {
  return activities.find((activity) => activity.type !== CUSTOM_ACTIVITY_TYPE) ?? activities[0];
}

function getActivityDisplayText(activity: DiscordActivity) {
  switch (activity.status_display_type) {
    case 1:
      return activity.state || activity.name || activity.details || "something";
    case 2:
      return activity.details || activity.name || activity.state || "something";
    default:
      return activity.name || activity.details || activity.state || "something";
  }
}

function formatCustomActivity(activity: DiscordActivity) {
  const statusText = activity.state || activity.name || "Custom status";
  return activity.emoji ? `${activity.emoji.name} ${statusText}` : statusText;
}

function getActivityEyebrow(activity: DiscordActivity) {
  switch (activity.type) {
    case 0:
      return "Playing";
    case 1:
      return "Streaming";
    case 2:
      return "Listening";
    case 3:
      return "Watching";
    case 4:
      return "Custom Status";
    case 5:
      return "Competing";
    default:
      return "Activity";
  }
}

function getDiscordAssetUrl(activity: DiscordActivity, asset?: string) {
  if (!asset) return undefined;
  if (asset.startsWith("http")) return asset;
  if (asset.startsWith("mp:")) return `https://media.discordapp.net/${asset.slice(3)}`;
  if (asset.startsWith("spotify:")) return `https://i.scdn.co/image/${asset.slice(8)}`;
  if (activity.application_id) return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${asset}.png`;
  return undefined;
}

function getActivityVisual(activity: DiscordActivity, data: lanyard.Data): ActivityVisual | undefined {
  const isSpotify = activity.type === 2 && activity.name === "Spotify";
  const thumbnailUrl = isSpotify
    ? data.spotify?.album_art_url ?? getDiscordAssetUrl(activity, activity.assets?.large_image)
    : getDiscordAssetUrl(activity, activity.assets?.large_image);
  const iconUrl = getDiscordAssetUrl(activity, activity.assets?.small_image);

  if (!thumbnailUrl && !iconUrl && !isSpotify) return undefined;

  return {
    thumbnailUrl,
    thumbnailAlt: activity.assets?.large_text || activity.name || "Activity artwork",
    iconUrl,
    iconAlt: activity.assets?.small_text || activity.name || "Activity icon",
    iconKind: isSpotify && !iconUrl ? "spotify" : undefined,
  };
}

function getActivityProgress(activity: DiscordActivity, data: lanyard.Data): ActivityProgress | undefined {
  if (activity.type === 2 && activity.name === "Spotify" && data.spotify?.timestamps) {
    return {
      start: data.spotify.timestamps.start,
      end: data.spotify.timestamps.end,
    };
  }

  if (!activity.timestamps?.start && !activity.timestamps?.end) return undefined;

  return {
    start: activity.timestamps.start,
    end: activity.timestamps.end,
  };
}

function getActivityTooltip(activity: DiscordActivity, otherActivitiesCount: number, data: lanyard.Data): ActivityTooltip {
  const title = activity.type === 4 ? formatCustomActivity(activity) : activity.name || "Activity";
  const lines = [
    activity.details,
    activity.state,
    activity.assets?.large_text,
    activity.assets?.small_text,
  ].filter((line): line is string => Boolean(line && line !== title));

  return {
    eyebrow: getActivityEyebrow(activity),
    title,
    lines,
    otherActivitiesCount,
    otherActivities: [],
    progress: getActivityProgress(activity, data),
    visual: getActivityVisual(activity, data),
  };
}

function getActivitySummary(activity: DiscordActivity, data: lanyard.Data): ActivitySummary {
  const title = activity.type === 4 ? formatCustomActivity(activity) : activity.name || "Activity";
  const detail = [
    activity.details,
    activity.state,
  ].find((line) => Boolean(line && line !== title));

  return {
    eyebrow: getActivityEyebrow(activity),
    title,
    detail,
    visual: getActivityVisual(activity, data),
  };
}

function formatActivity(activity: DiscordActivity, otherActivities: DiscordActivity[], data: lanyard.Data): ActivityStatus {
  const displayText = getActivityDisplayText(activity);
  const tooltip = getActivityTooltip(activity, otherActivities.length, data);
  tooltip.otherActivities = otherActivities.map((item) => getActivitySummary(item, data));

  switch (activity.type) {
    case 0:
      return {type: "activity", activityType: activity.type, text: `Playing ${displayText}`, tooltip};
    case 1:
      return {type: "activity", activityType: activity.type, text: `Streaming ${activity.details || displayText}`, tooltip};
    case 2:
      return {type: "activity", activityType: activity.type, text: `Listening to ${displayText}`, tooltip};
    case 3:
      return {type: "activity", activityType: activity.type, text: `Watching ${displayText}`, tooltip};
    case 4:
      return {type: "activity", activityType: activity.type, text: formatCustomActivity(activity), tooltip};
    case 5:
      return {type: "activity", activityType: activity.type, text: `Competing in ${displayText}`, tooltip};
    default:
      return {type: "activity", activityType: activity.type, text: displayText, tooltip};
  }
}

export const $status = computed($data, (data): Status | null => {
  if (!data) return null;
  if (data.discord_status === "offline") return {type: "offline"};

  const activity = getPrimaryActivity(data.activities);
  if (activity) {
    const otherActivities = data.activities.filter((item) => item !== activity);
    return formatActivity(activity, otherActivities, data);
  }

  return {type: "none"};
});

export const $projects = computed($data, (data): Project[] => {
  return parseKV<Project[]>(data?.kv?.projects, []);
});

export const $latestProject = computed($data, (data): Project | null => {
  return parseKV<Project | null>(data?.kv?.latest_project, null);
});

export type Project = {
  name: string;
  stack: string;
  desc: string;
  github: string;
  img: string;
  url: string;
}

export type ActivityStatus = {
  type: "activity";
  activityType: number;
  text: string;
  tooltip: ActivityTooltip;
}

export type Status =
  | ActivityStatus
  | { type: "none" }
  | { type: "offline" };
