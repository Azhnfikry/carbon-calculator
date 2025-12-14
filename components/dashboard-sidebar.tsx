'use client';

import { BarChart3, Plus, FileText, FileJson, Moon, Sun, LogOut, Leaf, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export function DashboardSidebar({ activeTab, onTabChange, onLogout }: DashboardSidebarProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const menuItems = [
    { id: 'company-info', label: 'Company Info', icon: Building2 },
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'add-entry', label: 'Add Entry', icon: Plus },
    { id: 'charts', label: 'Analytics', icon: BarChart3 },
    { id: 'all-entries', label: 'All Entries', icon: FileText },
    { id: 'reports', label: 'Reports', icon: FileJson },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 h-screen flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Leaf className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Carbon</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tracker</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full justify-start gap-3 ${
                isActive
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-gray-200 dark:border-slate-800 p-4 space-y-3">
        {/* Theme Toggle */}
        <Button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          variant="outline"
          className="w-full justify-start gap-3"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-5 w-5" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-5 w-5" />
              <span>Dark Mode</span>
            </>
          )}
        </Button>

        {/* Logout Button */}
        <Button onClick={onLogout} variant="destructive" className="w-full justify-start gap-3">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}
