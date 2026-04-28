import { GoogleGenAI } from "@google/genai";
import { INITIAL_STROKE_PROTOCOL, ProtocolNode } from "./constants";

export interface PatientAnalysisResult {
  currentStageIdx: number;
  extractedData: {
    lkw: string;
    glucose: string;
    nihss: string;
    aspects?: string;
    lvoStatus?: string;
  };
  summary: string;
  reasoning: string;
  suggestedPlan: string;
}

export async function analyzePatientCase(erNote: string): Promise<PatientAnalysisResult> {
  const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

  const prompt = `
    You are a Neurology Senior Resident. Analyze the following ER admission note for an acute ischemic stroke (AIS) case.
    Based on the "2026 AHA/ASA AIS Guidelines", map the patient's information to our clinical path.
    
    ER Note:
    """
    ${erNote}
    """

    Protocol Structure Overview:
    Stage 1: Pre-hospital/EMS
    Stage 2: ED Arrival & Stabilization (Initial assessment, Glucose, Airway)
    Stage 3: Neuroimaging (CT/MRI results, ASPECTS)
    Stage 4: IV Thrombolysis (IVT selection/TNK decision)
    Stage 5: EVT Assessment (Large Vessel Occlusion candidate)
    Stage 6: Post-acute / In-patient care

    Output strictly in the following JSON format:
    {
      "currentStageIdx": number (0-5, where the patient is currently at),
      "extractedData": {
        "lkw": "Last Known Well time found",
        "glucose": "Blood glucose level",
        "nihss": "NIHSS score if found",
        "aspects": "ASPECTS score if mentioned",
        "lvoStatus": "LVO presence summary"
      },
      "summary": "Brief clinical summary",
      "reasoning": "Why you assigned this stage based on 2026 rules",
      "suggestedPlan": "Next immediate step"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // Safety check for markdown code blocks
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    throw error;
  }
}
