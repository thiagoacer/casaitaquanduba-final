import { supabase } from './supabase';

interface SeasonConfig {
  id: string;
  name: string;
  months: number[];
  prices: {
    [key: string]: number;
  };
}

interface PricingConfigCache {
  cleaningFee: number;
  discountThresholdNights: number;
  discountPercentage: number;
  seasons: SeasonConfig[];
  lastFetch: number;
}

let pricingCache: PricingConfigCache | null = null;
const CACHE_DURATION = 5 * 60 * 1000;

const defaultConfig = {
  cleaningFee: 300,
  discountThresholdNights: 7,
  discountPercentage: 0.15,
  seasons: [
    {
      id: 'default-1',
      name: 'Alta Temporada',
      months: [12, 1, 2, 7],
      prices: {
        '1-6': 1200,
        '7-8': 1500,
        '9-10': 1800
      }
    },
    {
      id: 'default-2',
      name: 'Média Temporada',
      months: [3, 4, 5, 6, 8, 9, 10],
      prices: {
        '1-6': 900,
        '7-8': 1100,
        '9-10': 1300
      }
    },
    {
      id: 'default-3',
      name: 'Baixa Temporada',
      months: [11],
      prices: {
        '1-6': 700,
        '7-8': 900,
        '9-10': 1100
      }
    }
  ]
};

async function fetchPricingConfig(): Promise<PricingConfigCache> {
  try {
    const [configResult, seasonsResult, rulesResult] = await Promise.all([
      supabase.from('pricing_config').select('*'),
      supabase.from('pricing_seasons').select('*'),
      supabase.from('pricing_rules').select('*'),
    ]);

    if (!configResult.data || !seasonsResult.data || !rulesResult.data) {
      return { ...defaultConfig, lastFetch: Date.now() };
    }

    const getConfigValue = (key: string, defaultValue: number): number => {
      const config = configResult.data.find((c) => c.key === key);
      return config ? Number(config.value) : defaultValue;
    };

    const cleaningFee = getConfigValue('cleaning_fee', 300);
    const discountPercentage = getConfigValue('discount_percentage', 15) / 100;
    const discountThresholdNights = getConfigValue('discount_threshold_nights', 7);

    const seasonsMap = new Map<string, SeasonConfig>();

    seasonsResult.data.forEach((season) => {
      let months: number[] = [];

      if (season.name === 'Alta Temporada') {
        months = [12, 1, 2, 7];
      } else if (season.name === 'Média Temporada') {
        months = [3, 4, 5, 6, 8, 9, 10];
      } else if (season.name === 'Baixa Temporada') {
        months = [11];
      } else {
        if (season.start_month <= season.end_month) {
          for (let m = season.start_month; m <= season.end_month; m++) {
            months.push(m);
          }
        } else {
          for (let m = season.start_month; m <= 12; m++) {
            months.push(m);
          }
          for (let m = 1; m <= season.end_month; m++) {
            months.push(m);
          }
        }
      }

      seasonsMap.set(season.id, {
        id: season.id,
        name: season.name,
        months,
        prices: {},
      });
    });

    rulesResult.data.forEach((rule) => {
      const season = seasonsMap.get(rule.season_id);
      if (season) {
        const key = `${rule.min_guests}-${rule.max_guests}`;
        season.prices[key] = Number(rule.price_per_night);
      }
    });

    const seasons = Array.from(seasonsMap.values());

    return {
      cleaningFee,
      discountPercentage,
      discountThresholdNights,
      seasons,
      lastFetch: Date.now(),
    };
  } catch (error) {
    console.error('Error fetching pricing config:', error);
    return { ...defaultConfig, lastFetch: Date.now() };
  }
}

async function getPricingConfig(): Promise<PricingConfigCache> {
  if (pricingCache && Date.now() - pricingCache.lastFetch < CACHE_DURATION) {
    return pricingCache;
  }

  pricingCache = await fetchPricingConfig();
  return pricingCache;
}

export function clearPricingCache() {
  pricingCache = null;
}

export async function getSeasonForDate(date: Date): Promise<SeasonConfig> {
  const config = await getPricingConfig();
  const month = date.getMonth() + 1;

  const season = config.seasons.find(s => s.months.includes(month));
  return season || config.seasons[1] || config.seasons[0];
}

export function calculateNights(checkIn: Date, checkOut: Date): number {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export interface PriceBreakdown {
  pricePerNight: number;
  numNights: number;
  subtotal: number;
  cleaningFee: number;
  discountApplied: boolean;
  discountAmount: number;
  total: number;
  seasonName: string;
}

export async function calculatePrice(
  checkIn: Date,
  checkOut: Date,
  guestRange: string
): Promise<PriceBreakdown> {
  const config = await getPricingConfig();
  const numNights = calculateNights(checkIn, checkOut);

  let totalNightlyPrice = 0;
  const seasonPrices: { [key: string]: number } = {};

  const currentDate = new Date(checkIn);
  while (currentDate < checkOut) {
    const season = await getSeasonForDate(currentDate);
    const priceForNight = season.prices[guestRange] || 0;

    totalNightlyPrice += priceForNight;

    if (!seasonPrices[season.name]) {
      seasonPrices[season.name] = 0;
    }
    seasonPrices[season.name] += priceForNight;

    currentDate.setDate(currentDate.getDate() + 1);
  }

  const averagePricePerNight = totalNightlyPrice / numNights;
  const subtotal = totalNightlyPrice;

  const discountApplied = numNights >= config.discountThresholdNights;
  const discountAmount = discountApplied ? subtotal * config.discountPercentage : 0;

  const total = subtotal - discountAmount + config.cleaningFee;

  const primarySeason = Object.keys(seasonPrices).reduce((a, b) =>
    seasonPrices[a] > seasonPrices[b] ? a : b
  );

  return {
    pricePerNight: Math.round(averagePricePerNight),
    numNights,
    subtotal: Math.round(subtotal),
    cleaningFee: config.cleaningFee,
    discountApplied,
    discountAmount: Math.round(discountAmount),
    total: Math.round(total),
    seasonName: primarySeason
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}
