import React, { useState, useEffect } from 'react';
import { ProtocolNode } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ArrowLeft, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Stethoscope,
  Info,
  Clock,
  Sparkles,
  Download,
  Brain,
  ClipboardList,
  FileJson
} from 'lucide-react';
import { PatientAnalysisResult } from '../services/aiService';

interface StrokeTreeProps {
  data: ProtocolNode;
  aiFocusIdx?: number;
  patientAnalysis?: PatientAnalysisResult | null;
}

const StrokeTree: React.FC<StrokeTreeProps> = ({ data, aiFocusIdx, patientAnalysis }) => {
  const [history, setHistory] = useState<ProtocolNode[]>([data]);
  const currentNode = history[history.length - 1];

  const [isExporting, setIsExporting] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  // Sync with AI Analysis
  useEffect(() => {
    if (typeof aiFocusIdx === 'number') {
      const newHistory: ProtocolNode[] = [];
      let tempNode: ProtocolNode | undefined = data;
      
      for (let i = 0; i <= aiFocusIdx; i++) {
        if (tempNode) {
          newHistory.push(tempNode);
          tempNode = tempNode.children?.[0]; // 기본 경로 탐색
        }
      }
      if (newHistory.length > 0) setHistory(newHistory);
    }
  }, [aiFocusIdx, data]);

  const handleNext = (node: ProtocolNode) => {
    // Add timestamp to the stage in history
    setHistory([...history, { ...node, metadata: { timestamp: new Date().toISOString() } } as any]);
  };

  const handleBack = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1));
    }
  };

  const handleReset = () => {
    setHistory([data]);
  };

  const exportMasterProtocol = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "aha-asa-2026-master-protocol.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCaseLog = () => {
    setIsExporting(true);
    
    // Detailed Clinical Report JSON
    const caseLog = {
      clinicalIntelligenceReport: {
        documentId: `AIS-CASE-${new Date().getTime()}`,
        generatedAt: new Date().toISOString(),
        guidelineAuthority: "2026 AHA/ASA Updated Protocol",
        analystRole: "Medical Student / Neurology Resident Aide"
      },
      patientClinicalProfile: patientAnalysis ? {
        summaryFromAI: patientAnalysis.summary,
        detectedMetrics: patientAnalysis.extractedData,
        aiReasoning: patientAnalysis.reasoning,
        suggestedNextStep: patientAnalysis.suggestedPlan
      } : {
        status: "Manual mapping performed",
        context: "No AI clinical note provided"
      },
      evidenceBasedClinicalPath: {
        totalStagesReached: history.length,
        isPathComplete: !currentNode.children,
        stages: history.map((node, index) => ({
          sequence: index + 1,
          terminology: {
            technical: node.name,
            commonName: node.simpleName
          },
          clinicalGoal: node.description,
          actionCategory: node.type,
          decisionSupport: {
            evidenceGrading: node.evidence || "Level C (Consensus)",
            is2026Specific: !!node.isNew,
            expertClinicalNote: node.clinicalNote || "Follow hospital standard SOP",
            detailedReference: node.detailedReference || "Refer to major trials (B_PROUD, BEST-MSU, etc.)"
          },
          verifiedChecklist: node.criteria || [],
          entryTimestamp: (node as any).metadata?.timestamp || new Date().toISOString()
        }))
      },
      referenceLibrary2026: {
        importantTimeTargets: {
          doorToImaging: "Goal < 20-25 mins",
          doorToNeedle: "Goal < 45-60 mins",
          doorToPuncture: "Goal < 90-120 mins"
        },
        pharmacologyQuickRef: {
          firstLineAgent: "Tenecteplase (TNK) 0.25 mg/kg bolus",
          maxDose: "25 mg",
          advantage: "Lower DIDO time, single injection, no infusion pump needed."
        },
        extendedWindowInclusion: [
          "DWI-FLAIR mismatch (WAKE-UP trial)",
          "Perfusion-core mismatch (EXTEND trial)",
          "Basilar MT up to 24h (BAOCHE evidence)"
        ],
        emergencyChecklist: [
          "ABCs confirmation",
          "Fingerstick glucose (Rule out hypoglycemia)",
          "Oxygen SpO2 > 94% target (Avoid excessive O2)",
          "Emergency CT angiography (CTA)"
        ]
      },
      educationalValue: {
        learningGoal: "Mastering the decision pathway between IVT and EVT transition.",
        dailyTakeaway: "Every minute delay leads to loss of 1.9 million neurons.",
        aiAssistanceNote: "Mapped raw clinical note to structured hierarchical protocol."
      }
    };

    const dataStr = JSON.stringify(caseLog, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `detailed-clinical-report-${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowExportSuccess(true);
    setTimeout(() => {
      setShowExportSuccess(false);
      setIsExporting(false);
    }, 3000);
  };

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col items-center p-4 md:p-8 overflow-y-auto font-sans">
      {/* Friendly Progress Tracker & Export */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-8 overflow-x-auto pb-4 gap-4 no-scrollbar">
        <div className="flex items-center gap-2">
          {history.map((node, idx) => (
            <React.Fragment key={idx}>
              <div 
                className={`flex flex-col items-center shrink-0 transition-all duration-500 ${
                  idx === history.length - 1 ? 'scale-110 opacity-100' : 'opacity-40'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                  node.type === 'action' ? 'bg-indigo-500 text-white' :
                  node.type === 'decision' ? 'bg-amber-500 text-white' :
                  node.type === 'diagnosis' ? 'bg-red-500 text-white' :
                  'bg-emerald-500 text-white'
                }`}>
                  {idx + 1}
                </div>
              </div>
              {idx < history.length - 1 && (
                <div className="w-4 h-0.5 bg-slate-300 shrink-0 mt-[-2px]" />
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={exportMasterProtocol}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 transition-all shrink-0 shadow-sm"
          >
            <FileJson className="w-4 h-4 text-indigo-500" />
            마스터 지침 JSON
          </button>

          <button 
            onClick={exportCaseLog}
            disabled={isExporting}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 shadow-sm ${
              showExportSuccess 
                ? 'bg-emerald-500 text-white border-emerald-400' 
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {showExportSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                추출 완료
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                환자 진료기록 JSON 추출
              </>
            )}
          </button>
          
          <button
            onClick={handleReset}
            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
            title="새 케이스 시작"
          >
            <AlertTriangle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Card */}
      <div className="w-full max-w-2xl shrink-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNode.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-200 overflow-hidden"
          >
            {/* Card Header */}
            <div className={`p-6 md:p-8 ${
              currentNode.type === 'action' ? 'bg-indigo-50/50' :
              currentNode.type === 'decision' ? 'bg-amber-50/50' :
              currentNode.type === 'diagnosis' ? 'bg-red-50/50' :
              'bg-emerald-50/50'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    currentNode.type === 'action' ? 'bg-indigo-100 text-indigo-700' :
                    currentNode.type === 'decision' ? 'bg-amber-100 text-amber-700' :
                    currentNode.type === 'diagnosis' ? 'bg-red-100 text-red-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {currentNode.type}
                  </span>
                  {currentNode.isNew && (
                    <span className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-bold animate-bounce">
                      <Sparkles className="w-3 h-3" /> 2026 최신 지침
                    </span>
                  )}
                </div>
                
                {currentNode.evidence && (
                  <div className="text-[10px] font-mono font-bold text-indigo-400/70">
                    GRADE: {currentNode.evidence}
                  </div>
                )}
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-tight">
                {currentNode.simpleName}
              </h2>
              <p className="text-slate-500 mt-2 text-sm md:text-base font-medium">
                {currentNode.description}
              </p>
            </div>

            {/* Patient Data & Decision Logic (NEW) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 md:px-8 py-6 border-b border-slate-100">
              {currentNode.requiredPatientData && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ClipboardList className="w-3 h-3 text-indigo-500" /> REQUIRED VALUES
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentNode.requiredPatientData.map((dataKey, idx) => (
                      <span key={idx} className="bg-white px-2 py-1 rounded-md border border-slate-200 text-[11px] font-bold text-slate-600 shadow-sm">
                        {dataKey}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {currentNode.decisionLogic && (
                <div className="bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100/50">
                  <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Brain className="w-3 h-3" /> ADAPTIVE LOGIC
                  </h3>
                  <div className="space-y-2">
                    {currentNode.decisionLogic.map((logic, idx) => (
                      <div key={idx} className="text-[11px] leading-tight">
                        <span className="text-indigo-600 font-black">IF:</span> <span className="text-slate-500">{logic.condition}</span>
                        <div className="text-slate-900 font-bold mt-0.5 ml-4">→ {logic.targetAction}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Checklist Section */}
            {currentNode.criteria && (
              <div className="p-6 md:p-8 border-b border-slate-100">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ClipboardList className="w-3 h-3" /> CLINICAL CHECKLIST
                </h3>
                <ul className="space-y-4">
                  {currentNode.criteria.map((item, idx) => (
                    <li key={idx} className="flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-slate-600 font-semibold text-sm md:text-base leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Medical Note Section */}
            {currentNode.clinicalNote && (
              <div className="px-6 md:px-8 py-5 bg-indigo-600 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 opacity-80" />
                  <span className="text-[10px] font-black uppercase tracking-tighter text-indigo-100">Medical Insight</span>
                </div>
                <p className="text-sm md:text-base font-bold leading-relaxed">
                  {currentNode.clinicalNote}
                </p>
                {currentNode.detailedReference && (
                  <p className="text-[10px] mt-2 opacity-70 font-medium italic">
                    Reference: {currentNode.detailedReference}
                  </p>
                )}
              </div>
            )}

            {/* Choice Section */}
            <div className="p-6 md:p-8 bg-slate-50 flex flex-col gap-4">
              {currentNode.question && (
                <div className="flex items-center gap-2 text-indigo-500 mb-2">
                  <HelpCircle className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">{currentNode.question}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentNode.children ? currentNode.children.map((child, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNext(child)}
                    className="flex items-center justify-between p-5 bg-white border-2 border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/5 transition-all text-left shadow-sm group"
                  >
                    <div className="pr-4">
                      <span className="text-[10px] font-black text-slate-300 block mb-1 group-hover:text-indigo-400 uppercase tracking-tighter">Next Milestone</span>
                      <span className="font-bold text-slate-900 group-hover:text-indigo-700 leading-tight">{child.simpleName}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </button>
                )) : (
                  <div className="col-span-1 md:col-span-2 flex flex-col gap-3">
                    <button
                      onClick={exportCaseLog}
                      className="flex items-center justify-center gap-2 p-5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-900/10"
                    >
                      <Download className="w-5 h-5" />
                      최종 지침 준수 보고서 (Full JSON) 저장
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex items-center justify-center gap-2 p-4 bg-slate-200 text-slate-600 rounded-2xl hover:bg-slate-300 transition-all font-bold"
                    >
                      새로운 케이스 시작
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Footer */}
        <div className="flex justify-between mt-6 px-4">
          <button
            onClick={handleBack}
            disabled={history.length === 1}
            className={`flex items-center gap-2 text-xs font-black transition-all uppercase tracking-widest ${
              history.length === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ArrowLeft className="w-3 h-3" /> 이전 단계
          </button>
          
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
            Time is Brain
          </div>
        </div>
      </div>

       {/* Educational Disclaimer */}
       <div className="w-full max-w-2xl mt-12 bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0" />
        <p className="text-[11px] text-blue-800 leading-normal font-medium">
          본 가이드는 2026 AHA/ASA 가이드라인을 기반으로 의과대학생의 실습 교육을 위해 제작되었습니다. 전문적인 의학적 판단의 보조 자료로만 활용해 주세요.
        </p>
      </div>
    </div>
  );
};

export default StrokeTree;
