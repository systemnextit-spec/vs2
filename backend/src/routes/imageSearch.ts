import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getTenantData } from '../services/tenantDataService';
import multer from 'multer';

export const imageSearchRouter = Router();

// Initialize Gemini AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log('[Image Search] Gemini AI initialized successfully');
} else {
  console.log('[Image Search] Warning: GEMINI_API_KEY not found');
}

// Configure multer for memory storage (no disk write needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
    }
  },
});

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  galleryImages?: string[];
  category?: string;
  stock?: number;
  sku?: string;
  status?: string;
}

interface ProductAnalysis {
  productName: string;
  category: string;
  description: string;
  estimatedPrice: string;
  features: string[];
  keywords: string[];
  confidence: number;
}

// Analyze image using Gemini Vision API
async function analyzeImageWithGemini(imageBase64: string, mimeType: string): Promise<ProductAnalysis> {
  if (!genAI) {
    throw new Error('Gemini AI not initialized. Please check GEMINI_API_KEY.');
  }

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
  });

  const prompt = `Analyze this product image and provide detailed information in JSON format. 
  You are an expert product analyst. Extract as much information as possible.
  
  Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
  {
    "productName": "Full product name with brand if visible",
    "category": "Product category (e.g., Electronics, Clothing, Accessories, Home & Kitchen, etc.)",
    "description": "Detailed description of the product including color, material, size if apparent",
    "estimatedPrice": "Estimated price range in BDT (e.g., '৳500-৳1000')",
    "features": ["feature1", "feature2", "feature3"],
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
    "confidence": 0.85
  }
  
  Be specific about brand names, model numbers, colors, and any visible text on the product.
  Keywords should include synonyms and related search terms that users might use.`;

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    },
    { text: prompt },
  ]);

  const response = result.response;
  const text = response.text();
  
  // Extract JSON from response (handle potential markdown wrapping)
  let jsonStr = text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  try {
    return JSON.parse(jsonStr) as ProductAnalysis;
  } catch (e) {
    console.error('[Image Search] Failed to parse Gemini response:', text);
    // Return fallback analysis
    return {
      productName: 'Unknown Product',
      category: 'General',
      description: 'Unable to analyze product details',
      estimatedPrice: 'N/A',
      features: [],
      keywords: [],
      confidence: 0,
    };
  }
}

// Find matching products from store inventory
function findMatchingProducts(
  products: Product[],
  analysis: ProductAnalysis,
  limit: number = 10
): { product: Product; score: number }[] {
  const searchTerms = [
    analysis.productName.toLowerCase(),
    analysis.category.toLowerCase(),
    ...analysis.keywords.map(k => k.toLowerCase()),
    ...analysis.features.map(f => f.toLowerCase()),
  ];

  const scored = products
    .filter(p => (!p.status || p.status === 'Active') && (p.stock === undefined || p.stock > 0))
    .map(product => {
      let score = 0;
      const productText = [
        product.name,
        product.description || '',
        product.category || '',
        product.sku || '',
      ].join(' ').toLowerCase();

      // Calculate relevance score
      for (const term of searchTerms) {
        if (term && productText.includes(term)) {
          score += 10;
        }
        // Partial word matching
        const words = term.split(/\s+/);
        for (const word of words) {
          if (word.length > 2 && productText.includes(word)) {
            score += 3;
          }
        }
      }

      // Exact name match bonus
      if (product.name.toLowerCase().includes(analysis.productName.toLowerCase())) {
        score += 50;
      }

      // Category match bonus
      if (product.category?.toLowerCase() === analysis.category.toLowerCase()) {
        score += 20;
      }

      return { product, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

// Image search endpoint
imageSearchRouter.post('/analyze', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (!genAI) {
      return res.status(503).json({ error: 'Image search service is not available' });
    }

    // Convert image buffer to base64
    const imageBase64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    console.log(`[Image Search] Analyzing image for tenant: ${tenantId}, size: ${req.file.size} bytes`);

    // Analyze image with Gemini
    const analysis = await analyzeImageWithGemini(imageBase64, mimeType);
    console.log('[Image Search] Analysis result:', JSON.stringify(analysis, null, 2));

    // Fetch tenant's products
    const products = await getTenantData<Product[]>(tenantId, 'products') || [];
    console.log(`[Image Search] Found ${products.length} products for tenant`);

    // Find matching products
    const matchingProducts = findMatchingProducts(products, analysis);
    console.log(`[Image Search] Found ${matchingProducts.length} matching products`);

    res.json({
      success: true,
      analysis,
      matchingProducts: matchingProducts.map(m => ({
        ...m.product,
        matchScore: m.score,
      })),
      totalMatches: matchingProducts.length,
      hasMatches: matchingProducts.length > 0,
    });
  } catch (error) {
    console.error('[Image Search] Error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze image',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Health check for image search service
imageSearchRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: genAI ? 'healthy' : 'degraded',
    geminiAvailable: !!genAI,
    timestamp: new Date().toISOString(),
  });
});

export default imageSearchRouter;
