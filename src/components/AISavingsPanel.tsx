import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRightLeft,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  DollarSign,
  Zap,
  Loader2,
} from 'lucide-react';
import { FamilyRoom, ShoppingItem, SubstituteSuggestion } from '../types';

interface AISavingsPanelProps {
  roomState: FamilyRoom | null;
  applySubstitute: (itemId: string, substitute: SubstituteSuggestion) => void;
}

export const AISavingsPanel: React.FC<AISavingsPanelProps> = ({ roomState, applySubstitute }) => {
  const [loadingAI, setLoadingAI] = useState(false);
  const [suggestions, setSuggestions] = useState<(SubstituteSuggestion & { itemId: string })[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<{
    monthlyTip: string;
    recommendedMarket: string;
    savingsPotential: number;
    inflationAlert: string;
  } | null>(null);

  useEffect(() => {
    if (!roomState || !roomState.lists[0]) return;

    const list = roomState.lists[0];
    const items = list.items.filter((i) => !i.checked);

    if (items.length === 0) return;

    setLoadingAI(true);

    // Call server AI endpoint
    fetch('/api/ai/substitutes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.suggestions) {
          setSuggestions(data.suggestions);
        }
      })
      .catch((err) => console.error('Failed to fetch AI substitutes:', err))
      .finally(() => setLoadingAI(false));

    // Call server AI basket analysis
    fetch('/api/ai/analyze-basket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ list, room: roomState }),
    })
      .then((res) => res.json())
      .then((data) => setAiAnalysis(data))
      .catch((err) => console.error('Failed to fetch AI basket analysis:', err));
  }, [roomState]);

  if (!roomState || !roomState.lists[0]) {
    return <div className="p-8 text-center text-slate-400">Carregando sugestões inteligentes...</div>;
  }

  const list = roomState.lists[0];
  const items = list.items;

  // Calculate total potential savings from suggestions
  const totalPotentialSavings = suggestions.reduce((sum, s) => sum + (s.savings || 0), 0);

  const handleApplyAll = () => {
    suggestions.forEach((s) => {
      applySubstitute(s.itemId, s);
    });
    setSuggestions([]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top AI Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  Assistente Inteligente de Economia
                </span>
                <h2 className="text-xl font-black text-slate-100">Sugestões de Substituição</h2>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                A IA analisa o histórico de marcas, embalagens e preços de atacado para trocar por itens equivalentes mais baratos.
              </p>
            </div>
          </div>

          {suggestions.length > 0 && (
            <button
              onClick={handleApplyAll}
              className="flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 shrink-0"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Aplicar Todas as Substituições (R$ {totalPotentialSavings.toFixed(2)})</span>
            </button>
          )}
        </div>
      </div>

      {/* AI Strategy Insights Card */}
      {aiAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
              <Lightbulb className="w-4 h-4" />
              <span>Dica Principal do Mês</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">{aiAnalysis.monthlyTip}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
              <TrendingDown className="w-4 h-4" />
              <span>Recomendação de Mercado</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">{aiAnalysis.recommendedMarket}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Alerta de Variação / Inflação</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">{aiAnalysis.inflationAlert}</p>
          </div>
        </div>
      )}

      {/* Suggestions List */}
      {loadingAI ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-300">Analisando histórico e buscando melhores marcas substitutas...</p>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-100">Sua lista já está otimizada!</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Todos os itens pendentes na lista já correspondem às melhores opções de custo-benefício encontradas.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Oportunidades de Economia Encontradas ({suggestions.length})</span>
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {suggestions.map((s) => {
              const item = items.find((i) => i.id === s.itemId);
              if (!item) return null;

              return (
                <div
                  key={s.itemId}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-slate-400 line-through">
                        {item.name}
                      </span>
                      <span className="text-xs text-emerald-400">→</span>
                      <span className="text-sm font-bold text-slate-100">{s.substituteName}</span>
                    </div>

                    <p className="text-xs text-slate-300">{s.reason}</p>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-1">
                      <span>Categoria: {item.category}</span>
                      <span>•</span>
                      <span>
                        Preço estimado:{' '}
                        <strong className="text-emerald-400 font-mono">
                          R$ {s.estimatedPrice.toFixed(2)}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Economia</span>
                      <span className="text-base font-black text-emerald-400">
                        + R$ {s.savings.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => applySubstitute(s.itemId, s)}
                      className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors shadow-md"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Trocar Item</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
