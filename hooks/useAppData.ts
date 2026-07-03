'use client';

import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import {
  fetchTasks,
  fetchJanitors,
  fetchProfiles,
  fetchCategories,
  fetchLocations,
  fetchNotifications,
  fetchTaskPhotos,
} from '@/lib/api';
import { decorateTask, type DecoratedTask } from '@/lib/task-view';

export const qk = {
  tasks: ['tasks'] as const,
  janitors: ['janitors'] as const,
  profiles: ['profiles'] as const,
  categories: ['categories'] as const,
  locations: ['locations'] as const,
  notifications: (userId: string) => ['notifications', userId] as const,
  photos: (taskId: string) => ['photos', taskId] as const,
};

export function useTasks() {
  const sb = getSupabaseBrowser();
  return useQuery<DecoratedTask[]>({
    queryKey: qk.tasks,
    queryFn: async () => (await fetchTasks(sb)).map(decorateTask),
  });
}

export function useJanitors() {
  const sb = getSupabaseBrowser();
  return useQuery({ queryKey: qk.janitors, queryFn: () => fetchJanitors(sb) });
}

export function useProfiles() {
  const sb = getSupabaseBrowser();
  return useQuery({ queryKey: qk.profiles, queryFn: () => fetchProfiles(sb) });
}

export function useCategories() {
  const sb = getSupabaseBrowser();
  return useQuery({ queryKey: qk.categories, queryFn: () => fetchCategories(sb), staleTime: 300_000 });
}

export function useLocations() {
  const sb = getSupabaseBrowser();
  return useQuery({ queryKey: qk.locations, queryFn: () => fetchLocations(sb), staleTime: 300_000 });
}

export function useNotifications(userId: string) {
  const sb = getSupabaseBrowser();
  return useQuery({
    queryKey: qk.notifications(userId),
    queryFn: () => fetchNotifications(sb, userId),
  });
}

export function useTaskPhotos(taskId: string | null) {
  const sb = getSupabaseBrowser();
  return useQuery({
    queryKey: qk.photos(taskId ?? 'none'),
    queryFn: () => fetchTaskPhotos(sb, taskId as string),
    enabled: !!taskId,
  });
}
