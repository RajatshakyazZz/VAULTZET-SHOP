import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Upload, Plus, ExternalLink, Calendar, User } from 'lucide-react';
import { portalApi } from '../api/client';
import { ContentItem } from '../api/types';
import { formatDate } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import DataTable, { Column } from '../components/common/DataTable';

export default function Content() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'upload'>('all');
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const { data: contentList = [], isLoading } = useQuery({
    queryKey: ['content'],
    queryFn: () => portalApi.getContent(),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await portalApi.uploadMedia(file);
      setUploadedUrl(res.url);
      success('Media Uploaded', `File uploaded to WordPress Media Library (ID #${res.id})`);
    } catch {
      error('Upload Failed', 'Could not upload media asset.');
    }
  };

  const columns: Column<ContentItem>[] = [
    {
      header: 'Title & Slug',
      accessorKey: 'title',
      cell: (item) => (
        <div>
          <div className="font-bold text-white text-xs">{item.title}</div>
          <div className="text-[11px] text-slate-400 font-mono">/{item.slug}</div>
        </div>
      ),
    },
    {
      header: 'Type',
      cell: (item) => (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-800 text-purple-300 border border-slate-700">
          {item.type}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (item) => (
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
            item.status === 'publish'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      header: 'Last Modified',
      cell: (item) => <span className="text-slate-400 text-xs">{formatDate(item.date_modified)}</span>,
    },
    {
      header: 'View',
      cell: (item) => (
        <a
          href={`https://reelsbundles.in/${item.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors inline-block"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Content, Pages & Media
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            Manage WordPress legal pages, guides, policies, and direct media library uploads.
          </p>
        </div>

        {/* Media Upload Button */}
        <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 self-start sm:self-auto">
          <Upload className="w-4 h-4" />
          <span>Upload Media Asset</span>
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*,.zip"
          />
        </label>
      </div>

      {uploadedUrl && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-200">
          <span>Uploaded successfully! Available in WP media library.</span>
          <a
            href={uploadedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline flex items-center gap-1"
          >
            <span>Preview File</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      <DataTable
        columns={columns}
        data={contentList}
        searchKey="title"
        searchPlaceholder="Search pages or posts..."
        isLoading={isLoading}
      />

    </div>
  );
}
