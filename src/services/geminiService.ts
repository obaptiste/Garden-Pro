import { GoogleGenAI, Type } from "@google/genai";
import { GardenDesignSchema } from "../types/schemas";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function analyzeGarden(
  photos: string[], // base64
  satelliteImage: string | null, // base64
  address: string
) {
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
    
    The birds-eye prompt should:
    - Describe an illustrated (not photorealistic), top-down birds-eye perspective.
    - Specify the garden's actual shape and dimensions inferred from the satellite view.
    - Include the proposed planting, hard landscaping, water features, seating areas etc.
    - Style: "hand-drawn watercolour garden plan illustration, birds-eye view, architectural plan style, soft colours".
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
            birdsEyePrompt: { type: Type.STRING }
          },
          required: ["title", "description", "keyFeatures", "estimatedCost", "materials", "birdsEyePrompt"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateBirdsEyeImage(prompt: string) {
  const model = "gemini-3.1-flash-image-preview";
  const response = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}
