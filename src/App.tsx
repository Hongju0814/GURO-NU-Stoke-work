/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { INITIAL_STROKE_PROTOCOL } from './constants';
import StrokeTree from './components/StrokeTree';
import { Stethoscope, ClipboardList, Code, FileJson, BrainCircuit, Loader2, Send, Download } from 'lucide-react';
import { analyzePatientCase, PatientAnalysisResult } from './services/aiService';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'json'>('map');
  const [erNoteInput, setErNoteInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<PatientAnalysisResult | null>(null);

  const handleAiAnalysis = async () => {
    if (!erNoteInput.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzePatientCase(erNoteInput);
      setAiResult(result);
    } catch (err) {
      alert('AI 분석 중 오류가 발생했습니다. API 키나 입력을 확인해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 overflow-hidden font-sans">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-tight">Stroke Clinical Guide</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] animate-pulse">2026 AHA/ASA Updated</p>
          </div>
        </div>

        <nav className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'map' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Decision Map
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'json' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileJson className="w-4 h-4" />
            Protocol Source (JSON)
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400">CURRENT GUIDELINE</span>
            <span className="text-xs font-semibold text-slate-600">AHA/ASA 2024 (Updated)</span>
          </div>
        </div>
      </header>

      {/* Main Content Areas */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Clinical Input Area */}
        <div className="w-1/3 border-r border-slate-700 bg-slate-800/50 flex flex-col p-6 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-100">환자 증상/기록 입력 (ER NOTE)</h2>
          </div>
          
          <textarea
            value={erNoteInput}
            onChange={(e) => setErNoteInput(e.target.value)}
            placeholder="응급실 내원 환자의 기초 정보나 진료 기록을 적어주세요. 
예: 65세 여환, 2시간 전 우측 편마비 발생, 구급차 내 혈당 120, 현재 NIHSS 12... "
            className="flex-1 min-h-[300px] bg-slate-900/50 border border-slate-600 rounded-2xl p-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors resize-none mb-4 font-mono leading-relaxed"
          />

          <button
            onClick={handleAiAnalysis}
            disabled={isAnalyzing || !erNoteInput.trim()}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 py-4 rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-900/20 active:scale-[0.98]"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                지침 분석 중...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                AI 지침 맵핑 시작
              </>
            )}
          </button>

          {aiResult && (
            <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-indigo-400">분석된 주요 지표</h3>
                <button 
                  onClick={() => setAiResult(null)}
                  className="text-[10px] bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 px-2 py-0.5 rounded transition-colors"
                >
                  분석 초기화
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-slate-900/50 p-2 rounded-lg">
                  <div className="text-[9px] text-slate-500">LKW</div>
                  <div className="text-xs font-bold text-indigo-200">{aiResult.extractedData.lkw}</div>
                </div>
                <div className="bg-slate-900/50 p-2 rounded-lg">
                  <div className="text-[9px] text-slate-500">NIHSS</div>
                  <div className="text-xs font-bold text-indigo-200">{aiResult.extractedData.nihss}</div>
                </div>
                <div className="bg-slate-900/50 p-2 rounded-lg">
                  <div className="text-[9px] text-slate-500">GLUCOSE</div>
                  <div className="text-xs font-bold text-indigo-200">{aiResult.extractedData.glucose}</div>
                </div>
                <div className="bg-slate-900/50 p-2 rounded-lg">
                  <div className="text-[9px] text-slate-500">CURRENT</div>
                  <div className="text-xs font-bold text-emerald-400">STAGE {aiResult.currentStageIdx + 1}</div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic">"한 번 더 맵의 JSON 데이터와 대조해 보세요."</p>
            </div>
          )}
        </div>

        {/* Right Side: Visual Flow / JSON */}
        <main className="flex-1 overflow-hidden relative bg-slate-50">
          {activeTab === 'map' ? (
            <StrokeTree data={INITIAL_STROKE_PROTOCOL} aiFocusIdx={aiResult?.currentStageIdx} patientAnalysis={aiResult} />
          ) : (
            <div className="h-full bg-slate-950 p-6 overflow-auto font-mono">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Protocol Schema</div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        const dataStr = JSON.stringify(INITIAL_STROKE_PROTOCOL, null, 2);
                        const blob = new Blob([dataStr], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = "master-stroke-protocol-2026.json";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold border border-indigo-500 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/40"
                    >
                      <Download className="w-5 h-5" />
                      마스터 가이드라인 JSON 다운로드
                    </button>
                  </div>
                </div>
                <pre className="text-emerald-500/80 text-sm bg-slate-900/50 p-6 rounded-xl border border-slate-800 shadow-2xl">
                  {JSON.stringify(INITIAL_STROKE_PROTOCOL, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer Info Banner */}
      <footer className="h-10 bg-slate-100 border-t border-slate-200 flex items-center px-6 shrink-0 z-20">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Live Guideline Engine Active</span>
            </div>
            <span className="text-[10px] text-slate-400 border-l border-slate-300 pl-4">
              Designed for Medical Education • Not for direct clinical diagnosis
            </span>
          </div>
          <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">
            Neuro-Pathways v1.0.0
          </div>
        </div>
      </footer>
    </div>
  );
}
