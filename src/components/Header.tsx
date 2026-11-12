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
  Menu,
  X,
  ShoppingCart,
  CalendarDays,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { subscribeSyncStatus, type SyncStatus } from '../utils/supabaseSync';

interface HeaderProps {
  currentTab: 'dashboard' | 'planner' | 'recipes' | 'library';
  onSelectTab: (tab: 'dashboard' | 'planner' | 'recipes' | 'library') => void;
  onOpenDataBackup?: () => void;
  onLockApp?: () => void;
  onOpenShoppingList?: () => void;
  onOpenMonthView?: () => void;
  onChangePin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenDataBackup,
  onLockApp,
  onOpenShoppingList,
  onOpenMonthView,
  onChangePin,
}) => {
  const headerRef = useRef<HTMLElement>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Cerrar menú móvil al cambiar de pestaña
  const handleNavClick = (tab: 'dashboard' | 'planner' | 'recipes' | 'library') => {
    onSelectTab(tab);
    setIsMobileMenuOpen(false);
  };

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planner' as const, label: 'Planificador', icon: Calendar },
    { id: 'recipes' as const, label: 'Recetario', icon: UtensilsCrossed },
    { id: 'library' as const, label: 'Biblioteca', icon: BookOpen },
  ];

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-30 bg-[#fcfbf9]/95 backdrop-blur-md border-b border-[#e9e3d8]"
      >
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-14 sm:h-18">
            {/* Brand Logo & Title */}
            <button
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center space-x-2.5 sm:space-x-3 text-left group cursor-pointer focus:outline-none"
              title="Volver al Dashboard"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#eaf1ea] border border-[#cbdbcb] flex items-center justify-center text-[#425c42] shadow-xs group-hover:bg-[#dfecdf] transition shrink-0">
                <Utensils className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-[#2d3748] group-hover:text-[#425c42] transition leading-tight">
                  Menú Semanal
                </h1>
              </div>
            </button>

            {/* Desktop Navigation (md and up) */}
            <div className="hidden md:flex items-center space-x-2">
              <nav className="flex items-center space-x-1 bg-[#f2ecdf] p-1 rounded-2xl border border-[#e3dac6]">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onSelectTab(tab.id)}
                      className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-white text-[#2f4230] shadow-sm border border-[#e1d9cc]'
                          : 'text-[#6c6454] hover:text-[#2d3748] hover:bg-white/40'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#486b4a]' : 'text-[#877d6d]'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Botón de datos */}
              {onOpenDataBackup && (
                <button
                  type="button"
                  onClick={onOpenDataBackup}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-2xl bg-[#f2ecdf] hover:bg-[#e7dfce] border border-[#e3dac6] text-[#554a39] hover:text-[#2d2419] transition text-xs font-semibold cursor-pointer shrink-0 active:scale-95 shadow-2xs"
                  title="Copia de seguridad y gestión de datos"
                >
                  <HardDrive className="w-4 h-4 text-[#527354]" />
                  <span>Datos</span>
                </button>
              )}

              {/* Estado de sincronización en la nube */}
              <div
                className="flex items-center px-2 py-1.5 rounded-xl bg-[#f4eee3] border border-[#e6decb] text-[#554a39] text-xs font-medium space-x-1.5 select-none"
                title={
                  syncStatus === 'synced'
                    ? 'Sincronizado en la nube (Supabase)'
                    : syncStatus === 'syncing'
                    ? 'Sincronizando con la nube...'
                    : 'Modo sin conexión'
                }
              >
                {syncStatus === 'syncing' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-[#527354] animate-spin" />
                    <span className="text-[11px] text-[#6b5f4f]">Sincronizando...</span>
                  </>
                ) : syncStatus === 'offline' ? (
                  <>
                    <CloudOff className="w-3.5 h-3.5 text-[#a8826b]" />
                    <span className="text-[11px] text-[#8c6f5d]">Offline</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-[#527354]" />
                    <span className="text-[11px] text-[#4a6b4c]">En la nube</span>
                  </>
                )}
              </div>

              {/* Bloquear sesión */}
              {onLockApp && (
                <button
                  type="button"
                  onClick={onLockApp}
                  className="p-2.5 rounded-2xl bg-[#f2ecdf] hover:bg-[#e7dfce] border border-[#e3dac6] text-[#554a39] hover:text-[#2d2419] transition text-xs font-semibold cursor-pointer shrink-0 active:scale-95 shadow-2xs"
                  title="Bloquear sesión con PIN"
                >
                  <Lock className="w-4 h-4 text-[#756a59]" />
                </button>
              )}
            </div>

            {/* Mobile Actions: Cloud Status + Quick Lock + Hamburger Menu (sm / md only) */}
            <div className="flex items-center space-x-2 md:hidden">
              {/* Cloud Sync Icon */}
              <div
                className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#f2ecdf] border border-[#e3dac6]"
                title={
                  syncStatus === 'synced'
                    ? 'Conectado a Supabase'
                    : syncStatus === 'syncing'
                    ? 'Sincronizando...'
                    : 'Sin conexión'
                }
              >
                {syncStatus === 'syncing' ? (
                  <RefreshCw className="w-4 h-4 text-[#527354] animate-spin" />
                ) : syncStatus === 'offline' ? (
                  <CloudOff className="w-4 h-4 text-[#a8826b]" />
                ) : (
                  <Cloud className="w-4 h-4 text-[#527354]" />
                )}
              </div>

              {/* Quick Lock */}
              {onLockApp && (
                <button
                  type="button"
                  onClick={onLockApp}
                  className="p-2 rounded-xl bg-[#f2ecdf] border border-[#e3dac6] text-[#554a39] active:scale-95 transition"
                  title="Bloquear pantalla"
                >
                  <Lock className="w-4 h-4 text-[#756a59]" />
                </button>
              )}

              {/* Hamburger Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl bg-[#eaf1ea] border border-[#cbdacb] text-[#345236] active:scale-95 transition cursor-pointer"
                aria-label="Abrir menú"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 stroke-[2.2]" />
                ) : (
                  <Menu className="w-5 h-5 stroke-[2.2]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Menu Hamburguesa) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-[85%] max-w-[320px] bg-[#fcfbf9] h-full shadow-2xl border-l border-[#e8e2d4] p-5 flex flex-col justify-between z-10 animate-fade-in">
            <div className="space-y-6">
              {/* Drawer Top */}
              <div className="flex items-center justify-between pb-4 border-b border-[#eee7da]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#eaf1ea] border border-[#cbdbcb] flex items-center justify-center text-[#425c42]">
                    <Utensils className="w-4 h-4 stroke-[2]" />
                  </div>
                  <span className="font-semibold text-base text-[#28332c]">Menú Semanal</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[#7c7161] hover:bg-[#f0ebe0]"
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation list */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#918573] mb-2 px-1">
                  Pestañas principales
                </p>
                <div className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = currentTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleNavClick(tab.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition active:scale-98 ${
                          isActive
                            ? 'bg-[#eaf1ea] text-[#2d4d30] border border-[#c8dbc8]'
                            : 'text-[#504535] hover:bg-[#f4efe4]'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-[#406a43]' : 'text-[#857969]'}`} />
                          <span>{tab.label}</span>
                        </div>
                        {isActive && <CheckCircle2 className="w-4 h-4 text-[#406a43]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#918573] mb-2 px-1">
                  Accesos rápidos
                </p>
                <div className="space-y-1">
                  {onOpenShoppingList && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenShoppingList();
                      }}
                      className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#504535] hover:bg-[#f4efe4] transition"
                    >
                      <ShoppingCart className="w-4 h-4 text-[#527354]" />
                      <span>Lista de la Compra</span>
                    </button>
                  )}
                  {onOpenMonthView && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenMonthView();
                      }}
                      className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#504535] hover:bg-[#f4efe4] transition"
                    >
                      <CalendarDays className="w-4 h-4 text-[#527354]" />
                      <span>Vista Calendario Mensual</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Security & Data */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#918573] mb-2 px-1">
                  Ajustes y Datos
                </p>
                <div className="space-y-1">
                  {onOpenDataBackup && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenDataBackup();
                      }}
                      className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#504535] hover:bg-[#f4efe4] transition"
                    >
                      <HardDrive className="w-4 h-4 text-[#527354]" />
                      <span>Copia de Seguridad y Datos</span>
                    </button>
                  )}
                  {onChangePin && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onChangePin();
                      }}
                      className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#504535] hover:bg-[#f4efe4] transition"
                    >
                      <KeyRound className="w-4 h-4 text-[#756a59]" />
                      <span>Cambiar PIN de 4 dígitos</span>
                    </button>
                  )}
                  {onLockApp && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onLockApp();
                      }}
                      className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#8f3627] hover:bg-[#fbf0ee] transition"
                    >
                      <Lock className="w-4 h-4 text-[#b83828]" />
                      <span>Bloquear sesión ahora</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Bottom Status */}
            <div className="pt-4 border-t border-[#eee7da]">
              <div className="flex items-center space-x-2 text-xs text-[#6e6353]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    syncStatus === 'synced'
                      ? 'bg-[#4e8250]'
                      : syncStatus === 'syncing'
                      ? 'bg-[#d69f3d] animate-pulse'
                      : 'bg-[#b83828]'
                  }`}
                />
                <span className="font-medium">
                  {syncStatus === 'synced'
                    ? 'Sincronizado con Supabase'
                    : syncStatus === 'syncing'
                    ? 'Guardando cambios en la nube...'
                    : 'Modo sin conexión'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Ultra-optimized for one-handed smartphone use) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#fcfbf9]/95 backdrop-blur-lg border-t border-[#e8e2d4] px-2 py-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-around md:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
                isActive ? 'text-[#345236]' : 'text-[#8c8273]'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-[#eaf1ea] shadow-2xs' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
              </div>
              <span
                className={`text-[10.5px] mt-0.5 leading-none tracking-tight ${
                  isActive ? 'font-bold text-[#2d4d30]' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};