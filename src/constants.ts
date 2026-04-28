export interface ProtocolNode {
  name: string;
  simpleName: string;
  description: string;
  type: 'action' | 'decision' | 'diagnosis' | 'treatment';
  evidence?: string;
  criteria?: string[];
  children?: ProtocolNode[];
  isNew?: boolean;
  question?: string;
  clinicalNote?: string;
  detailedReference?: string;
  
  // NEW: Fields to show how treatment changes per patient
  requiredPatientData?: string[]; // Data needed for this step
  decisionLogic?: {
    condition: string;
    targetAction: string;
  }[];
}

export const INITIAL_STROKE_PROTOCOL: ProtocolNode = {
  name: "2026 AHA/ASA Acute Ischemic Stroke Comprehensive Guideline",
  simpleName: "2026 뇌졸중 통합 임상 경로 (Full Protocol)",
  description: "현장 이송부터 급성기 치료, 합병증 관리까지의 전체 표준 지침입니다.",
  type: "diagnosis",
  question: "환자의 임상 경로 추적을 시작하시겠습니까?",
  requiredPatientData: ["이송 수단", "현장 중증도"],
  children: [
    {
      name: "Pre-hospital Phase",
      simpleName: "1단계: 이송 및 현장 선별",
      description: "골든타임 확보를 위한 MSU 및 이송 지침입니다.",
      type: "action",
      evidence: "COR 1",
      requiredPatientData: ["LVO suspected (RACE >= 5)", "Available MSU"],
      decisionLogic: [
        { condition: "RACE >= 5 (LVO 의심)", targetAction: "재관류 센터(CSC)로 직이송" },
        { condition: "MSU 가용 시", targetAction: "이송 중 혈전용해제 투여 시작" }
      ],
      children: [
        {
          name: "Arrival Stabilization",
          simpleName: "2단계: 응급실 초기 평가",
          description: "병원 도착 즉시 수행해야 하는 표준 평가지침입니다.",
          type: "action",
          requiredPatientData: ["Fingerstick Glucose", "SpO2"],
          decisionLogic: [
            { condition: "Glucose < 60 mg/dL", targetAction: "포도당 투여 후 증상 재평가 (Stroke Mimic 배제)" },
            { condition: "SpO2 < 94%", targetAction: "산소 공급 (Target > 94%)" }
          ],
          children: [
            {
              name: "Urgent neuroimaging",
              simpleName: "3단계: 응급 영상 진단 (NCCT/MRI)",
              description: "뇌출혈 배제 및 허혈성 병변 범위를 확인합니다.",
              type: "decision",
              requiredPatientData: ["CT Hemorrhage status", "ASPECTS"],
              decisionLogic: [
                { condition: "Hemorrhage (+)", targetAction: "뇌출혈(ICH) 관리 경로로 즉시 전환" },
                { condition: "Hemorrhage (-)", targetAction: "재관류 치료(IVT/EVT) 적합성 평가 시작" }
              ],
              children: [
                {
                  name: "AIS Confirmed",
                  simpleName: "뇌경색 진단 (AIS) 확진",
                  description: "혈관 재개통 치료를 위한 적합성 평가 단계입니다.",
                  type: "diagnosis",
                  requiredPatientData: ["LKW (Last Known Well)"],
                  decisionLogic: [
                    { condition: "LKW < 4.5h", targetAction: "정맥 내 혈전용해술(IVT) 즉시 고려" },
                    { condition: "LKW 4.5h ~ 9h", targetAction: "Extended Window IVT 평가 (MRI DWI-FLAIR mismatch 필요)" },
                    { condition: "LKW 6h ~ 24h", targetAction: "동맥 내 혈전제거술(EVT) 단독 고려" }
                  ],
                  children: [
                    {
                      name: "IV Thrombolysis (IVT)",
                      simpleName: "4단계: 정맥 내 혈전용해술 (IVT)",
                      description: "약물로 혈관을 뚫는 단계입니다.",
                      type: "decision",
                      requiredPatientData: ["BP (Blood Pressure)", "Active bleeding status"],
                      decisionLogic: [
                        { condition: "BP > 185/110 mmHg", targetAction: "라베탈롤 등으로 혈압 강하 전까지 투여 금기" },
                        { condition: "NIHSS <= 5 (Nondisabling)", targetAction: "IVT 대신 21일간 DAPT(Aspirin+Clopidogrel) 권장" }
                      ],
                      children: [
                        {
                          name: "EVT Assessment",
                          simpleName: "5단계: 동맥 내 혈전제거술 (EVT) 평가",
                          description: "기구적 재관류 치료 적합성을 평가합니다.",
                          type: "action",
                          requiredPatientData: ["ASPECTS score", "Vessel status (CTA)"],
                          decisionLogic: [
                            { condition: "ASPECTS 6-10", targetAction: "강력 권고 (COR 1)" },
                            { condition: "ASPECTS 3-5", targetAction: "2026년 확장 지침에 따라 시행 권고 (COR 1 - NEW)" },
                            { condition: "Basilar Occlusion", targetAction: "증상 발생 24시간까지 가능" }
                          ],
                          children: [
                            {
                              name: "Comprehensive Care",
                              simpleName: "6단계: 입원 및 후기 합병증 관리",
                              description: "재활 및 영양 공급 지침입니다.",
                              type: "treatment",
                              requiredPatientData: ["Swallow status", "Mobility"],
                              decisionLogic: [
                                { condition: "Dysphagia (+)", targetAction: "비위관 영양 또는 연하 재활 투입" },
                                { condition: "Immobility", targetAction: "IPC(공기압박) 및 조기 재활(24h 이후) 시작" }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
