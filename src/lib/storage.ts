import fs from "fs/promises";
import path from "path";
import { Quote } from "../types/schemas";

const DATA_DIR = path.join(process.cwd(), "data");
const QUOTES_FILE = path.join(DATA_DIR, "quotes.json");

export interface IStorage {
  getQuotes(): Promise<Quote[]>;
  getQuote(id: string): Promise<Quote | null>;
  saveQuote(quote: Quote): Promise<void>;
  updateQuote(id: string, updates: Partial<Quote>): Promise<Quote | null>;
  deleteQuote(id: string): Promise<void>;
}

export class FileStorage implements IStorage {
  private readonly ready: Promise<void>;

  constructor() {
    this.ready = this.init();
  }

  private async init() {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.writeFile(QUOTES_FILE, JSON.stringify([]), { flag: "wx" });
    } catch (e: any) {
      if (e.code !== "EEXIST") throw e;
    }
  }

  async getQuotes(): Promise<Quote[]> {
    await this.ready;
    const data = await fs.readFile(QUOTES_FILE, "utf-8");
    return JSON.parse(data);
  }

  async getQuote(id: string): Promise<Quote | null> {
    const quotes = await this.getQuotes();
    return quotes.find((q) => q.id === id) || null;
  }

  async saveQuote(quote: Quote): Promise<void> {
    const quotes = await this.getQuotes();
    const index = quotes.findIndex((q) => q.id === quote.id);
    if (index !== -1) {
      quotes[index] = quote;
    } else {
      quotes.push(quote);
    }
    await fs.writeFile(QUOTES_FILE, JSON.stringify(quotes, null, 2));
  }

  async updateQuote(id: string, updates: Partial<Quote>): Promise<Quote | null> {
    const quotes = await this.getQuotes();
    const index = quotes.findIndex((q) => q.id === id);
    if (index === -1) return null;

    quotes[index] = { ...quotes[index], ...updates, updatedAt: new Date().toISOString() };
    await fs.writeFile(QUOTES_FILE, JSON.stringify(quotes, null, 2));
    return quotes[index];
  }

  async deleteQuote(id: string): Promise<void> {
    const quotes = await this.getQuotes();
    const filtered = quotes.filter((q) => q.id !== id);
    await fs.writeFile(QUOTES_FILE, JSON.stringify(filtered, null, 2));
  }
}

export const storage: IStorage = new FileStorage();
