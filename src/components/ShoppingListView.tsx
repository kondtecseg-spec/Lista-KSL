import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Sparkles,
  ShoppingBag,
  Store,
  Tag,
  Search,
  Filter,
  DollarSign,
  TrendingDown,
  ChevronRight,
  ArrowRightLeft,
  AlertCircle,
  Eye,
  EyeOff,
  Minus,
  Zap,
} from 'lucide-react';
import { FamilyRoom, ShoppingItem, Market, SubstituteSuggestion } from '../types';

interface ShoppingListViewProps {
  roomState: FamilyRoom | null;
  userName: string;
  addItem: (item: Omit<ShoppingItem, 'id' | 'createdAt' | 'addedBy' | 'checked'>) => void;
  toggleCheck: (itemId: string, checked: boolean) => void;
  updatePrice: (itemId: string, marketId: string, price: number) => void;
  applySubstitute: (itemId: string, substitute: SubstituteSuggestion) => void;
  deleteItem: (itemId: string) => void;
  addMarket: (name: string, color?: string) => void;
  updateQuantity?: (itemId: string, quantity: number) => void;
}

const CATEGORIES = [
  'Todas',
  'Mercearia',
  'Laticínios',
  'Açougue',
  'Hortifruti',
  'Limpeza',
  'Higiene',
  'Padaria',
  'Bebidas',
  'Outros',
];

const UNITS = ['un', 'kg', 'g', 'L', 'ml', 'pct', 'cx', 'lata'];

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  roomState,
  userName,
  addItem,
  toggleCheck,
  updatePrice,
  applySubstitute,
  deleteItem,
  addMarket,
  updateQuantity,
}) => {
  const [selectedMarketId, setSelectedMarketId] = useState<string>('m1'); // default to Atacadão
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [hideChecked, setHideChecked] = useState(false);
  const [supermarketMode, setSupermarketMode] = useState(false); // Modo Mercado / Foco
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddMarketModal, setShowAddMarketModal] = useState(false);

  // Quick add input state
  const [quickItemName, setQuickItemName] = useState('');

  // New Item Form State
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Mercearia');
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemUnit, setItemUnit] = useState('un');
  const [itemInitialPrice, setItemInitialPrice] = useState<string>('');

  // New Market Form State
  const [newMarketName, setNewMarketName] = useState('');

  if (!roomState || !roomState.lists[0]) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 space-y-3">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Carregando lista da família...</p>
      </div>
    );
  }

  const activeList = roomState.lists[0];
  const markets = activeList.markets;
  const items = activeList.items;

  const currentMarket = markets.find((m) => m.id === selectedMarketId) || markets[0];

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
    const matchesChecked = !hideChecked || !item.checked;
    return matchesSearch && matchesCategory && matchesChecked;
  });

  // Calculate market totals
  const totalItemsCount = items.length;
  const checkedItemsCount = items.filter((i) => i.checked).length;
  const progressPercent = totalItemsCount > 0 ? Math.round((checkedItemsCount / totalItemsCount) * 100) : 0;

  // Basket Total for selected market
  const currentMarketTotal = items.reduce((sum, item) => {
    const price = item.prices[selectedMarketId] || 0;
    return sum + price * item.quantity;
  }, 0);

  const handleToggleCheck = (itemId: string, currentChecked: boolean) => {
    // Vibrate phone if supported for tactile feedback while walking in store
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(35);
      } catch (e) {
        // ignore
      }
    }
    toggleCheck(itemId, !currentChecked);
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickItemName.trim()) return;

    addItem({
      name: quickItemName.trim(),
      category: selectedCategory !== 'Todas' ? selectedCategory : 'Mercearia',
      quantity: 1,
      unit: 'un',
      prices: {},
    });

    setQuickItemName('');
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const initialPrices: Record<string, number> = {};
    const parsedPrice = parseFloat(itemInitialPrice.replace(',', '.')) || 0;

    if (parsedPrice > 0 && selectedMarketId) {
      initialPrices[selectedMarketId] = parsedPrice;
    }

    addItem({
      name: itemName.trim(),
      category: itemCategory,
      quantity: itemQuantity > 0 ? itemQuantity : 1,
      unit: itemUnit,
      prices: initialPrices,
    });

    setItemName('');
    setItemInitialPrice('');
    setShowAddModal(false);
  };

  const handleCreateMarket = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMarketName.trim()) {
      addMarket(newMarketName.trim());
      setNewMarketName('');
      setShowAddMarketModal(false);
    }
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Supermarket Mode Mobile Toast Banner when active */}
      {supermarketMode && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-lg flex items-center justify-between text-xs animate-pulse">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300 stroke-[2.5]" />
            <span>Modo Mercado Ativo: Botões e toques ampliados para o corredor!</span>
          </div>
          <button
            onClick={() => setSupermarketMode(false)}
            className="bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 px-2 py-0.5 rounded-lg text-[10px] uppercase font-black"
          >
            Sair
          </button>
        </div>
      )}

      {/* Top Banner & Progress */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Lista Ativa
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-100">{activeList.name}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sincronizado com <strong className="text-slate-200">{roomState.members.length} membros</strong> da família em tempo real.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Supermarket Mode Toggle */}
            <button
              onClick={() => setSupermarketMode(!supermarketMode)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                supermarketMode
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
              }`}
              title="Ativar modo de usar no corredor do supermercado"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Modo Mercado</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Adicionar Item</span>
              <span className="sm:hidden">Novo</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="flex justify-between text-xs text-slate-300">
            <span>
              Progresso do Carrinho: <strong className="text-emerald-400">{checkedItemsCount}</strong> de {totalItemsCount} comprados
            </span>
            <span className="font-bold text-emerald-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Market Selector & Filter Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold flex items-center space-x-1.5 text-slate-300">
            <Store className="w-4 h-4 text-emerald-400" />
            <span>Mercado Selecionado para Preços:</span>
          </span>

          <button
            onClick={() => setShowAddMarketModal(true)}
            className="text-emerald-400 hover:underline font-medium flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Mercado</span>
          </button>
        </div>

        {/* Market Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {markets.map((m) => {
            const isSelected = m.id === selectedMarketId;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMarketId(m.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shrink-0 ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: m.color || '#0284c7' }}
                />
                <span>{m.name}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Market Cost Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Estimativa no <strong className="text-white">{currentMarket?.name}</strong>:</span>
          </div>
          <div className="text-base font-black text-emerald-400">
            R$ {currentMarketTotal.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Quick Add Bar for Mobile / Fast Entry */}
      <form onSubmit={handleQuickAdd} className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Plus className="w-4 h-4 absolute left-3 top-3 text-emerald-400" />
          <input
            type="text"
            placeholder="Digite um produto e dê Enter (ex: Café, Arroz)..."
            value={quickItemName}
            onChange={(e) => setQuickItemName(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 text-slate-100 pl-9 pr-3 py-2.5 rounded-xl text-xs outline-none transition-colors"
          />
        </div>
        <button
          type="submit"
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2.5 rounded-xl text-xs transition-colors shrink-0"
        >
          Adicionar
        </button>
      </form>

      {/* Category Filter & Search */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar produto na lista..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-slate-100 pl-9 pr-3 py-2.5 rounded-xl text-xs outline-none transition-colors"
            />
          </div>

          {/* Hide Checked Toggle */}
          <button
            onClick={() => setHideChecked(!hideChecked)}
            className={`flex items-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border shrink-0 transition-colors ${
              hideChecked
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Esconder ou mostrar itens já comprados"
          >
            {hideChecked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{hideChecked ? 'Ocultando Comprados' : 'Mostrar Todos'}</span>
          </button>
        </div>

        {/* Category Dropdown/Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-semibold'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items List Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-10 text-center space-y-3">
          <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">
            {hideChecked ? 'Todos os itens foram comprados!' : 'Nenhum item encontrado'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Adicione itens para começar a comparar preços entre mercados e economizar em grupo!
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-emerald-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Novo Item</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const currentPrice = item.prices[selectedMarketId] || 0;

            return (
              <div
                key={item.id}
                className={`bg-slate-900 border rounded-2xl transition-all space-y-3 ${
                  supermarketMode ? 'p-4 border-slate-700 shadow-md' : 'p-3.5 border-slate-800'
                } ${
                  item.checked
                    ? 'border-slate-800/50 bg-slate-900/30 opacity-70'
                    : 'hover:border-slate-700'
                }`}
              >
                {/* Main Row */}
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleCheck(item.id, item.checked)}
                      className={`text-slate-500 hover:text-emerald-400 transition-colors shrink-0 flex items-center justify-center rounded-xl ${
                        supermarketMode ? 'w-9 h-9 bg-slate-800/80 border border-slate-700' : 'w-7 h-7'
                      }`}
                    >
                      {item.checked ? (
                        <CheckCircle2
                          className={`${
                            supermarketMode ? 'w-7 h-7' : 'w-5 h-5'
                          } text-emerald-400 fill-emerald-500/20`}
                        />
                      ) : (
                        <Circle className={`${supermarketMode ? 'w-7 h-7' : 'w-5 h-5'} text-slate-500`} />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-0.5">
                        <span
                          className={`font-bold truncate ${
                            supermarketMode ? 'text-base' : 'text-sm'
                          } ${item.checked ? 'line-through text-slate-500' : 'text-slate-100'}`}
                        >
                          {item.name}
                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-slate-800 text-slate-400 border border-slate-700/50">
                          {item.category}
                        </span>

                        {item.checked && item.checkedBy && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            por {item.checkedBy}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-slate-400">Qtd:</span>
                        <div className="flex items-center space-x-1 bg-slate-950 px-1.5 py-0.5 rounded-lg border border-slate-800">
                          <button
                            type="button"
                            onClick={() => updateQuantity && updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-xs transition-colors"
                            title="Diminuir quantidade"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-slate-200 text-xs px-1 font-mono">
                            {item.quantity} {item.unit}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity && updateQuantity(item.id, item.quantity + 1)}
                            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-xs transition-colors"
                            title="Aumentar quantidade"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Input for Selected Market */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] text-slate-500 truncate max-w-[80px]">
                        {currentMarket?.name}
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-slate-400">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={currentPrice > 0 ? currentPrice : ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            updatePrice(item.id, selectedMarketId, val);
                          }}
                          className="w-16 sm:w-20 bg-slate-950 border border-slate-800 focus:border-emerald-500 text-emerald-400 font-mono font-bold text-xs text-right px-1.5 py-1 rounded-lg outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Excluir item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* AI Cheaper Substitute Suggestion Pill */}
                {item.substituteSuggestion && !item.checked && (
                  <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start space-x-2">
                      <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-emerald-300">
                          Sugestão de Economia IA:{' '}
                          <span className="text-white font-bold">
                            {item.substituteSuggestion.substituteName}
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          {item.substituteSuggestion.reason}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => applySubstitute(item.id, item.substituteSuggestion!)}
                      className="flex items-center justify-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 shadow-md"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>
                        Trocar (Economize R$ {item.substituteSuggestion.savings.toFixed(2)})
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button (FAB) for Mobile Add Item */}
      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 rounded-full shadow-2xl flex items-center justify-center border-2 border-emerald-300 active:scale-95 transition-transform"
        title="Adicionar Item"
      >
        <Plus className="w-7 h-7 stroke-[3]" />
      </button>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-100">Adicionar Item à Lista</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nome do Produto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Leite Integral, Arroz, Sabão..."
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white px-3 py-2.5 rounded-xl text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Categoria</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white px-3 py-2.5 rounded-xl text-xs outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== 'Todas').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Unidade</label>
                  <select
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white px-3 py-2.5 rounded-xl text-xs outline-none"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white px-3 py-2.5 rounded-xl text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Preço Inicial ({currentMarket?.name})
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 19,90"
                    value={itemInitialPrice}
                    onChange={(e) => setItemInitialPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-emerald-400 font-mono font-bold px-3 py-2.5 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Market Modal */}
      {showAddMarketModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">Adicionar Supermercado</h3>
              <button
                onClick={() => setShowAddMarketModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMarket} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nome do Supermercado</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mercado do Bairro, Guanabara..."
                  value={newMarketName}
                  onChange={(e) => setNewMarketName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white px-3 py-2.5 rounded-xl text-sm outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMarketModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400"
                >
                  Criar Mercado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
