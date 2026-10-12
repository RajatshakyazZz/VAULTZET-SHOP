import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Paintbrush, Check, ArrowUpCircle, ExternalLink } from 'lucide-react';
import { portalApi } from '../api/client';
import { WpTheme } from '../api/types';
import { useToast } from '../context/ToastContext';

export default function Themes() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data: themes = [], isLoading } = useQuery({
    queryKey: ['themes'],
    queryFn: () => portalApi.getThemes(),
  });

  const themeMutation = useMutation({
    mutationFn: ({ action, slug }: { action: 'activate' | 'update'; slug: string }) =>
      portalApi.themeAction(action, slug),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(['themes'], (old: WpTheme[] = []) =>
        old.map((t) => ({
          ...t,
          active: t.slug === variables.slug,
          has_update: t.slug === variables.slug ? false : t.has_update,
        }))
      );
      success('Theme Updated', `Theme ${variables.slug} is now active.`);
    },
    onError: () => error('Action Failed', 'Could not activate theme.'),
  });

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          WordPress Themes Manager
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
          Manage storefront templates, activate themes, and apply visual layout updates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <div
            key={theme.slug}
            className={`rounded-2xl overflow-hidden border transition-all ${
              theme.active
                ? 'bg-slate-900 border-purple-500/50 shadow-lg shadow-purple-500/10'
                : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            {/* Screenshot preview */}
            <div className="relative aspect-video bg-slate-950 overflow-hidden">
              <img
                src={theme.screenshot}
                alt={theme.name}
                className="w-full h-full object-cover"
              />
              {theme.active && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                  Active Storefront Theme
                </span>
              )}
            </div>

            {/* Info */}
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{theme.name}</h3>
                  <span className="text-[11px] font-mono text-purple-300">v{theme.version}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                {theme.active ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>Currently Active</span>
                  </span>
                ) : (
                  <button
                    onClick={() => themeMutation.mutate({ action: 'activate', slug: theme.slug })}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20"
                  >
                    Activate Theme
                  </button>
                )}

                {theme.has_update && (
                  <button
                    onClick={() => themeMutation.mutate({ action: 'update', slug: theme.slug })}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <ArrowUpCircle className="w-3.5 h-3.5" />
                    <span>Update</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
