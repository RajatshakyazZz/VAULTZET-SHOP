import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Ticket,
  FileText,
  Palette,
  Power,
  Store,
  Crosshair,
  MessageCircle,
  Webhook,
  Plug,
  Paintbrush,
  RefreshCw,
  Settings,
  ShieldCheck,
  Activity,
  Play,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { admin } = useAuth();

  const navigation = [
    {
      group: 'OVERVIEW',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Audit Logs', href: '/audit-logs', icon: Activity, badge: 'Firebase' },
      ],
    },
    {
      group: 'COMMERCE',
      items: [
        { name: 'Products & Files', href: '/products', icon: Package },
        { name: 'Orders & Delivery', href: '/orders', icon: ShoppingCart },
        { name: 'Customers', href: '/customers', icon: Users },
        { name: 'Resellers & Payouts', href: '/resellers', icon: Users, badge: 'Live' },
        { name: 'Coupons', href: '/coupons', icon: Ticket },
      ],
    },
    {
      group: 'CONTENT & STORE',
      items: [
        { name: 'Content & Pages', href: '/content', icon: FileText },
        { name: 'Branding & Theme', href: '/branding', icon: Palette },
        { name: 'Site Mode', href: '/site-mode', icon: Power, badge: 'Control' },
        { name: 'Store Setup', href: '/store-setup', icon: Store },
      ],
    },
    {
      group: 'MARKETING',
      items: [
        { name: 'Meta Pixel & CAPI', href: '/meta-pixel', icon: Crosshair },
        { name: 'WhatsApp Button', href: '/whatsapp-button', icon: MessageCircle },
      ],
    },
    {
      group: 'SYSTEM & INTEGRATIONS',
      items: [
        { name: 'Webhooks & Logs', href: '/webhooks', icon: Webhook },
        { name: 'Plugins Manager', href: '/plugins', icon: Plug },
        { name: 'Themes Manager', href: '/themes', icon: Paintbrush },
        { name: 'Portal Connector', href: '/connector', icon: RefreshCw },
        { name: 'Settings & Bridges', href: '/settings', icon: Settings },
      ],
    },
  ];

  const sidebarContent = (
    <>
      {/* Brand Header */}
      <div className="h-16 px-4 sm:px-5 border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-black border border-slate-800 overflow-hidden flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
            <img src="/logo.png" alt="Vaultzet Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-[15px] text-white tracking-tight leading-none truncate">
              Vaultzet Shop
            </span>
            <span className="text-[11px] font-bold text-purple-400 tracking-wide mt-1 truncate">
              COMMAND CENTER v2.0
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {navigation.map((section) => (
          <div key={section.group} className="space-y-1">
            <h4 className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
              {section.group}
            </h4>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    end={item.href === '/'}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 lg:py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-purple-600/15 text-purple-400 border border-purple-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Admin User Footer Box */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 shrink-0 pb-safe">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-black text-xs border border-purple-500/30 shrink-0">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">{admin?.name}</div>
            <div className="text-[10px] text-purple-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">{admin?.role}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-950/90 border-r border-slate-800/80 flex-col shrink-0 h-screen sticky top-0 select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] bg-slate-950 border-r border-slate-800 flex flex-col h-full shadow-2xl select-none">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
