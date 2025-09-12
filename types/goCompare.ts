export interface SearchRecord {
    id: number
    asinOrUpc: string
    searchType: string
    searchDate: string
    amazonPrice: string
    country: string
    countryCode: string
    countryId?: number;
    countryFlag: string
    stores: Store[]
    // storeLogo: string
    results: number
}

interface CreatedAt {
    human: string;
    string: string;
    timestamp: number;
    locale: string;
}

interface Store {
    id: string;
    name: string;
    logo: string;
    marketplace_id: string | null;
    country_id: number;
    created_at: CreatedAt;
}

export interface Country {
    id: string;
    name: string;
    flag: string;
    short_code: string;
}

export interface CountryResponse {
    status: number;
    message: string;
    data: Country[];
    meta: any[];
}

export interface ApiSearchResponseItem {
    id: number;
    asin_upc: string;
    search_type: string;
    search_date: string;
    amazon_price: number | null;
    country: {
        country: string;
        id: number;
    };
    stores: any[];
    results_count: number;
    query: string;
    type_of_search: string;
    created_at: {
        string: string;
    };
    number_of_results: number;
}


export interface AmazonProduct {
    id: string;
    store_id: string;
    store_name: string;
    asin: string;
    sku: string;
    product_name: string;
    page_url: string;
    image_url: string;
    seller: string;
    pricing: {
        current_price: number;
        original_price: number | null;
        avg_amazon_90_day_price: number | null;
        amazon_fees: number | null;
    };
    metrics: {
        sales_rank: number | null;
        avg_3_month_sales_rank: number | null;
        number_of_sellers: number | null;
        monthly_sellers: number | null;
        amazon_on_listing: boolean;
        estimated_monthly_sales: number | null;
        avg_amazon_90_day_price: number | null
    };
    ratings: {
        rating: string;
        rating_display: string;
        review_count: number;
    };
    competition: string;
    created_at: string;
    updated_at: string;
    store: Store;
}

// New QuickSearchResult interface for the updated API
export interface QuickSearchResult {
    store_name: string;
    product_name: string;
    asin: string;
    price: string;
    currency: string;
    country: string;
    product_url: string;
    image_url: string;
    created_at: string;
}

export interface QuickSearchResponse {
    status: number;
    message: string;
    data: QuickSearchResult[];
    meta: any[];
}

// Product Details API interfaces
export interface ProductDetails {
    product_name: string;
    current_price: number;
    avg_amazon_90_day_price: number | null;
    gross_roi: number;
    sales_rank: number;
    avg_3_month_sales_rank: number;
    asin: string;
    number_of_sellers: number;
    monthly_sellers: number;
    amazon_on_listing: boolean;
    product_url: string;
    image_url: string;
    amazon_fees: number;
    estMonthlySales: number;
}

export interface ProductDetailsResponse {
    status: number;
    message: string;
    data: ProductDetails;
    responseCode: string;
    meta: any[];
}

// Keep the old interface for backward compatibility
export interface QuickSearchData {
    amazon_product: AmazonProduct | null;
    opportunities: ProductObj[];
}

export interface ReverseSearchData {
    id: string
    display_message: string
    reason: string
    amazon_product: AmazonProduct | null;
    scraped_product: {
        id: string
        name: string
        price: string
        url: string
        image: string
        brand: string
        currency: string
        store: {
            name: string
            logo: string
        }
    }
    price_difference: number;
    roi_percentage: number;
    profit_margin: number;
    source: string;
}

export type ProductObj = {
    scraped_product: {
        id: string
        product_name: string
        image_url: string
        product_url: string
        store_logo_url: string
        price: {
            amount: number
            currency: string
            formatted: string
        }
        original_price?: {
            amount: number
            currency: string
            formatted: string
        }
    }
    price_difference: number
    roi_percentage: number
    profit_margin: number
    estimated_profit: number
    amazon_fees: number
    potential_monthly_sales: number
    store: {
        id: string
        name: string
    }
    links: {
        amazon_product: string
        scraped_product: string
    }
    confidence: number
}


export type ReverseAmazon = {
    asin: string
    sku: string
    product_name: string
    price: number,
    url: string
    image: string
    currency: string
    store: {
        name: string
        logo: string
    }
}

export type ReverseAmazonScraped = {
    id: string
    name: string
    price: string
    url: string
    image: string
    brand: string
    currency: string
    store: {
        name: string
        logo: string
    }
}