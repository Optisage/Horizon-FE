/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useLazyFetchMarketplacesQuery } from "@/redux/api/productsApi";
import { useDispatch } from "react-redux";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { BiChevronDown } from "react-icons/bi";
import { setCurrencyCode, setCurrencySymbol, setMarketPlaceId } from "@/redux/slice/globalSlice";
import { useAppSelector } from "@/redux/hooks";

const CountrySelect = () => {
  const dispatch = useDispatch();
  const [selectedCountry, setSelectedCountry] = useState({
    code: "",
    name: "Switch Marketplace Country",
    flag: "",
    marketplaceId: 0,
    currencyCode:"",
    currencySymbol:""
  });

  const [isOpen, setIsOpen] = useState(false);
  const [marketPlace, { data }] = useLazyFetchMarketplacesQuery();
  const [countries, setCountries] = useState([
    { code: "", name: "Switch Marketplace Country", flag: "", marketplaceId: 0, currencyCode:"",currencySymbol:"" },
  ]);
  const { marketplaceId } = useAppSelector((state) => state?.global);

  useEffect(() => {
    marketPlace({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data) {
      const formattedCountries = data?.data?.map((item: any) => ({
        code: item.countryCode,
        name: item.country,
        flag: item.countryCode.toLowerCase(),
        marketplaceId: item.marketplaceId, // Store marketplaceId
        currencyCode: item.currencyCode,
        currencySymbol: item.currencySymbol
      }));

      setCountries([
        { code: "", name: "Switch Marketplace Country", flag: "", marketplaceId: "", currencyCode:"", currencySymbol:"" },
        ...formattedCountries,
      ]);
    }
  }, [data]);
   // Automatically update selectedCountry when marketplaceId changes
   useEffect(() => {
    if (marketplaceId && countries.length > 1) {
      const matchedCountry = countries.find(
        (country) => Number(country.marketplaceId) === marketplaceId
      );

      if (matchedCountry) {
        setSelectedCountry(matchedCountry);
      }
    }
  }, [marketplaceId, countries]);

  const handleSelect = (country: any) => {
    setSelectedCountry(country);
    dispatch(setMarketPlaceId(country.marketplaceId)); // Dispatch marketplaceId to Redux
    dispatch(setCurrencyCode(country.currencyCode)); // Dispatch marketplaceId to Redux
    dispatch(setCurrencySymbol(country.currencySymbol)); // Dispatch marketplaceId to Redux
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block w-64">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full p-2 border rounded-full bg-[#F3F5F7]"
      >
        {selectedCountry.flag ? (
          <Image
            src={`https://flagcdn.com/w40/${selectedCountry.flag}.png`}
            alt={selectedCountry.name}
            className="w-6 h-6 rounded-full object-cover"
            width={24}
            height={16}
            quality={90}
            priority
            unoptimized
          />
        ) : (
          <span className="w-6 h-4 flex items-center justify-center text-lg">🌍</span>
        )}
        <span className="flex-1 flex justify-start text-xs font-medium text-[#171717]">
          {selectedCountry.name}
        </span>
        <BiChevronDown className="size-4 text-[#616977]" />
      </button>

      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 border rounded-md bg-white shadow-lg max-h-60 overflow-y-auto">
          {countries.map((country) => (
            <li
              key={country.code}
              onClick={() => handleSelect(country)}
              className="flex items-center p-2 px-3 hover:bg-gray-100 cursor-pointer"
            >
              {country.flag ? (
                <Image
                  src={`https://flagcdn.com/w40/${country.flag}.png`}
                  alt={country.name}
                  className="w-6 h-6  object-cover rounded-full"
                  width={24}
                  height={16}
                  quality={90}
                  priority
                  unoptimized
                />
              ) : (
                <span className="w-6 h-4 flex items-center justify-center text-lg">🌍</span>
              )}
              <span className="text-sm ml-2">{country.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CountrySelect;
