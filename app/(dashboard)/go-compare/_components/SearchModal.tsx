"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { GoChevronDown } from "react-icons/go";
import { IoCloseOutline } from "react-icons/io5";
import Image from "next/image";
import { useLazyGetAllCountriesQuery, useLazyGetReverseSearchCategoriesQuery } from "@/redux/api/quickSearchApi";
import { useRouter } from "next/navigation";
import { Country } from "@/types/goCompare";
import { message } from "antd";
import { useDispatch } from "react-redux";
import { setMarketPlaceId } from "@/redux/slice/globalSlice";
import { CustomSelect as Select } from "@/lib/AntdComponents";

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    inputLabel: string;
}



export function SearchModal({ isOpen, onClose, title, inputLabel }: SearchModalProps) {
    const router = useRouter();
    const dispatch = useDispatch();
    const [getCountries, { data: countries }] = useLazyGetAllCountriesQuery();
    const [getReverseSearchCategories, { data: categoriesData }] = useLazyGetReverseSearchCategoriesQuery();
    const [selectedCountry, setSelectedCountry] = useState<Country | undefined>();
    const [isLoading, setIsLoading] = useState(true);
    const [asinOrUpc, setAsinOrUpc] = useState("");
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"manual" | "ai">("manual");
    const [showAINotification, setShowAINotification] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isTacticalReverseSearch = title === "Tactical Reverse Search";

    useEffect(() => {
        setIsLoading(true);
        getCountries({});
        // Fetch categories for Tactical Reverse Search
        if (isTacticalReverseSearch) {
            getReverseSearchCategories({});
        }
    }, [isTacticalReverseSearch, getCountries, getReverseSearchCategories]);

    useEffect(() => {
        if (countries?.data?.length > 0) {
            const defaultCountry = countries?.data[0];
            setSelectedCountry(defaultCountry);
            const marketplaceMapping: { [key: string]: number } = {
                'US': 1,
                'UK': 2,
                'CA': 6,
                'AU': 4,
                'DE': 5,
                'FR': 3,
                'NG': 7,
                'IN': 8
            };
            const marketplaceId = marketplaceMapping[defaultCountry.short_code] || 1;
            dispatch(setMarketPlaceId(marketplaceId));
            setIsLoading(false);
        }
    }, [countries, dispatch]);

    const handleClose = () => {
        setAsinOrUpc("");
        setSelectedCountry(countries?.data[0]);
        setActiveTab("manual");
        setShowAINotification(false);
        setSelectedCategory(undefined);
        onClose();
    };

    const handleSearch = async () => {
        // For Tactical Reverse Search AI mode
        if (isTacticalReverseSearch && activeTab === "ai") {
            setShowAINotification(true);
            return;
        }

        if (!selectedCountry) {
            message.error("Please select a country");
            return;
        }
        
        const marketplaceMapping: { [key: string]: number } = {
            'US': 1,
            'UK': 2,
            'CA': 6,
            'AU': 4,
            'DE': 5,
            'FR': 3,
            'NG': 7,
            'IN': 8
        };
        const marketplaceId = marketplaceMapping[selectedCountry.short_code] || 1;

        // For Tactical Reverse Search Manual mode, navigate to reverse search page
        if (isTacticalReverseSearch && activeTab === "manual") {
            if (!asinOrUpc) {
                message.error("Please enter a seller ID");
                return;
            }

            let queryString = `/go-compare/reverse-search?seller_id=${encodeURIComponent(asinOrUpc)}&marketplace_id=${marketplaceId}`;
            
            if (selectedCategory) {
                queryString += `&category_id=${selectedCategory}`;
            }
            
            router.push(queryString);
            handleClose();
            return;
        }
        
        // For Quick Search, validate ASIN/UPC is required
        if (title === "Quick Search" && !asinOrUpc) {
            message.error("Please enter ASIN/UPC");
            return;
        }
        
        if (title === "Quick Search") {
            router.push(
                `/go-compare/quick-search?asin=${asinOrUpc}&marketplace_id=${marketplaceId}`
            );
            handleClose();
        }
    };

    const handleAINotificationClose = () => {
        setShowAINotification(false);
        handleClose();
    };

    if (!isOpen) return null;

    // AI Notification Modal
    if (showAINotification) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden shadow-xl">
                    <div className="p-6 text-center">
                        <div className="mb-4">
                            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Success!
                        </h3>
                        <p className="px-4 text-gray-600">
                            AI search initiated! Results will be sent to your email address.
                        </p>
                        <div className="mt-6 flex gap-3 justify-center">
                            <button
                                onClick={handleAINotificationClose}
                                className="px-6 py-2 bg-[#18cb96] text-white rounded-md hover:bg-[#15b588] transition-colors"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden shadow-xl">
                <div className="flex justify-between items-center p-5 pb-4 font-medium">
                    <h2 className="font-medium">{title}</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-500">
                        <IoCloseOutline size={22} />
                    </button>
                </div>

                <div className="p-5 pt-4 max-h-[70vh] overflow-y-auto space-y-4 font-normal">
                            <div>
                                <label htmlFor="asin-upc" className="block text-xs text-[#737379] mb-1.5">
                                    {inputLabel}
                                </label>
                                <input
                                    id="asin-upc"
                                    type="text"
                                    value={asinOrUpc}
                                    onChange={(e) => setAsinOrUpc(e.target.value)}
                                    placeholder={title === "Quick Search" ? "1234-5678-90" : inputLabel}
                                    className="w-full text-[#9F9FA3] text-sm p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4C3CC6]"
                                />
                            </div>

                            {/* Category Selection - Only for Tactical Reverse Search */}
                            {isTacticalReverseSearch && (
                                <div>
                                    <label className="block text-xs text-[#737379] mb-1.5">
                                        Product Category (Optional)
                                    </label>
                                    <Select
                                        className="w-full"
                                        style={{ width: "100%" }}
                                        placeholder="Select a category"
                                        value={selectedCategory}
                                        onChange={(value: string) => setSelectedCategory(value)}
                                        options={
                                            categoriesData?.data?.map((category: any) => ({
                                                value: category.id.toString(),
                                                label: category.name,
                                            })) || []
                                        }
                                        loading={!categoriesData}
                                        showSearch
                                        allowClear
                                        filterOption={(input: string, option?: { label: string; value: string }) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs text-[#737379] mb-1.5">Search Country</label>
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                                        className="w-full text-[#9F9FA3] text-sm p-3 border border-gray-300 rounded-md bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#4C3CC6]"
                                    >
                                        <div className="flex items-center">
                                            {isLoading ? (
                                                <div className="inline-block w-4 h-4 mr-2 mt-2 rounded-sm bg-gray-200 flex items-center justify-center animate-pulse">
                                                    <span className="text-xs">🌍</span>
                                                </div>
                                            ) : selectedCountry?.flag ? (
                                                <div className="inline-block w-4 h-4 mr-2 mt-2 rounded-sm overflow-hidden">
                                                    <Image
                                                        src={selectedCountry.flag}
                                                        alt={`${selectedCountry.name} flag`}
                                                        width={16}
                                                        height={16}
                                                        className="object-cover"
                                                        unoptimized={true}
                                                        onError={() => {
                                                            // Handle error by hiding the image
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="inline-block w-4 h-4 mr-2 mt-2 rounded-sm bg-gray-200 flex items-center justify-center">
                                                    <span className="text-xs">🌍</span>
                                                </div>
                                            )}
                                            <span>{isLoading ? "Loading..." : selectedCountry?.name}</span>
                                        </div>
                                        <GoChevronDown size={18} color="black" />
                                    </button>

                                    {isCountryDropdownOpen && (
                                        <div className="absolute z-10 mt-1 px-2 w-full text-sm bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                            {countries?.data.map((country: Country) => (
                                                <button
                                                    key={country.id}
                                                    onClick={() => {
                                                        setSelectedCountry(country);
                                                        setIsCountryDropdownOpen(false);
                                                        const marketplaceMapping: { [key: string]: number } = {
                                                            'US': 1,
                                                            'UK': 2,
                                                            'CA': 3,
                                                            'AU': 4,
                                                            'DE': 5,
                                                            'FR': 6,
                                                            'NG': 7,
                                                            'IN': 8
                                                        };
                                                        const marketplaceId = marketplaceMapping[country.short_code] || 1;
                                                        dispatch(setMarketPlaceId(marketplaceId));
                                                    }}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center border-b"
                                                >
                                                    {country.flag ? (
                                                        <div className="inline-block w-4 h-4 mr-2 mt-2 rounded-sm overflow-hidden">
                                                            <Image
                                                                src={country.flag}
                                                                alt={`${country.name} flag`}
                                                                width={16}
                                                                height={16}
                                                                className="object-cover"
                                                                unoptimized={true}
                                                                onError={() => {
                                                                    // Handle error silently
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="inline-block w-4 h-4 mr-2 mt-2 rounded-sm bg-gray-200 flex items-center justify-center">
                                                            <span className="text-xs">🌍</span>
                                                        </div>
                                                    )}
                                                    <span>{country.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                </div>

                <div className="p-5 text-sm font-medium flex justify-end space-x-3">
                    <button
                        onClick={handleClose}
                        className="px-4 py-1 shadow-lg border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSearch}
                        className="px-4 py-1 shadow-lg bg-[#18cb96] text-white rounded-md hover:bg-[#15b588]"
                    >
                        Search
                    </button>
                </div>
            </div>
        </div>
    );
}