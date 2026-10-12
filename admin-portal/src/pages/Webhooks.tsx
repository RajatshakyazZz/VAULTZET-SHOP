import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Webhook, RefreshCw, Trash2, Play, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { portalApi } from '../api/client';
import { WebhookLogEntry, WebhookConfig } from '../api/types';
import { formatDate } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import DataTable, { Column } from '../components/common/DataTable';

export default function Webhooks() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [testEvent, setTestEvent] = useState('order.completed');

  const { data: logs = [], isLoading: isLogsLoading } = useQuery({
    queryKey: ['webhook-logs'],
    queryFn: () => portalApi.getWebhookLogs(),
  });

  const { data: settings } = useQuery({
    queryKey: ['webhook-settings'],
    queryFn: () => portalApi.getWebhookSettings(),
  });

  const retryMutation = useMutation({
    mutationFn: (logId: string) => portalApi.retryWebhook(logId),
    onSuccess: (res) => {
      success('Webhook Retried', `Dispatched with response HTTP ${res.status_code}`);
      queryClient.invalidateQueries({ queryKey: ['webhook-logs'] });
    },
    onError: () => error('Retry Failed', 'Webhook endpoint did not respond successfully.'),
  });

  const clearMutation = useMutation({
    mutationFn: () => portalApi.clearWebhookLogs(),
    onSuccess: () => {
      queryClient.setQueryData(['webhook-logs'], []);
      success('Logs Cleared', 'Webhook delivery history cleared.');
    },
  });

  const testTriggerMutation = useMutation({
    mutationFn: (event: string) => portalApi.testWebhookTrigger(event),
    onSuccess: () => {
      success('Test Dispatched', `Simulated test payload for ${testEvent} sent.`);
      queryClient.invalidateQueries({ queryKey: ['webhook-logs'] });
    },
  });

  const columns: Column<WebhookLogEntry>[] = [
    {
      header: 'Event',
      accessorKey: 'event',
      cell: (l) => (
        <span className="font-mono font-bold text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
          {l.event}
        </span>
      ),
    },
    {
      header: 'Target URL',
      cell: (l) => <span className="font-mono text-[11px] text-slate-300 truncate max-w-[240px] block">{l.target_url}</span>,
    },
    {
      header: 'Status Code',
      cell: (l) => (
        <span
          className={`px-2 py-0.5 rounded font-mono font-black text-[11px] ${
            l.status_code >= 200 && l.status_code < 300
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          {l.status_code} {l.status_code === 200 ? 'OK' : 'ERROR'}
        </span>
      ),
    },
    {
      header: 'Payload Summary',
      cell: (l) => <span className="text-xs text-slate-400 truncate max-w-[200px] block">{l.payload_summary}</span>,
    },
    {
      header: 'Timestamp',
      cell: (l) => <span className="text-xs text-slate-500">{formatDate(l.timestamp)}</span>,
    },
    {
      header: 'Actions',
      cell: (l) => (
        <button
          onClick={() => retryMutation.mutate(l.id)}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 text-xs font-bold transition-all flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Retry</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Webhooks & Automation Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            Monitor real-time payload deliveries to payment gateways, Google Drive, and CRM pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => clearMutation.mutate()}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Test Trigger Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-300">Test Simulator:</span>
          <select
            value={testEvent}
            onChange={(e) => setTestEvent(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
          >
            <option value="order.completed">order.completed</option>
            <option value="payment.success">payment.success</option>
            <option value="order.refunded">order.refunded</option>
            <option value="product.updated">product.updated</option>
          </select>
        </div>

        <button
          onClick={() => testTriggerMutation.mutate(testEvent)}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Fire Test Webhook (/webhook-test)</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        searchKey="event"
        searchPlaceholder="Filter by webhook event..."
        isLoading={isLogsLoading}
      />

    </div>
  );
}
