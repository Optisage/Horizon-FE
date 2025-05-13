export interface ProductDetailsProps {
  asin: string;
  marketplaceId: number;
}

export interface BuyboxItem {
  seller: string;
  seller_id: string;
  seller_type: string;
  rating: number;
  review_count: number;
  listing_price: number;
  weight_percentage: number;
  stock_quantity: number;
  is_buybox_winner: boolean;
  fulfillmentType: string;
  currency: string;
  seller_feedback: {
    avg_price: number;
    percentage_won: number;
    last_won: string;
  };
}

export interface MarketAnalysisDataPoint {
  date: string;
  price: number;
}

export interface MarketAnalysisData {
  buybox: MarketAnalysisDataPoint[];
  amazon: MarketAnalysisDataPoint[];
}

export interface MergedDataPoint {
  date: string;
  buyBox: number | null;
  amazon: number | null;
}

export interface ProfitabilityData {
  referralFee: number;
  fulfillmentType: string;
  fullfillmentFee: number;
  closingFee: number;
  storageFee: number;
  prepFee: string | number;
  shippingFee: string | number;
  digitalServicesFee: number;
  miscFee: string | number;
  roi: number;
  minRoi: number;
  minProfit: number;
  profitAmount: number;
  maxCost: number;
  totalFees: number;
  vatOnFees: number;
  discount: number;
  profitMargin: number;
  breakevenSalePrice: number;
  estimatedAmzPayout: number;
}

export interface Product {
  upc?: string;
  asin: string;
  image?: string;
  title: string;
  rating?: number;
  reviews?: number;
  category?: string;
  brand?: string;
  modelNumber?: string;
  vendor?: string;
  size?: string;
  color?: string;
  dimensions?: {
    height: { value: number; unit: string };
    length: { value: number; unit: string };
    weight: { value: number; unit: string };
    width: { value: number; unit: string };
  };
  classifications?: {
    displayName: string;
    classificationId: string;
  }[];
  sales_statistics?: {
    estimated_sales_per_month: {
      currency: string;
      amount: number;
    };
    number_of_sellers: number;
    sales_analytics: {
      net_revenue: {
        amount: number;
        percentage: number;
        currency: string;
      };
      price: {
        amount: number;
        percentage: number;
        currency: string;
      };
      monthly_units_sold: {
        amount: number;
        percentage: number;
      };
      daily_units_sold: {
        amount: number;
        percentage: number;
      };
      monthly_revenue: {
        amount: number;
        percentage: number;
        currency: string;
      };
    };
    date_first_available: string;
    seller_type: string;
  };
  buybox_timeline?: {
    seller: string;
    timestamp: string;
  }[];
}
