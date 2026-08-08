import React from 'react';
import {
  Users,
  TrendingDown,
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  PieChart as PieIcon,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { FamilyRoom } from '../types';

interface AnalyticsDashboardProps {
  roomState: FamilyRoom | null;
  userName: string;
}

const HISTORICAL_SPEND_DATA = [
  { month: 'Mar', gastoReal: 1480, gastoEconomico: 1250, economia: 230 },
  { month: 'Abr', gastoReal: 1520, gastoEconomico: 1290, economia: 230 },
  { month: 'Mai', gastoReal: 1610, gastoEconomico: 1380, economia: 230 },
  { month: 'Jun', gastoReal: 1590, gastoEconomico: 1340, economia: 250 },
  { month: 'Jul', gastoReal: 1650, gastoEconomico: 1390, economia: 260 },
  { month: 'Ago', gastoReal: 1580, gastoEconomico: 1310, economia: 270 },
];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ roomState, userName }) => {
  if (!roomState) {
    return <div className="p-8 text-center text-slate-400">Carregando painel da família...</div>;
  }

  const activities = roomState.activities || [];
  const members = roomState.members || [];
  const monthlySavings = roomState.monthlySavings || 142.8;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Painel da Família
              </span>
              <h2 className="text-xl font-black text-slate-100">Grupo #{roomState.code}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Monitore a economia acumulada da família e veja quem está comprando no mercado em tempo real.
            </p>
          </div>

          <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-xl p-3.5 flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <p className="text-[11px] text-emerald-300 font-semibold">Economia do Mês no Grupo:</p>
              <p className="text-2xl font-black text-white">R$ {monthlySavings.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] text-slate-400 block font-medium">Membros Ativos no Grupo</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-100">{members.length} membros</span>
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-[10px] text-slate-500">Sincronização entre múltiplos celulares</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] text-slate-400 block font-medium">Economia Média Mensal</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-400">R$ 245,00</span>
            <TrendingDown className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-[10px] text-slate-500">Comparando atacadistas e marcas próprias</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] text-slate-400 block font-medium">Ações no Grupo Hoje</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-100">{activities.length} ações</span>
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-[10px] text-slate-500">Registros em tempo real na lista</p>
        </div>
      </div>

      {/* Chart: Historical Expenditures and Savings */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-100">Histórico de Gastos & Economia (R$)</h3>
            <p className="text-xs text-slate-400">Comparativo do total gasto no mercado tradicional vs no EconomizaJá</p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
              <span className="text-slate-400">Mercado Comum</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-emerald-400 font-bold">Com EconomizaJá</span>
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={HISTORICAL_SPEND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="gastoReal" fill="#475569" radius={[4, 4, 0, 0]} name="Gasto Padrão" />
              <Bar dataKey="gastoEconomico" fill="#10b981" radius={[4, 4, 0, 0]} name="Gasto com Economia" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Family Members List & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Integrantes da Família</span>
            </h3>
            <span className="text-xs text-emerald-400 font-mono font-bold">#{roomState.code}</span>
          </div>

          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                    {member.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-200">
                    {member} {member === userName && <span className="text-slate-500 font-normal">(Você)</span>}
                  </span>
                </div>

                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Online
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed Column */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Atividades em Tempo Real da Lista</span>
            </h3>
            <span className="text-xs text-slate-400">Atualiza automaticamente</span>
          </div>

          {activities.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">Nenhuma atividade recente registrada.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-none">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {act.userName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200">
                      <strong className="text-emerald-400 font-semibold">{act.userName}</strong> {act.action}
                    </p>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
