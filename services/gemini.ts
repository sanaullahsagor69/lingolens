import { GoogleGenAI, Type, Modality } from "@google/genai";
import { TranslationResult, TargetLanguage } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey:"AIzaSyCkivoxc3FgYNHLrxH-X2lgqnD8Gc7k7ho" });

const SYSTEM_INSTRUCTION = `
Identity: You are "LingoLens", created by Sana Ullah Sagar.

Dynamic Response Rule:
Always prioritize the TARGET LANGUAGE (the language the user wants to learn/translate into) for all explanations and insights.

Tasks:
1. Source Analysis: Identify the input language. If Romanized (e.g. Banglish), decode it.
2. Target Translation: Provide the translation in the TARGET language's Native Script and its Romanized/Phonetic version.
3. Target-Centric Insight: Explain the cultural vibe/context in the TARGET Language (e.g., if Target is Spanish, explain in Spanish).
4. User's Guide: Provide a tiny 1-line summary in the User's INPUT language so they understand the context.
5. Global Link: Show how this emotion is expressed in another major global language.

Output Structure:
- Source Native Script: The input in its original alphabet.
- Source Phonetic: Romanized input.
- Meaning: Standard meaning in Target Language.
- Target Script: Native script of the Target Language.
- Target Phonetic: Romanized Target Language.
- Cultural Insight (Target): Explanation in Target Language.
- Cultural Insight (English): Explanation in English.
- Input Language Summary: 1-line summary in Input Language.

Branding:
- Always maintain that this is LingoLens by Sana Ullah Sagar.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    meaning: {
      type: Type.STRING,
      description: "Standard meaning of the phrase in the target language.",
    },
    sourceNativeScript: {
      type: Type.STRING,
      description: "The phrase in its original source alphabet/script (e.g., Bengali, Hindi).",
    },
    sourcePhoneticScript: {
      type: Type.STRING,
      description: "The Phonetic/Romanized version of the source phrase.",
    },
    targetScript: {
      type: Type.STRING,
      description: "The translation in the Target Language's native script.",
    },
    targetPhonetic: {
      type: Type.STRING,
      description: "The Phonetic/Romanized version of the target translation.",
    },
    culturalNuance: {
      type: Type.STRING,
      description: "Cultural Insight (The Vibe) explained in English.",
    },
    culturalInsightTarget: {
      type: Type.STRING,
      description: "Cultural Insight explained in the TARGET Language.",
    },
    inputLanguageSummary: {
      type: Type.STRING,
      description: "A tiny 1-line summary in the User's INPUT language.",
    },
    intensity: {
      type: Type.INTEGER,
      description: "Intensity rating 1-10.",
    },
    equivalent: {
      type: Type.STRING,
      description: "A similar idiom or expression in the target language.",
    },
    detectedContext: {
      type: Type.STRING,
      description: "Origin: The specific region, dialect, or language origin.",
    },
    susInsight: {
      type: Type.STRING,
      description: "A special cultural tip from the developer's perspective.",
    },
    sagorGlobalLink: {
      type: Type.OBJECT,
      description: "The 'Sagor' Global Link: How this emotion is expressed in another major global language.",
      properties: {
        language: { type: Type.STRING },
        phrase: { type: Type.STRING },
        context: { type: Type.STRING, description: "Brief explanation of the global link." }
      },
      required: ["language", "phrase", "context"]
    },
    transcription: {
      type: Type.STRING,
      description: "Verbatim transcription if audio is provided.",
    }
  },
  required: [
    "meaning", 
    "sourceNativeScript", 
    "sourcePhoneticScript", 
    "targetScript", 
    "targetPhonetic",
    "culturalNuance", 
    "culturalInsightTarget", 
    "inputLanguageSummary",
    "intensity", 
    "equivalent", 
    "detectedContext", 
    "sagorGlobalLink", 
    "susInsight"
  ],
};

export const analyzeText = async (text: string, targetLanguage: TargetLanguage): Promise<TranslationResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following text: "${text}". Target Language: ${targetLanguage}.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(response.text);

    return {
      originalText: text,
      targetLanguage,
      ...data,
    };
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const analyzeAudio = async (audioBase64: string, mimeType: string, targetLanguage: TargetLanguage): Promise<TranslationResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-native-audio-preview-12-2025",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBase64
            }
          },
          {
            text: `Analyze this audio. Target Language: ${targetLanguage}. Provide transcription and cultural analysis.`
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(response.text);

    return {
      originalText: "Audio Input", // Placeholder
      targetLanguage,
      ...data,
    };
  } catch (error) {
    console.error("Audio Analysis failed:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Puck" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data generated");
    }

    return base64Audio;
  } catch (error) {
    console.error("TTS failed:", error);
    throw error;
  }
};

// Helper to decode and play audio in browser
export const playAudioBuffer = async (base64Audio: string) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
  } catch (e) {
    console.error("Error playing audio", e);
  }
};