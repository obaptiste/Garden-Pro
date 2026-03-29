import { GoogleGenAI, Type } from "@google/genai";
import { GardenDesignSchema } from "../types/schemas";

function getAI() {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not found. Please configure it in the settings.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function analyzeGarden(
  photos: string[], // base64
  satelliteImage: string | null, // base64
  address: string
) {
  try {
    const ai = getAI();
    const model = "gemini-3.1-pro-preview";
    
    const prompt = `
      You are an expert UK garden designer. Analyze the provided photos of a garden at ${address}.
      ${satelliteImage ? "An aerial satellite view is also provided to help identify boundaries and scale." : ""}
      
      Identify:
      - Garden boundaries, lawn area, beds, paths, structures.
      - Textures, materials, and existing planting.
      
      Create 3 distinct garden design concepts for this space.
      For each concept, provide:
      1. A title and detailed description.
      2. Key features.
      3. Estimated total cost in GBP.
      4. A structured materials and equipment list with UK suppliers (Jewsons, Travis Perkins, local nurseries, Marshalls, etc.) and realistic 2025/2026 UK trade prices.
      5. A detailed image generation prompt for an illustrated birds-eye-view rendering.
      6. Three detailed image generation prompts for photorealistic perspective mockups.
      
      The birds-eye prompt should:
      - Describe an illustrated (not photorealistic), top-down birds-eye perspective.
      - Specify the garden's actual shape and dimensions inferred from the satellite view.
      - Include the proposed planting, hard landscaping, water features, seating areas etc.
      - Style: "hand-drawn watercolour garden plan illustration, birds-eye view, architectural plan style, soft colours".
  
      The perspective mockup prompts should:
      - Describe a photorealistic, high-quality perspective view of the garden from ground level.
      - Incorporate the specific design elements of the concept (e.g., "a modern slate patio with built-in cedar seating", "a lush cottage garden with winding gravel paths").
      - Style: "photorealistic architectural visualization, professional garden photography, golden hour lighting, 8k resolution, highly detailed".
    `;
  
    const parts = [
      { text: prompt },
      ...photos.map(p => ({ inlineData: { data: p.split(',')[1] || p, mimeType: "image/jpeg" } }))
    ];
  
    if (satelliteImage) {
      parts.push({ inlineData: { data: satelliteImage.split(',')[1] || satelliteImage, mimeType: "image/jpeg" } });
    }
  
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts }],
      config: {
        systemInstruction: "You are an expert UK garden designer. Provide concise, high-quality garden design concepts. Keep descriptions, key features, and material lists brief but informative to ensure the output remains within token limits.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
              estimatedCost: { type: Type.STRING },
              materials: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING, enum: ["plants", "hard_landscaping", "soil_amendments", "irrigation", "structures", "tools_equipment", "other"] },
                    item: { type: Type.STRING },
                    quantity: { type: Type.STRING },
                    estimatedUnitCost: { type: Type.STRING },
                    estimatedTotalCost: { type: Type.STRING },
                    supplier: { type: Type.STRING },
                    notes: { type: Type.STRING },
                  },
                  required: ["category", "item", "quantity", "estimatedUnitCost", "estimatedTotalCost"]
                }
              },
              birdsEyePrompt: { type: Type.STRING },
              mockupPrompts: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "description", "keyFeatures", "estimatedCost", "materials", "birdsEyePrompt", "mockupPrompts"]
          }
        }
      }
    });

  if (!response.text) {
      throw new Error("No response text from Gemini API.");
    }
    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Gemini API Error (analyzeGarden):", error);
    throw new Error(`Failed to analyze garden: ${error.message || "Unknown error"}`);
  }
}

export async function generateAIImage(prompt: string, size: "1K" | "2K" | "4K" = "1K") {
  try {
    const ai = getAI();
    const model = "gemini-3-pro-image-preview";
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: size
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated.");
  } catch (error: any) {
    console.error("Gemini API Error (generateAIImage):", error);
    throw new Error(`Failed to generate image: ${error.message || "Unknown error"}`);
  }
}
