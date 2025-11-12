// CoinGecko API service for real-time cryptocurrency prices
export interface CoinGeckoPrice {
  livepeer: {
    usd: number;
    ngn: number;
    eur: number;
    gbp: number;
    ghs: number;
    zar: number;
    kes: number;
  };
}

export class CoinGeckoService {
  private static readonly BASE_URL = 'https://api.coingecko.com/api/v3';
  private static readonly LPT_ID = 'livepeer';
  
  private static priceCache: {
    data: CoinGeckoPrice | null;
    timestamp: number;
  } = {
    data: null,
    timestamp: 0
  };
  
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  static async getLPTPrice(): Promise<CoinGeckoPrice> {
    const now = Date.now();
    if (this.priceCache.data && (now - this.priceCache.timestamp) < this.CACHE_DURATION) {
      return this.priceCache.data;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `${this.BASE_URL}/simple/price?ids=${this.LPT_ID}&vs_currencies=usd,ngn,eur,gbp,ghs,zar,kes`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Livepeer-App/1.0'
          },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('CoinGecko rate limit hit, using cached data');
          return this.priceCache.data || this.getFallbackPrices();
        }
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json() as CoinGeckoPrice;
      this.priceCache = { data, timestamp: now };
      return data;
    } catch (error) {
      console.error('Error fetching LPT price from CoinGecko:', error);
      return this.priceCache.data || this.getFallbackPrices();
    }
  }

  private static getFallbackPrices(): CoinGeckoPrice {
    return {
      livepeer: {
        usd: 6.01,
        ngn: 11017,
        eur: 6.64,
        gbp: 5.70,
        ghs: 89.50,
        zar: 112.30,
        kes: 950.25
      }
    };
  }

  static async getLPTPriceInCurrency(currency: string): Promise<number> {
    const prices = await this.getLPTPrice();
    return prices.livepeer[currency.toLowerCase() as keyof typeof prices.livepeer] || prices.livepeer.usd;
  }

  static async getConversionRate(currency: string): Promise<number> {
    const prices = await this.getLPTPrice();
    const usdPrice = prices.livepeer.usd;
    const targetPrice = prices.livepeer[currency.toLowerCase() as keyof typeof prices.livepeer] || usdPrice;
    return targetPrice / usdPrice;
  }

  static getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      NGN: "₦",
      USD: "$",
      EUR: "€",
      GBP: "£",
      GHS: "₵",
      ZAR: "R",
      KES: "KSh",
    };
    return symbols[currency] || "$";
  }
}

export const coinGeckoService = CoinGeckoService;
export default coinGeckoService;
