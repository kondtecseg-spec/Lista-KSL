import React, { useState, useEffect } from 'react';
import { useRealtimeSync } from './hooks/useRealtimeSync';
import { Navbar } from './components/Navbar';
import { ShoppingListView } from './components/ShoppingListView';
import { MarketComparator } from './components/MarketComparator';
import { AISavingsPanel } from './components/AISavingsPanel';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { PWAInstallModal, PWAFloatingBanner } from './components/PWAInstallBanner';
import { ShoppingCart, Users, Sparkles, TrendingDown, RefreshCw, Smartphone } from 'lucide-react';

export default function App() {
  // Extract initial room from URL params if present
  const getInitialRoomFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    return roomParam ? roomParam.toUpperCase() : 'FAMILIA-123';
  };

  const [activeTab, setActiveTab] = useState<'list' | 'compare' | 'ai' | 'analytics'>('list');
  const [showInstallModal, setShowInstallModal] = useState(false);

  const {
    roomCode,
    setRoomCode,
    userName,
    updateUserName,
    roomState,
    status,
    addItem,
    toggleCheck,
    updatePrice,
    applySubstitute,
    deleteItem,
    addMarket,
    updateQuantity,
    reconnect,
  } = useRealtimeSync(getInitialRoomFromUrl());

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        roomCode={roomCode}
        setRoomCode={setRoomCode}
        userName={userName}
        updateUserName={updateUserName}
        roomState={roomState}
        status={status}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenInstallModal={() => setShowInstallModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 md:pb-12">
        {activeTab === 'list' && (
          <ShoppingListView
            roomState={roomState}
            userName={userName}
            addItem={addItem}
            toggleCheck={toggleCheck}
            updatePrice={updatePrice}
            applySubstitute={applySubstitute}
            deleteItem={deleteItem}
            addMarket={addMarket}
            updateQuantity={updateQuantity}
          />
        )}

        {activeTab === 'compare' && (
          <MarketComparator roomState={roomState} updatePrice={updatePrice} />
        )}

        {activeTab === 'ai' && (
          <AISavingsPanel roomState={roomState} applySubstitute={applySubstitute} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard roomState={roomState} userName={userName} />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar for easy thumb access on smartphones */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all ${
            activeTab === 'list'
              ? 'text-emerald-400 bg-emerald-500/10 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingCart className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Lista</span>
        </button>

        <button
          onClick={() => setActiveTab('compare')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all ${
            activeTab === 'compare'
              ? 'text-emerald-400 bg-emerald-500/10 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingDown className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Mercados</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all ${
            activeTab === 'ai'
              ? 'text-emerald-400 bg-emerald-500/10 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5 text-amber-300" />
          <span className="text-[10px]">IA Economia</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all ${
            activeTab === 'analytics'
              ? 'text-emerald-400 bg-emerald-500/10 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Família</span>
        </button>
      </nav>

      {/* Floating PWA Install Banner */}
      <PWAFloatingBanner onOpenModal={() => setShowInstallModal(true)} />

      {/* PWA Install Modal */}
      <PWAInstallModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />

      {/* Bottom Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
              E
            </div>
            <span className="font-semibold text-slate-400">EconomizaJá • Compras Familiares</span>
          </div>

          <div className="flex items-center space-x-3 text-slate-400">
            <button
              onClick={() => setShowInstallModal(true)}
              className="hover:text-emerald-400 transition-colors flex items-center space-x-1"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Instalar no Celular</span>
            </button>
            <span>•</span>
            <p className="text-slate-500 text-center sm:text-right">
              Sincronização ao vivo para família e comparação inteligente de preços entre supermercados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
