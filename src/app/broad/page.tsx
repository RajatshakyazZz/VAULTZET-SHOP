'use client';

import React, { useState, useEffect, useMemo } from 'react';
import broadcastLeads from '@/data/broadcastLeads.json';

interface Lead {
  id: number;
  name: string;
  firstName: string;
  phone: string;
  pastPurchase: string;
}

const DEFAULT_MESSAGE = `hello {{name}} bhai GTA6 ka video bundle aagay hai sabse pehle buy karlo gta6 ki har video pe achhe view aa rha hai saare video non watermark or non copy right hai https://www.vaultzet.shop/product/2000-gta-6-viral-reels-bundle`;

export default function BroadcastPage() {
  const [leads] = useState<Lead[]>(broadcastLeads);
  const [messageTemplate, setMessageTemplate] = useState<string>(DEFAULT_MESSAGE);
  const [sentPhones, setSentPhones] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'sent'>('all');

  // Load sent phones and custom template from localStorage
  useEffect(() => {
    try {
      const savedSent = localStorage.getItem('vz_broad_sent_phones');
      if (savedSent) {
        setSentPhones(JSON.parse(savedSent));
      }
      const savedTpl = localStorage.getItem('vz_broad_msg_template');
      if (savedTpl) {
        setMessageTemplate(savedTpl);
      }
    } catch (e) {
      console.warn('Error loading localStorage:', e);
    }
    setIsLoaded(true);
  }, []);

  const saveSentList = (newList: string[]) => {
    setSentPhones(newList);
    try {
      localStorage.setItem('vz_broad_sent_phones', JSON.stringify(newList));
    } catch {}
  };

  const handleToggleSent = (phone: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (sentPhones.includes(phone)) {
      saveSentList(sentPhones.filter((p) => p !== phone));
    } else {
      saveSentList([...sentPhones, phone]);
    }
  };

  const handleTemplateChange = (val: string) => {
    setMessageTemplate(val);
    try {
      localStorage.setItem('vz_broad_msg_template', val);
    } catch {}
  };

  const handleSendWhatsApp = (lead: Lead) => {
    // Replace {{name}} with customer's first name, or fallback
    let customText = messageTemplate;
    if (customText.includes('{{name}}')) {
      customText = customText.replace(/{{name}}/g, lead.firstName || 'bhai');
    }

    const encoded = encodeURIComponent(customText);
    const waUrl = `https://wa.me/${lead.phone}?text=${encoded}`;

    // Mark as sent in state
    if (!sentPhones.includes(lead.phone)) {
      saveSentList([...sentPhones, lead.phone]);
    }

    // Open WhatsApp app on mobile or WhatsApp Web
    window.open(waUrl, '_blank');
  };

  const handleResetProgress = () => {
    if (window.confirm('Kya aap saare sent ticks reset karna chahte hain?')) {
      saveSentList([]);
    }
  };

  const handleCopyNumbers = () => {
    const numbers = leads.map((l) => `+${l.phone}`).join('\n');
    navigator.clipboard.writeText(numbers).then(() => {
      alert('Saare 63 phone numbers copy ho gaye!');
    });
  };

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const isSent = sentPhones.includes(lead.phone);
      if (filterTab === 'pending' && isSent) return false;
      if (filterTab === 'sent' && !isSent) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        lead.name.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        lead.pastPurchase.toLowerCase().includes(q)
      );
    });
  }, [leads, sentPhones, filterTab, searchQuery]);

  const sentCount = sentPhones.length;
  const remainingCount = Math.max(0, leads.length - sentCount);
  const progressPercent = Math.round((sentCount / leads.length) * 100) || 0;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-[#0c1222]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3.5 shadow-xl">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                ⚡ VaultZet <span className="text-rose-500">Broadcast</span>
              </span>
              <span className="text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full">
                GTA 6
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Target: <strong className="text-slate-200">63 Verified Past Buyers</strong>
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-emerald-400">
              {sentCount} / {leads.length} Sent
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {progressPercent}% Complete
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-xl mx-auto mt-2.5 w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="bg-[#111a2e] border border-slate-800 rounded-xl p-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</div>
            <div className="text-xl font-black text-white mt-0.5">{leads.length}</div>
          </div>
          <div className="bg-[#111a2e] border border-emerald-900/40 rounded-xl p-3">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Sent</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{sentCount}</div>
          </div>
          <div className="bg-[#111a2e] border border-rose-900/40 rounded-xl p-3">
            <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Pending</div>
            <div className="text-xl font-black text-rose-400 mt-0.5">{remainingCount}</div>
          </div>
        </div>

        {/* Message Editor Card */}
        <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              💬 WhatsApp Message Preview
            </span>
            <button
              onClick={() => handleTemplateChange(DEFAULT_MESSAGE)}
              className="text-[11px] font-semibold text-slate-400 hover:text-white underline"
            >
              Reset
            </button>
          </div>
          <textarea
            value={messageTemplate}
            onChange={(e) => handleTemplateChange(e.target.value)}
            rows={4}
            className="w-full bg-[#070b14] border border-slate-700/80 rounded-xl p-3 text-xs leading-relaxed text-slate-200 focus:outline-none focus:border-rose-500 font-sans"
          />
          <p className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between">
            <span>💡 <code>{'{{name}}'}</code> buyer ke first name se auto-replace hoga.</span>
            <span className="text-slate-500">{messageTemplate.length} chars</span>
          </p>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 bg-[#111a2e] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterTab('all')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterTab === 'all'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({leads.length})
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterTab === 'pending'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending ({remainingCount})
            </button>
            <button
              onClick={() => setFilterTab('sent')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterTab === 'sent'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sent ({sentCount})
            </button>
          </div>

          <input
            type="text"
            placeholder="🔍 Naam ya number search karein..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111a2e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Customer Cards List */}
        <div className="space-y-2.5">
          {filteredLeads.map((lead) => {
            const isSent = sentPhones.includes(lead.phone);
            return (
              <div
                key={lead.id}
                className={`bg-[#111a2e] border rounded-2xl p-3.5 transition-all shadow-md flex items-center justify-between gap-3 ${
                  isSent
                    ? 'border-emerald-900/30 opacity-70 bg-[#0c1424]'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-500">#{lead.id}</span>
                    <h3 className="text-sm font-bold text-white truncate">{lead.name}</h3>
                    {isSent && (
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        ✓ Sent
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    +{lead.phone}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-1">
                    📦 <span className="text-slate-300">{lead.pastPurchase}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {/* Big Green Send Button */}
                  <button
                    onClick={() => handleSendWhatsApp(lead)}
                    className="bg-[#25d366] hover:bg-[#20ba5a] active:scale-95 text-black font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>🚀 Send</span>
                  </button>

                  {/* Toggle sent checkbox */}
                  <button
                    onClick={(e) => handleToggleSent(lead.phone, e)}
                    className="text-[10px] font-semibold text-slate-400 hover:text-slate-200 underline"
                  >
                    {isSent ? 'Mark Pending' : 'Mark Sent'}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredLeads.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm bg-[#111a2e] rounded-2xl border border-slate-800">
              Koi lead nahi mili iss filter me.
            </div>
          )}
        </div>

        {/* Footer Helper Actions */}
        <div className="pt-4 flex items-center justify-between text-xs text-slate-400 pb-10">
          <button
            onClick={handleCopyNumbers}
            className="hover:text-white underline font-semibold"
          >
            📋 Copy All 63 Numbers
          </button>
          <button
            onClick={handleResetProgress}
            className="text-rose-400 hover:text-rose-300 underline font-semibold"
          >
            🔄 Reset Sent Progress
          </button>
        </div>
      </div>
    </div>
  );
}
