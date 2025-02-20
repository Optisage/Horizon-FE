"use client";

import React, { useState } from "react";
import { BiChevronDown } from "react-icons/bi";

const countries = [
  { code: "", name: "Switch Marketplace Country", flag: "🇺🇸" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
];

const CountrySelect = () => {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block w-64">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full p-2 pr-3 border rounded-full bg-[#F3F5F7]"
      >
        <span className="text-xl">{selectedCountry.flag}</span>

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
              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
            >
              <span className="mr-2 text-xl">{country.flag}</span>
              <span className="text-sm">{country.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CountrySelect;
