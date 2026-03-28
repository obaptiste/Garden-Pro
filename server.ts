import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { storage } from "./src/lib/storage";
import { QuoteSchema } from "./src/types/schemas";
import { analyzeGarden, generateBirdsEyeImage } from "./src/services/geminiService";
import { getSatelliteImage } from "./src/services/mapsService";
import { v4 as uuidv4 } from "uuid";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get("/api/quotes", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });

  app.get("/api/quotes/:id", async (req, res) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) return res.status(404).json({ error: "Quote not found" });
      res.json(quote);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quote" });
    }
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      const { clientName, propertyAddress, postcode, photos, notes, tags } = req.body;
      
      // 1. Get satellite image
      const satelliteImage = await getSatelliteImage(`${propertyAddress}, ${postcode}`);
      
      // 2. Analyze with Gemini
      const designs = await analyzeGarden(photos, satelliteImage, `${propertyAddress}, ${postcode}`);
      
      // 3. Generate initial birds-eye images (optional, could be done on demand)
      // For now, we'll just store the prompts and generate one if requested.

      const quote = {
        id: uuidv4(),
        clientName,
        propertyAddress,
        postcode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "draft",
        photos,
        satelliteImageUrl: satelliteImage,
        notes,
        designs,
        selectedDesign: null,
        birdsEyeImageUrls: [],
        totalEstimatedCost: "Calculating...",
        scheduledDate: null,
        completionDate: null,
        tags: tags || [],
      };

      await storage.saveQuote(QuoteSchema.parse(quote));
      res.status(201).json(quote);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create quote" });
    }
  });

  app.patch("/api/quotes/:id", async (req, res) => {
    try {
      const updated = await storage.updateQuote(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update quote" });
    }
  });

  app.delete("/api/quotes/:id", async (req, res) => {
    try {
      await storage.deleteQuote(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete quote" });
    }
  });

  app.post("/api/generate-illustration", async (req, res) => {
    try {
      const { prompt } = req.body;
      const imageUrl = await generateBirdsEyeImage(prompt);
      res.json({ imageUrl });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate illustration" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
