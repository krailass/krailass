export type NotifyTarget = { userId: string } | { role: 'admin' };

export interface NotifyInput {
  target: NotifyTarget;
  title: string;
  body?: string;
  taskId?: string;
  type?: string;
}

/** Fire-and-forget: create in-app notifications + send Web Push via the server route. */
export async function notify(input: NotifyInput): Promise<void> {
  try {
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
      keepalive: true,
    });
  } catch {
    // Notification delivery is best-effort; never block the primary action.
  }
}
