"use client";

import { useState, useEffect, useRef } from "react";
import { useAppSelector } from "@/redux/hooks";
import { useDispatch } from "react-redux";
import { setIpAlert, setIpIssues } from "@/redux/slice/globalSlice";
import {
  useGetBuyboxDetailsQuery,
  useGetItemQuery,
  useLazyGetIpAlertQuery,
} from "@/redux/api/productsApi";
import dayjs from "dayjs";

import Alerts from "./prodComponents/new/alerts";
import BuyboxAnalysis from "./prodComponents/new/buybox-analysis";
import CalculationResults from "./prodComponents/new/calculation-results";
import Keepa from "./prodComponents/new/keepa";
import MarketAnalysis from "./prodComponents/new/market-analysis";
import MultiMarketAnalyzer from "./prodComponents/new/multi-market-analyzer";
import Nav from "./prodComponents/new/nav";
import NewOfferCount from "./prodComponents/new/new-offer-count";
import OffersAndSellerFeedback from "./prodComponents/new/offers-and-seller-feedback";
import ProductEligibility from "./prodComponents/new/product-eligibility";
import ProductOverview from "./prodComponents/new/product-overview";
import ProfitabilityCalculator from "./prodComponents/new/profitability-calculator";
import QuickInfo from "./prodComponents/new/quick-info";
import SalesAnalytics from "./prodComponents/new/sales-analytics";
import TopSellers from "./prodComponents/new/top-sellers";

interface ProductDetailsProps {
  asin: string;
  marketplaceId: number;
}

interface IpAlertState {
  setIpIssue: number;
  eligibility: boolean;
}

interface IpAlertData {
  // Add the interface for IP alert data based on your API response
  amazon_share_buybox?: number;
  private_label?: string;
  size?: string;
  size_text?: string;
  is_meltable?: boolean;
  has_variations?: boolean;
  ip_analysis?: {
    description?: string;
    issues?: number;
  };
  eligible_to_sell?: boolean;
  is_hazardous_or_dangerous?: boolean;
}

const ProductDetails = ({ asin, marketplaceId }: ProductDetailsProps) => {
  const dispatch = useDispatch();
  const [getIpAlert] = useLazyGetIpAlertQuery();
  const [ipData, setIpData] = useState<IpAlertData | null>(null);
  const [isLoadingIpData, setIsLoadingIpData] = useState(false);
  const previousMarketplaceId = useRef(marketplaceId);
  
  const { setIpIssue, eligibility } = useAppSelector(
    (state) =>
      (state?.global?.ipAlert as IpAlertState) || {
        setIpIssue: 0,
        eligibility: false,
      }
  );

  const [statStartDate, setStatStartDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [statEndDate, setStatEndDate] = useState(
    dayjs().add(1, "month").format("YYYY-MM-DD")
  );
  // RTK Query hooks for fetching product data
  const {
    data: buyboxDetailsData,
    isLoading: isLoadingBuybox,
  } = useGetBuyboxDetailsQuery({
    marketplaceId,
    itemAsin: asin,
  });

  const {
    data,
    error,
    isLoading: isLoadingItem,
  } = useGetItemQuery({
    marketplaceId,
    itemAsin: asin,
  });

  // Calculate pricing data for Nav component - exact values from old file
  const buyboxWinner = buyboxDetailsData?.data?.buybox?.find(
    (offer: any) => offer.is_buybox_winner
  );
  const buyboxWinnerPrice = buyboxWinner?.listing_price || 0;

  const fbaOffers = buyboxDetailsData?.data?.buybox?.filter(
    (offer: any) => offer.seller_type === "FBA"
  );
  const fbmOffers = buyboxDetailsData?.data?.buybox?.filter(
    (offer: any) => offer.seller_type === "FBM"
  );

  const lowestFBAPrice = fbaOffers?.length
    ? Math.min(...fbaOffers.map((o: any) => o.listing_price))
    : 0;
  const lowestFBMPrice = fbmOffers?.length
    ? Math.min(...fbmOffers.map((o: any) => o.listing_price))
    : 0;
  
  const monthlySales =
    data?.data?.sales_statistics?.estimated_sales_per_month?.amount;

  // Track marketplace changes
  useEffect(() => {
    if (previousMarketplaceId.current !== marketplaceId) {
      previousMarketplaceId.current = marketplaceId;

      // Reset states when marketplace changes
      setIpData(null);
      dispatch(
        setIpAlert({
          setIpIssue: 0,
          eligibility: false,
        })
      );
      dispatch(setIpIssues([] as any));
    }
  }, [marketplaceId, dispatch]);

  // Reset IP data immediately when ASIN changes
  useEffect(() => {
    setIpData(null);
    dispatch(
      setIpAlert({
        setIpIssue: 0,
        eligibility: false,
      })
    );
    dispatch(setIpIssues([] as any));
    setIsLoadingIpData(true);
  }, [asin, dispatch]);

  // Fetch IP data
  useEffect(() => {
    const fetchIpData = async () => {
      setIsLoadingIpData(true);
      try {
        const response = await getIpAlert({
          itemAsin: asin,
          marketplaceId,
          statStartDate,
          statEndDate,
        }).unwrap();
        
        dispatch(
          setIpAlert({
            setIpIssue: response?.data?.ip_analysis?.issues ?? 0,
            eligibility: response?.data?.eligible_to_sell ?? false,
          })
        );
        dispatch(setIpIssues(response?.data?.ip_analysis?.issues ?? []));
        setIpData(response.data as IpAlertData);
      } catch (error) {
        console.error("Error fetching IP alert:", error);
      } finally {
        setIsLoadingIpData(false);
      }
    };

    if (asin && marketplaceId) {
      fetchIpData();
    }
  }, [asin, marketplaceId, dispatch, getIpAlert, statStartDate, statEndDate]);

  if (error) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center">
        <h2 className="font-semibold">Error loading product details</h2>
        <p className="text-sm">
          Product might not be available in the selected country
        </p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4 min-h-[50dvh] md:min-h-[80dvh]">
      <Nav 
        product={data?.data}
        buyboxWinnerPrice={buyboxWinnerPrice}
        lowestFBAPrice={lowestFBAPrice}
        lowestFBMPrice={lowestFBMPrice}
        monthlySales={monthlySales}
        sellerCount={buyboxDetailsData?.data?.buybox?.length || 0}
        fbaSellers={fbaOffers?.length || 0}
        fbmSellers={fbmOffers?.length || 0}
        stockLevels={buyboxDetailsData?.data?.buybox?.reduce(
          (sum: number, seller: any) =>
            sum + (seller.stock_quantity || 0),
          0
        )}
      />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {/* column 1 */}
        <div className="flex flex-col gap-4">
          <ProductOverview 
            product={data?.data}
            asin={asin}
            marketplaceId={marketplaceId}
            isLoading={isLoadingItem}
          />
          <ProductEligibility 
            product={data?.data}
            ipData={ipData}
            eligibility={eligibility}
            setIpIssue={setIpIssue}
            asin={asin}
            marketplaceId={marketplaceId}
            isLoadingIpData={isLoadingIpData}
          />
          <QuickInfo />
        </div>

        {/* column 2 */}
        <div className="flex flex-col gap-4 col-span-2">
          <TopSellers />
          <CalculationResults />
        </div>
      </div>

      <div className="col-span-3">
        <MarketAnalysis 
          asin={asin}
          marketplaceId={marketplaceId}
          isLoading={isLoadingItem}
        />
      </div>
    </section>
  );
};

export default ProductDetails;