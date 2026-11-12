import React, { useRef, useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  UtensilsCrossed,
  BookOpen,
  Utensils,
  HardDrive,
  Lock,
  Cloud,
  CloudOff,
  RefreshCw,
} from 'lucide-react';
import { subscribeSyncStatus, type SyncStatus } from '../utils/supabaseSync';

interface HeaderProps {
  currentTab: 'dashboard' | 'planner' | 'recipes' | 'library';
  onSelectTab: (tab: 'dashboard' | 'planner' | 'recipes' | 'library') => void;
  onOpenDataBackup?: () => void;
  onLockApp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab, onOpenDataBackup, onLockApp }) => {
  const headerRef = useRef<HTMLElement>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');

  useEffect(() => {
    return subscribeSyncStatus(setSyncStatus);
  }, []);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planner' as const, label: 'Planificador', icon: Calendar },
    { id: 'recipes' as const, label: 'Recetario', icon: UtensilsCrossed },
    { id: 'library' as const, label: 'Biblioteca', icon: BookOpen },
  ];

  return (
    <header ref={headerRef} className="sticky top-0 z-30 bg-[#fbfaf7]/95 backdrop-blur-md border-b border-[#e9e3d8]">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2.5 sm:py-4 gap-2.5 sm:gap-4">
          
          {/* Brand & Title: Clickeable para volver al Dashboard */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center space-x-2.5 sm:space-x-3.5 text-left group cursor-pointer focus:outline-none"
            title="Volver al Dashboard"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#eaf1ea] border border-[#cbdbcb] flex items-center justify-center text-[#425c42] shadow-xs group-hover:bg-[#dfecdf] transition shrink-0">
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-[#2d3748] group-hover:text-[#425c42] transition leading-tight">
                Planificador de Menú Semanal
              </h1>
            </div>
          </button>

          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Navigation Tabs */}
            <nav className="flex items-center space-x-1 sm:space-x-2 bg-[#f2ecdf] p-1 sm:p-1.5 rounded-2xl border border-[#e3dac6] overflow-x-auto max-w-full touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onSelectTab(tab.id)}
                    className={`flex items-center space-x-1.5 sm:space-x-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                      isActive
                        ? 'bg-white text-[#2f4230] shadow-sm border border-[#e1d9cc]'
                        : 'text-[#6c6454] hover:text-[#2d3748] hover:bg-white/40'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-[#486b4a]' : 'text-[#877d6d]'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Acceso a Gestión de Datos y Copias (Offline / GitHub Pages) */}
            {onOpenDataBackup && (
              <button
                type="button"
                onClick={onOpenDataBackup}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-2xl bg-[#f2ecdf] hover:bg-[#e7dfce] border border-[#e3dac6] text-[#554a39] hover:text-[#2d2419] transition text-xs sm:text-sm font-semibold cursor-pointer shrink-0 active:scale-95 shadow-2xs"
                title="Copia de seguridad y gestión de datos (compatible con GitHub Pages)"
              >
                <HardDrive className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#527354]" />
                <span className="hidden md:inline">Datos</span>
              </button>
            )}

            {/* Estado de sincronización en la nube */}
            <div
              className="flex items-center px-1.5 py-1 text-[#6b6151] select-none"
              title={
                syncStatus === 'synced'
                  ? 'Sincronizado en la nube (Supabase)'
                  : syncStatus === 'syncing'
                  ? 'Sincronizando con la nube...'
                  : 'Modo sin conexión (guardado en el móvil)'
              }
            >
              {syncStatus === 'syncing' ? (
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#527354] animate-spin" />
              ) : syncStatus === 'offline' ? (
                <CloudOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#a8826b]" />
              ) : (
                <Cloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#527354]" />
              )}
            </div>

            {/* Bloquear sesión con PIN */}
            {onLockApp && (
              <button
                type="button"
                onClick={onLockApp}
                className="p-2 sm:p-2.5 rounded-2xl bg-[#f2ecdf] hover:bg-[#e7dfce] border border-[#e3dac6] text-[#554a39] hover:text-[#2d2419] transition text-xs font-semibold cursor-pointer shrink-0 active:scale-95 shadow-2xs"
                title="Bloquear sesión con PIN"
              >
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#756a59]" />
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
