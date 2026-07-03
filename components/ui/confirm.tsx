'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle } from 'lucide-react';
import { Button } from './primitives';

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: 'default' | 'danger';
}

type Resolver = (ok: boolean) => void;

const ConfirmContext = React.createContext<(o: ConfirmOptions) => Promise<boolean>>(async () => false);

export function useConfirm() {
  return React.useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = React.useState<ConfirmOptions | null>(null);
  const resolverRef = React.useRef<Resolver | null>(null);

  const confirm = React.useCallback((o: ConfirmOptions) => {
    setOpts(o);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const settle = React.useCallback((ok: boolean) => {
    resolverRef.current?.(ok);
    resolverRef.current = null;
    setOpts(null);
  }, []);

  const danger = opts?.tone === 'danger';

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog.Root open={opts != null} onOpenChange={(o) => !o && settle(false)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-fadeUp" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[18px] border border-line bg-card p-6 shadow-pop focus:outline-none"
            aria-describedby={opts?.description ? 'confirm-desc' : undefined}
          >
            <div className="flex items-start gap-3">
              {danger && (
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-urgent-bg text-urgent">
                  <AlertTriangle className="h-5 w-5" aria-hidden />
                </span>
              )}
              <div className="min-w-0">
                <Dialog.Title className="text-[16px] font-bold text-ink">
                  {opts?.title}
                </Dialog.Title>
                {opts?.description && (
                  <Dialog.Description id="confirm-desc" className="mt-1 text-[13px] text-muted">
                    {opts.description}
                  </Dialog.Description>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => settle(false)}>
                {opts?.cancelText ?? 'ยกเลิก'}
              </Button>
              <Button
                variant={danger ? 'danger' : 'primary'}
                size="sm"
                onClick={() => settle(true)}
                autoFocus
              >
                {opts?.confirmText ?? 'ยืนยัน'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </ConfirmContext.Provider>
  );
}
