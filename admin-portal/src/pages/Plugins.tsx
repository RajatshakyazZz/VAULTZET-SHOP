import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plug, Power, ArrowUpCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { portalApi } from '../api/client';
import { WpPlugin } from '../api/types';
import { useToast } from '../context/ToastContext';
import DataTable, { Column } from '../components/common/DataTable';

export default function Plugins() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data: plugins = [], isLoading } = useQuery({
    queryKey: ['plugins'],
    queryFn: () => portalApi.getPlugins(),
  });

  const pluginMutation = useMutation({
    mutationFn: ({
      action,
      pluginFile,
    }: {
      action: 'install' | 'activate' | 'deactivate' | 'update';
      pluginFile: string;
    }) => portalApi.pluginAction(action, pluginFile),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(['plugins'], (old: WpPlugin[] = []) =>
        old.map((p) => {
          if (p.plugin_file === variables.pluginFile) {
            if (variables.action === 'activate') return { ...p, active: true };
            if (variables.action === 'deactivate') return { ...p, active: false };
            if (variables.action === 'update') return { ...p, has_update: false, version: p.latest_version || p.version };
          }
          return p;
        })
      );
      success('Plugin Updated', `Action ${variables.action} executed.`);
    },
    onError: () => error('Action Failed', 'Could not modify plugin status.'),
  });

  const columns: Column<WpPlugin>[] = [
    {
      header: 'Plugin Name',
      accessorKey: 'name',
      cell: (p) => (
        <div>
          <div className="font-bold text-white text-xs">{p.name}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{p.plugin_file}</div>
          <p className="text-[11px] text-slate-500 mt-1 max-w-md">{p.description}</p>
        </div>
      ),
    },
    {
      header: 'Version',
      cell: (p) => (
        <div>
          <span className="font-mono text-xs font-bold text-purple-300">v{p.version}</span>
          {p.has_update && (
            <div className="text-[10px] text-amber-400 font-bold mt-0.5">
              Update: v{p.latest_version}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (p) => (
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
            p.active
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          {p.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (p) => (
        <div className="flex items-center gap-2">
          {/* Activate / Deactivate */}
          <button
            onClick={() =>
              pluginMutation.mutate({
                action: p.active ? 'deactivate' : 'activate',
                pluginFile: p.plugin_file,
              })
            }
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              p.active
                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {p.active ? 'Deactivate' : 'Activate'}
          </button>

          {/* Update if available */}
          {p.has_update && (
            <button
              onClick={() =>
                pluginMutation.mutate({
                  action: 'update',
                  pluginFile: p.plugin_file,
                })
              }
              className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1"
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              <span>Update</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          WordPress Plugins Manager
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
          View installed server extensions, toggle activation status, and apply plugin updates.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={plugins}
        searchKey="name"
        searchPlaceholder="Search plugins by name..."
        isLoading={isLoading}
      />

    </div>
  );
}
