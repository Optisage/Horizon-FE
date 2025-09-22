"use client";

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

const ProductDetails = () => {
  return (
    <section className="flex flex-col gap-4 min-h-[50dvh] md:min-h-[80dvh]">
      {/* rounded-xl bg-white p-4 lg:p-5 */}
      <Nav />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* column 1 */}
        <div className="flex flex-col gap-4">
          <ProductOverview />
         <ProductEligibility />
          <QuickInfo />
        </div>

        {/* column 2 */}
        <div className="flex flex-col gap-4 col-span-2">
            <TopSellers />
           
           <CalculationResults />
          
          
        </div>

        {/* column 3 
        <div className="flex flex-col gap-4">
          <SalesAnalytics />
          <ProfitabilityCalculator />
        
          <BuyboxAnalysis />
        </div>
        */}

        {/* calculation results */}
       
      </div>

      <div className=" col-span-3">
        <MarketAnalysis />
      </div>
    </section>
  );
};

export default ProductDetails;

