import React from 'react';
import {
  Store,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Award,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { FamilyRoom, Market, ShoppingItem } from '../types';

interface MarketComparatorProps {
  roomState: FamilyRoom | null;
  updatePrice: (itemId: string, marketId: string, price: number) => void;
}

export const MarketComparator: React.FC<MarketComparatorProps> = ({ roomState, updatePrice }) => {
  if (!roomState || !roomState.lists[0]) {
    return <div className="p-8 text-center text-slate-400">Carregando dados dos mercados...</div>;
  }

  const list = roomState.lists[0];
  const items = list.items;
  const markets = list.markets;

  if (items.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
        <Store className="w-10 h-10 text-slate-600 mx-auto" />
        <h3 className="text-base font-bold text-slate-300">Nenhum item na lista para comparar</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Adicione produtos na sua lista para gerar a matriz comparativa de preços entre supermercados.
        </p>
      </div>
    );
  }

  // Calculate Market Totals
  const marketTotals = markets.map((m) => {
    let total = 0;
    let pricedItemsCount = 0;

    items.forEach((item) => {
      const price = item.prices[m.id] || 0;
      if (price > 0) {
        total += price * item.quantity;
        pricedItemsCount++;
      }
    });

    return {
      market: m,
      total,
      pricedItemsCount,
      isComplete: pricedItemsCount === items.length,
    };
  });

  // Find lowest total among complete or available markets
  const validTotals = marketTotals.filter((mt) => mt.total > 0);
  const cheapestMarketTotal = validTotals.length > 0 ? Math.min(...validTotals.map((mt) => mt.total)) : 0;
  const highestMarketTotal = validTotals.length > 0 ? Math.max(...validTotals.map((mt) => mt.total)) : 0;
  const maxSavings = highestMarketTotal - cheapestMarketTotal;

  // Split Basket Optimizer calculation:
  // For each item, find its cheapest market, and group purchases
  const splitGroups: Record<string, { market: Market; items: { item: ShoppingItem; price: number }[] }> = {};
  let totalSplitCost = 0;

  items.forEach((item) => {
    let bestMarketId = '';
    let minPrice = Infinity;

    markets.forEach((m) => {
      const p = item.prices[m.id] || 0;
      if (p > 0 && p < minPrice) {
        minPrice = p;
        bestMarketId = m.id;
      }
    });

    if (bestMarketId && minPrice < Infinity) {
      if (!splitGroups[bestMarketId]) {
        const m = markets.find((mk) => mk.id === bestMarketId)!;
        splitGroups[bestMarketId] = { market: m, items: [] };
      }
      splitGroups[bestMarketId].items.push({ item, price: minPrice });
      totalSplitCost += minPrice * item.quantity;
    }
  });

  const extraSplitSavings = cheapestMarketTotal > 0 ? Math.max(0, cheapestMarketTotal - totalSplitCost) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Matriz de Preços
              </span>
              <h2 className="text-xl font-black text-slate-100">Comparador de Supermercados</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Compare o custo da sua cesta em cada mercado e descubra onde vale mais a pena comprar.
            </p>
          </div>

          {maxSavings > 0 && (
            <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-xl p-3 flex items-center space-x-3">
              <Award className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <p className="text-[11px] text-emerald-300 font-semibold">Economia Máxima de Cesta:</p>
                <p className="text-lg font-black text-white">R$ {maxSavings.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Market Totals Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketTotals.map(({ market, total, pricedItemsCount, isComplete }) => {
          const isCheapest = total > 0 && total === cheapestMarketTotal;

          return (
            <div
              key={market.id}
              className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between transition-all space-y-3 relative overflow-hidden ${
                isCheapest
                  ? 'border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {isCheapest && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-bold text-[10px] px-2.5 py-0.5 rounded-bl-lg flex items-center space-x-1">
                  <Award className="w-3 h-3" />
                  <span>Mais Barato</span>
                </div>
              )}

              <div>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: market.color }}
                  />
                  <h3 className="font-bold text-sm text-slate-100 truncate">{market.name}</h3>
                </div>

                <p className="text-[11px] text-slate-400 mt-1">
                  {pricedItemsCount} de {items.length} itens cotados
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 block">Total do Carrinho</span>
                <span className={`text-xl font-black ${isCheapest ? 'text-emerald-400' : 'text-slate-100'}`}>
                  {total > 0 ? `R$ ${total.toFixed(2)}` : 'Sem preços'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Split Basket Optimizer Box */}
      {Object.keys(splitGroups).length > 1 && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/40 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                Estratégia de Compra Dividida (R$ {totalSplitCost.toFixed(2)})
                {extraSplitSavings > 0 && (
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-emerald-500 text-slate-950 rounded-full">
                    Economiza + R$ {extraSplitSavings.toFixed(2)}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Dividindo os produtos nos mercados onde cada um está com menor preço, o custo total da família cai para o mínimo absoluto!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(splitGroups).map(({ market, items: groupItems }) => (
              <div key={market.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: market.color }} />
                    Comprar no {market.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {groupItems.length} itens
                  </span>
                </div>

                <ul className="text-xs text-slate-300 space-y-1 pl-2 border-l border-slate-800">
                  {groupItems.map(({ item, price }) => (
                    <li key={item.id} className="flex justify-between text-[11px]">
                      <span className="truncate pr-2">• {item.name} ({item.quantity}x)</span>
                      <strong className="text-emerald-400 font-mono shrink-0">
                        R$ {(price * item.quantity).toFixed(2)}
                      </strong>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
            <Store className="w-4 h-4 text-emerald-400" />
            <span>Matriz de Comparação por Item</span>
          </h3>
          <span className="text-xs text-slate-400">Passe o cursor ou clique para editar preços</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 min-w-[200px]">Produto / Qtd</th>
                <th className="py-3 px-3">Cat.</th>
                {markets.map((m) => (
                  <th key={m.id} className="py-3 px-4 text-right min-w-[120px]">
                    <span className="flex items-center justify-end space-x-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                      <span className="text-slate-200 font-bold">{m.name}</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {items.map((item) => {
                // Find lowest price for this item
                const validPrices = markets
                  .map((m) => item.prices[m.id] || 0)
                  .filter((p) => p > 0);
                const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
                const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-100">
                      <div>
                        <span>{item.name}</span>
                        <span className="text-slate-400 text-[11px] block">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {item.category}
                      </span>
                    </td>

                    {markets.map((m) => {
                      const price = item.prices[m.id] || 0;
                      const isCheapest = price > 0 && price === minPrice && validPrices.length > 1;
                      const isHighest = price > 0 && price === maxPrice && validPrices.length > 1 && minPrice !== maxPrice;

                      return (
                        <td key={m.id} className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <span className="text-[10px] text-slate-500">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0,00"
                              value={price > 0 ? price : ''}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                updatePrice(item.id, m.id, val);
                              }}
                              className={`w-16 bg-slate-950 border px-1.5 py-1 rounded text-right font-mono text-xs outline-none transition-colors ${
                                isCheapest
                                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                                  : isHighest
                                  ? 'border-red-500/40 text-red-400'
                                  : 'border-slate-800 text-slate-200'
                              }`}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
