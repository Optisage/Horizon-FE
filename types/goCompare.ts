export interface SearchRecord {
    id: number
    asinOrUpc: string
    searchType: string
    searchDate: string
    amazonPrice: string
    country: string
    countryCode: string
    countryFlag: string
    store: string
    storeLogo: string
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
    id: number;
    name: string;
    flag: string;
    short_code: string;
    created_at: CreatedAt;
    stores? : Store[]
}

export interface ApiSearchResponseItem {
    id: string;
    user_id: number;
    query: string;
    amazon_price: string;
    number_of_results: number;
    type_of_search: string;
    created_at: CreatedAt;
    updated_at: string;
    store: Store;
    country: Country;
    marketplace: string | null;
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

export interface QuickSearchData {
    amazon_product: AmazonProduct | null;
    opportunities: ProductObj[];
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
