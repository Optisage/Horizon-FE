const CalculationResults = () => {
  return (
    <div className="rounded-xl h-full bg-white lg:col-span-2 md:grid grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#D7CACA] min-h-[610px] font-semibold text-sm">
      {/* left column */}
      <div className="p-6 lg:p-8 min-h-[610px]">
        <div className="text-[#828995]">
          <div className="mb-10 flex items-center gap-5 justify-between">
            <span className="flex items-center gap-2">
              <p className="text-[#8E949F] text-lg">Profit</p>
              <span className="bg-primary size-4 rounded-full" />
            </span>
            <h5 className="text-[#3C485C] font-bold text-2xl lg:text-3xl xl:text-[32px]">
              C$ 9.13
            </h5>
          </div>

          <div className="border-y border-[#E5E5E5] py-10 flex flex-col gap-4">
            <span className="flex gap-5 justify-between items-center">
              <p>Sales Price</p>
              <p>C$ 30.08</p>
            </span>
            <span className="flex gap-5 justify-between items-center">
              <p>Cost Price</p>
              <p>C$ 5.00</p>
            </span>
            <span className="flex gap-5 justify-between items-center">
              <p>Total Fees</p>
              <p>C$ 15.00</p>
            </span>
            <span className="flex gap-5 justify-between items-center">
              <p>Sales Tax</p>
              <p>C$ 0.95</p>
            </span>
            <span className="flex gap-5 justify-between items-center">
              <p>Est. Amazon Payout</p>
              <p>C$14.13</p>
            </span>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-[#596375]">Fulfilment Type</p>
          <div className="flex items-center gap-4 mt-2">
            <button
              type="button"
              className="bg-[#FF8551] px-6 py-2 rounded-full text-white"
            >
              FBA
            </button>
            <button
              type="button"
              className="border border-[#D2D2D2] px-6 py-2 rounded-full text-[#B0B0B1] hover:bg-gray-50"
            >
              FBM
            </button>
          </div>
        </div>
      </div>

      {/* right column */}
      <div className="p-6 lg:p-8 flex flex-col items-center justify-center text-center min-h-[610px]">
        <svg
          width="129"
          height="129"
          viewBox="0 0 129 129"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M129 64.5C129 100.122 100.122 129 64.5 129C28.8776 129 0 100.122 0 64.5C0 28.8776 28.8776 0 64.5 0C100.122 0 129 28.8776 129 64.5ZM28.0943 64.5C28.0943 84.6063 44.3937 100.906 64.5 100.906C84.6063 100.906 100.906 84.6063 100.906 64.5C100.906 44.3937 84.6063 28.0943 64.5 28.0943C44.3937 28.0943 28.0943 44.3937 28.0943 64.5Z"
            fill="#F8F9FA"
          />
        </svg>

        <p className="max-w-[215px] text-[#596375] mt-10">
          Click the Break down or total fee button display information{" "}
        </p>

        <div className="flex items-center gap-4 mt-8">
          <button
            type="button"
            className="bg-primary px-6 py-2 rounded-full text-white"
          >
            Breakdown
          </button>
          <button
            type="button"
            className="border border-primary px-6 py-2 rounded-full text-primary hover:bg-gray-50"
          >
            Total Fees
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalculationResults;

