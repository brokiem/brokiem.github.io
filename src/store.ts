import {atom, computed} from "nanostores";
import * as lanyard from "lanyard-wrapper";

export const $isLoading = atom(true);
export const $data = atom<lanyard.Data>();

export const $status = computed($data, (data): string | null => {
  if (!data) return null;
  if (data?.activities?.length > 0) return data?.activities[0].name;
  return "NoActivity";
});

export const $projects = computed($data, (data): Project[] => {
  const projects = JSON.parse(data?.kv?.projects || `""`);
  if (!projects) return [];

  return projects;
});

export const $latestProject = computed($data, (data): Project | null => {
  const project = JSON.parse(data?.kv?.latest_project || `""`);
  if (!project) return null;

  return project;
});

export type Project = {
  name: string;
  stack: string;
  desc: string;
  github: string;
  img: string;
  url: string;
}
