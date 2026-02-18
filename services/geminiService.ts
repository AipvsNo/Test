
import { GoogleGenAI, Type } from "@google/genai";
import { Student, PerformanceAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeStudentPerformance = async (student: Student): Promise<PerformanceAnalysis | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following student performance data and provide a professional assessment for educators:
      Name: ${student.name}
      GPA: ${student.gpa}
      Attendance: ${student.attendance}%
      Grade Level: ${student.gradeLevel}
      Current Notes: ${student.notes}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["summary", "strengths", "areasForImprovement", "recommendations"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as PerformanceAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};
