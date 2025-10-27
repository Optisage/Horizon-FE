import { NextRequest, NextResponse } from 'next/server';
import { ProductDetailsResponse } from '@/types/goCompare';

// Mock data based on the sample response provided
const mockProductDetails: ProductDetailsResponse = {
    status: 200,
    message: "Product retrieved successfully",
    data: {
        product_name: "Glow in The Dark Stars Stickers for Ceiling, Adhesive 200pcs 3D Glowing Stars and Moon for Kids Bedroom,Luminous Stars Stickers Create a Realistic Starry Sky,Room Decor,Wall Stickers",
        current_price: 11.39,
        avg_amazon_90_day_price: null,
        gross_roi: 0,
        sales_rank: 478,
        avg_3_month_sales_rank: 536,
        asin: "B07MR13QL6",
        number_of_sellers: 2,
        monthly_sellers: 2,
        amazon_on_listing: false,
        product_url: "https://amazon.ca/dp/B07MR13QL6",
        image_url: "https://m.media-amazon.com/images/I/81LL6W7areS.jpg",
        amazon_fees: 0,
        estMonthlySales: 500
    },
    responseCode: "00",
    meta: []
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const asin = searchParams.get('asin');
        const marketplaceId = searchParams.get('marketplace_id');

        if (!asin || !marketplaceId) {
            return NextResponse.json(
                {
                    status: 400,
                    message: "Missing required parameters: asin and marketplace_id",
                    data: null,
                    responseCode: "01",
                    meta: []
                },
                { status: 400 }
            );
        }

        // In a real implementation, you would fetch this data from your backend
        // For now, we'll return mock data
        // You can modify the mock data based on the ASIN and marketplace_id if needed

        // Create a dynamic response based on the ASIN
        const dynamicResponse: ProductDetailsResponse = {
            ...mockProductDetails,
            data: {
                ...mockProductDetails.data,
                asin: asin,
                product_url: `https://amazon.ca/dp/${asin}`,
                // Add some variation based on marketplace_id
                current_price: marketplaceId === '6' ? 11.39 : 12.99,
                sales_rank: Math.floor(Math.random() * 1000) + 100,
                avg_3_month_sales_rank: Math.floor(Math.random() * 1000) + 200,
                estMonthlySales: Math.floor(Math.random() * 1000) + 200
            }
        };

        return NextResponse.json(dynamicResponse);
    } catch (error) {
        console.error('Error fetching product details:', error);
        return NextResponse.json(
            {
                status: 500,
                message: "Internal server error",
                data: null,
                responseCode: "99",
                meta: []
            },
            { status: 500 }
        );
    }
}
