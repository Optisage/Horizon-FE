import { useEffect, useState } from "react";

const useCurrencyConverter = (currencyCode: string) => {
  const [exchangeRate, setExchangeRate] = useState(1);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/CAD`);
        const data = await response.json();
        const rate = data.rates[currencyCode];
        setExchangeRate(rate || 1); // Default to 1 if the currency code is not found
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
        setExchangeRate(1); // Fallback to 1 if there's an error
      }
    };

    if (currencyCode) {
      fetchExchangeRate();
    }
  }, [currencyCode]);

  const convertPrice = (price: string | number) => {
    const priceInUSD = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(priceInUSD)) {
      return "0.00"; // Fallback for invalid inputs
    }
    const convertedPrice = priceInUSD * exchangeRate;
    return convertedPrice.toFixed(2); // Adjust decimal places as needed
  };

  return { convertPrice, exchangeRate };
};

export default useCurrencyConverter;