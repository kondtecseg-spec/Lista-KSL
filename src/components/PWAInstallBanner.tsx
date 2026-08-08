import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Share,
  PlusSquare,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { getAppUrl } from '../utils/url';

interface PWAInstallProps {
  showModalOnly?: boolean;
  onCloseModal?: () => void;
}

export const PWAInstallModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, triggerInstall } = usePWAInstall();
  const [installedSuccess, setInstalledSuccess] = useState(false);

  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentUrl = getAppUrl();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenNewTab = () => {
    window.open(currentUrl, '_blank');
  };

  const handleInstallClick = async () => {
    const success = await triggerInstall();
    if (success) {
      setInstalledSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white shadow-2xl space-y-6 relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 shrink-0">
              <Smartphone className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                Aplicativo PWA Oficial
              </span>
              <h3 className="font-extrabold text-xl text-slate-100 leading-tight">
                Instalar EconomizaJá no Celular
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Benefits list */}
        <div className="space-y-2 bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl text-xs text-slate-300">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-1">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Vantagens do App Instalado:</span>
          </div>
          <ul className="space-y-1.5 pl-2">
            <li className="flex items-center space-x-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Acesso direto da tela inicial como app nativo sem abrir navegador</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Mais rápido, tela inteira sem barras e consome menos memória</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Sincronização em tempo real enquanto estiver no supermercado</span>
            </li>
          </ul>
        </div>

        {/* Direct Link & QR Code Section */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Link Atual do Aplicativo:</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-bold">
              Ativo
            </span>
          </div>

          {/* QR Code and Direct Link row */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <div className="bg-white p-2 rounded-xl shadow-md shrink-0 flex flex-col items-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                  currentUrl
                )}`}
                alt="QR Code do App"
                className="w-28 h-28 object-contain"
                loading="lazy"
              />
              <span className="text-[9px] font-bold text-slate-700 mt-1">Aponte a câmera</span>
            </div>

            <div className="flex-1 space-y-2.5 w-full">
              <p className="text-[11px] text-slate-300 leading-snug">
                Aponte a câmera do seu celular para o QR Code ao lado ou abra em uma nova aba:
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-mono px-2.5 py-1.5 rounded-lg flex-1 outline-none truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center space-x-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 shadow-sm"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <button
                onClick={handleOpenNewTab}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                <span>Abrir em Nova Aba do Navegador</span>
              </button>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-[11px] text-amber-300/90 leading-tight">
            <strong>Dica de acesso:</strong> Caso esteja acessando o preview em modo de desenvolvimento (`ais-dev`), abra o aplicativo no navegador do celular utilizando o botão <strong>Compartilhar (Share)</strong> no menu superior direito do editor para gerar o link público oficial!
          </div>
        </div>

        {/* Dynamic Installation instructions depending on Device */}
        {installedSuccess ? (
          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-6 text-center space-y-2">
            <Check className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-slate-100">Aplicativo Instalado com Sucesso!</h4>
            <p className="text-xs text-slate-300">
              O EconomizaJá já está disponível na tela inicial do seu celular.
            </p>
          </div>
        ) : isInstallable ? (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center space-x-2 text-xs text-emerald-300">
              <Download className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Seu navegador no Android permite a instalação direta em 1 clique!</span>
            </div>
            <button
              onClick={handleInstallClick}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-2xl text-sm flex items-center justify-center space-x-2 shadow-xl shadow-emerald-500/25 transition-all"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>Instalar Agora no Android</span>
            </button>
          </div>
        ) : isIOS ? (
          /* iOS Safari instructions */
          <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <h4 className="font-bold text-xs text-slate-200 flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Instruções para iPhone / iPad (iOS Safari):</span>
            </h4>
            <ol className="text-xs text-slate-300 space-y-2.5 pl-2">
              <li className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  No rodapé do navegador Safari, toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima <Share className="w-3.5 h-3.5 inline text-emerald-400" />).
                </span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Role a lista de opções para baixo e selecione <strong>Adicionar à Tela de Início</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-emerald-400" />).
                </span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>Toque em <strong>Adicionar</strong> no canto superior direito. Pronto!</span>
              </li>
            </ol>
          </div>
        ) : (
          /* Android Chrome / Samsung Internet / Generic Android instructions */
          <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-200 flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Instalação no Android (Chrome, Samsung Internet, Edge):</span>
              </h4>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                Android PWA
              </span>
            </div>
            <ol className="text-xs text-slate-300 space-y-2.5 pl-2">
              <li className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  No navegador do celular, toque nos <strong>três pontos (⋮)</strong> no canto superior direito do Chrome.
                </span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Toque na opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                </span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Confirme em <strong>"Instalar"</strong>. O ícone do app aparecerá na gaveta de aplicativos do seu Android!
                </span>
              </li>
            </ol>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export const PWAFloatingBanner: React.FC<{ onOpenModal: () => void }> = ({ onOpenModal }) => {
  const { isInstalled } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 shadow-2xl text-white space-y-3 animate-bounce-subtle">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
              <span>Instalar no Celular</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500 text-slate-950">
                Grátis
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Use como aplicativo nativo no supermercado sem barras de navegador!
            </p>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white p-1 text-xs"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center space-x-2 pt-1">
        <button
          onClick={onOpenModal}
          className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md transition-colors"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Baixar / Instalar App</span>
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition-colors"
        >
          Agora Não
        </button>
      </div>
    </div>
  );
};
