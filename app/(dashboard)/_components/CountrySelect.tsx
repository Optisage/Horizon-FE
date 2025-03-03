"use client";

import Image from "next/image";
import React, { useState } from "react";
import { BiChevronDown } from "react-icons/bi";

const countries = [
  { code: "", name: "Switch Marketplace Country", flag: "" },
  { code: "US", name: "United States", flag: "us" },
  { code: "CA", name: "Canada", flag: "ca" },
  { code: "GB", name: "United Kingdom", flag: "gb" },
  { code: "AU", name: "Australia", flag: "au" },
  { code: "DE", name: "Germany", flag: "de" },
];

const CountrySelect = () => {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block w-64">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full p-3 border rounded-full bg-[#F3F5F7]"
      >
        {selectedCountry.flag.length === 2 ? (
          <Image
            src={`https://flagcdn.com/w40/${selectedCountry.flag}.png`}
            alt={selectedCountry.name}
            className="w-6 h-4 rounded-sm object-cover"
            width={24}
            height={16}
            quality={90}
            priority
            unoptimized
          />
        ) : (
          <span className="w-6 h-4 flex items-center justify-center text-lg">
            🌍
          </span>
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
              onClick={() => {
                setSelectedCountry(country);
                setIsOpen(false);
              }}
              className="flex items-center p-2 px-3 hover:bg-gray-100 cursor-pointer"
            >
              {country.flag.length === 2 ? (
                <Image
                  src={`https://flagcdn.com/w40/${country.flag}.png`}
                  alt={country.name}
                  className="w-6 h-4 rounded-sm object-cover"
                  width={24}
                  height={16}
                  quality={90}
                  priority
                  unoptimized
                />
              ) : (
                <span className="w-6 h-4 flex items-center justify-center text-lg">
                  🌍
                </span>
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
