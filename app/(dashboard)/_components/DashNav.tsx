"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/public/assets/svg/Optisage Logo.svg";
import { CgMenuRightAlt } from "react-icons/cg";
import CountrySelect from "./CountrySelect";
import { useState, useEffect } from "react";
import SearchInput from "./SearchInput";
import UserProfile from "./UserProfile";
import { VscBell, VscBellDot } from "react-icons/vsc";

const DashNav = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [error, setError] = useState("");

  // Validate ASIN format (10 characters, starts with B followed by alphanumeric)
  const isValidASIN = (value: string): boolean => {
    const asinRegex = /^B[A-Z0-9]{9}$/i;
    return asinRegex.test(value);
  };

  // Validate UPC format (12 digits)
  const isValidUPC = (value: string): boolean => {
    const upcRegex = /^\d{12}$/;
    return upcRegex.test(value);
  };

  // Prefetch product route on component mount
  useEffect(() => {
    // Prefetch the product route template
    router.prefetch('/dashboard/product/[id]');
  }, [router]);

  const handleSearch = () => {
    const trimmedValue = searchValue.trim();
    
    if (!trimmedValue) {
      setError("Please enter an ASIN or UPC");
      return;
    }

    if (isValidASIN(trimmedValue)) {
      setError("");
      router.push(`/dashboard/product/${trimmedValue}`);
      setSearchValue("");
    } else if (isValidUPC(trimmedValue)) {
      setError("");
      router.push(`/dashboard/product/${trimmedValue}`);
      setSearchValue("");
    } else {
      setError("Invalid format. Please enter a valid ASIN or UPC");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleChange = (value: string) => {
    setSearchValue(value);
    if (error) {
      setError("");
    }
  };

  return (
    <nav className="flex items-center justify-between px-5 py-3 md:py-4 lg:px-6 sticky top-0 bg-white lg:shadow-sm lg:border-transparent border-b border-gray-200 z-40 rounded-xl">
        <Image
          src={Logo}
          alt="Logo"
          className="lg:hidden w-1/3 sm:w-[187px] sm:h-[49px]"
          width={187}
          height={49}
          quality={90}
          priority
        />

        <div className="max-w-[484px] w-full hidden lg:block relative">
          <SearchInput
            placeholder="Search by ASIN or UPCw"
            value={searchValue}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />
          {error && (
            <p className="absolute top-full text-xs text-red-600 font-medium">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-4 sm:gap-8 md:gap-6 items-center">
          <div className="flex gap-3 ms:gap-6 items-center">
            <CountrySelect />
            <VscBell size={25} color="#18cb96" />
            <UserProfile />
          </div>

          <label
            htmlFor="my-drawer-2"
            className="block lg:hidden text-primary-400 md:ml-4 "
          >
            <CgMenuRightAlt size="25" />
          </label>
        </div>
      </nav>
  );
};

export default DashNav;