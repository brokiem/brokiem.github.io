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

export const $status = computed($data, (data): string | null => {
  if (!data) return null;
  if (data?.discord_status === "offline") return "Offline";
  if (data?.activities?.length > 0) return data?.activities[0].name;
  return "NoActivity";
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
