import React, { useState } from 'react';
import {
  ShoppingCart,
  Users,
  Share2,
  Copy,
  Check,
  Wifi,
  WifiOff,
  UserCheck,
  PlusCircle,
  TrendingDown,
  Sparkles,
  Smartphone,
  Download,
} from 'lucide-react';
import { FamilyRoom } from '../types';
import { getShareRoomUrl } from '../utils/url';

interface NavbarProps {
  roomCode: string;
  setRoomCode: (code: string) => void;
  userName: string;
  updateUserName: (name: string) => void;
  roomState: FamilyRoom | null;
  status: 'connecting' | 'connected' | 'disconnected';
  activeTab: 'list' | 'compare' | 'ai' | 'analytics';
  setActiveTab: (tab: 'list' | 'compare' | 'ai' | 'analytics') => void;
  onOpenInstallModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  roomCode,
  setRoomCode,
  userName,
  updateUserName,
  roomState,
  status,
  activeTab,
  setActiveTab,
  onOpenInstallModal,
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [newRoomInput, setNewRoomInput] = useState('');
  const [newUserNameInput, setNewUserNameInput] = useState(userName);
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    return getShareRoomUrl(roomCode);
  };

  const copyShareLink = () => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinNewRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomInput.trim()) {
      setRoomCode(newRoomInput.trim().toUpperCase());
      setShowRoomModal(false);
      setNewRoomInput('');
    }
  };

  const handleUpdateUserName = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserNameInput.trim()) {
      updateUserName(newUserNameInput.trim());
      setShowUserModal(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Room Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <ShoppingCart className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg tracking-tight text-slate-100 leading-none">
                  EconomizaJá
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Mercados & Família
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1">
                <span>Grupo:</span>
                <button
                  onClick={() => setShowRoomModal(true)}
                  className="font-mono font-bold text-emerald-400 hover:underline hover:text-emerald-300 transition-colors"
                >
                  #{roomCode}
                </button>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'list'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Lista Sincronizada</span>
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'compare'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Comparar Mercados</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'ai'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Sugestões IA</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Painel Família</span>
            </button>
          </nav>

          {/* User Controls & Sync Status */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Install App Button */}
            {onOpenInstallModal && (
              <button
                onClick={onOpenInstallModal}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 transition-all shadow-sm"
                title="Instalar aplicativo no celular"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Instalar App</span>
                <span className="sm:hidden">App</span>
              </button>
            )}

            {/* Real-time Status Badge */}
            <div
              className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                status === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
              }`}
            >
              {status === 'connected' ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span>Ao vivo</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  <span>Reconectando...</span>
                </>
              )}
            </div>

            {/* Share Family Room Button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compartilhar</span>
            </button>

            {/* User Name Badge */}
            <button
              onClick={() => setShowUserModal(true)}
              className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium max-w-[80px] truncate">{userName}</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium ${
              activeTab === 'list' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <ShoppingCart className="w-4 h-4 mb-0.5" />
            <span>Lista</span>
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium ${
              activeTab === 'compare' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <TrendingDown className="w-4 h-4 mb-0.5" />
            <span>Mercados</span>
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium ${
              activeTab === 'ai' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Sparkles className="w-4 h-4 mb-0.5 text-amber-300" />
            <span>IA Economia</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium ${
              activeTab === 'analytics' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Users className="w-4 h-4 mb-0.5" />
            <span>Família</span>
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-lg text-slate-100">Sincronização Familiar</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Qualquer familiar que entrar no código do grupo poderá ver e marcar itens em tempo real no mercado!
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Código da Família:</span>
                <span className="font-mono text-emerald-400 font-bold">#{roomCode}</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={getShareUrl()}
                  className="bg-slate-900 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-lg flex-1 outline-none font-mono"
                />
                <button
                  onClick={copyShareLink}
                  className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-2 rounded-lg text-xs transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-800 flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Abra este mesmo link em outro celular ou aba para testar a sincronização ao vivo instantaneamente.
              </span>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl font-semibold text-xs text-slate-200 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Room Change Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-100">Trocar ou Criar Grupo</h3>
              <button
                onClick={() => setShowRoomModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleJoinNewRoom} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Digite o código do grupo da família (Ex: FAMILIA-123):
                </label>
                <input
                  type="text"
                  placeholder="EX: FAMILIA-456"
                  value={newRoomInput}
                  onChange={(e) => setNewRoomInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white font-mono uppercase px-3 py-2.5 rounded-xl text-sm outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400"
                >
                  Entrar no Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Name Change Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">Seu Nome na Família</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateUserName} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Como quer ser identificado?</label>
                <input
                  type="text"
                  placeholder="Ex: João, Maria, Pai..."
                  value={newUserNameInput}
                  onChange={(e) => setNewUserNameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white px-3 py-2.5 rounded-xl text-sm outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
