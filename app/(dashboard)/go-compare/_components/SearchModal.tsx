"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { GoChevronDown } from "react-icons/go";
import { IoCloseOutline } from "react-icons/io5";
import { useLazyGetAllCountriesQuery } from "@/redux/api/quickSearchApi";
import { useLazyGetProductCategoriesQuery } from "@/redux/api/auth";
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

const searchTypes = [
    { id: 1, type: "Normal Search - (No Images, Less wait time)", value: false },
    { id: 2, type: "Deep Search - (Longer wait time)", value: true },
];

export function SearchModal({ isOpen, onClose, title, inputLabel }: SearchModalProps) {
    const router = useRouter();
    const dispatch = useDispatch();
    const [getCountries, { data: countries }] = useLazyGetAllCountriesQuery();
    const [getProductCategories, { data: categoriesData }] = useLazyGetProductCategoriesQuery();
    const [selectedCountry, setSelectedCountry] = useState<Country | undefined>();
    const [isLoading, setIsLoading] = useState(true);
    const [asinOrUpc, setAsinOrUpc] = useState("");
    const [selectedSearchType, setSelectedSearchType] = useState(searchTypes[0]);
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [isSearchTypeDropdown, setIsSearchTypeDropdown] = useState(false);
    const [activeTab, setActiveTab] = useState<"manual" | "ai">("manual");
    const [showAINotification, setShowAINotification] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isTacticalReverseSearch = title === "Tactical Reverse Search";

    useEffect(() => {
        setIsLoading(true);
        getCountries({});
        // Fetch categories for Tactical Reverse Search
        if (isTacticalReverseSearch) {
            getProductCategories({});
        }
    }, [isTacticalReverseSearch]);

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
        setSelectedSearchType(searchTypes[0]);
        setSelectedCountry(countries?.data[0]);
        setActiveTab("manual");
        setShowAINotification(false);
        setSelectedCategories([]);
        onClose();
    };

    const handleSearch = () => {
        if (isTacticalReverseSearch && activeTab === "ai") {
            if (!asinOrUpc) {
                message.error("Please enter a query");
                return;
            }
            setShowAINotification(true);
            return;
        }

        if (!asinOrUpc || !selectedCountry) {
            message.error("Missing required fields");
            return;
        }
        
        message.loading({
            content: "Initiating search...",
            key: "searchLoading",
            duration: 1
        });
        
        if (title === "Quick Search") {
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
            
            setTimeout(() => {
                router.push(
                    `/go-compare/quick-search?asin=${asinOrUpc}&marketplace_id=${marketplaceId}&queue=${selectedSearchType.value}`
                );
                handleClose();
            }, 100);
        } else {
            // Build query params for Tactical Reverse Search
            let queryString = `/go-compare/reverse-search?query=${asinOrUpc}`;
            
            // Add categories if selected
            if (selectedCategories.length > 0) {
                queryString += `&categories=${selectedCategories.join(',')}`;
            }
            
            setTimeout(() => {
                router.push(queryString);
                handleClose();
            }, 100);
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
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Thank You!</h3>
                        <p className="text-gray-600">We will notify you when a report is ready.</p>
                        <button
                            onClick={handleAINotificationClose}
                            className="mt-6 px-6 py-2 bg-[#18cb96] text-white rounded-md hover:bg-[#15b588]"
                        >
                            OK
                        </button>
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

                {/* Tabs - Only show for Tactical Reverse Search */}
                {isTacticalReverseSearch && (
                    <div className="px-5 border-b border-gray-200">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setActiveTab("manual")}
                                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === "manual"
                                        ? "border-primary text-primary"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                Manual Search
                            </button>
                            <button
                                onClick={() => setActiveTab("ai")}
                                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === "ai"
                                        ? "border-primary text-primary"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                AI Search
                            </button>
                        </div>
                    </div>
                )}

                <div className="p-5 pt-4 max-h-[70vh] overflow-y-auto space-y-4 font-normal">
                    {/* AI Search Tab Content */}
                    {isTacticalReverseSearch && activeTab === "ai" ? (
                        <div className="py-6">
                            <div className="text-center">
                                <div className="mb-4">
                                    <svg className="mx-auto h-16 w-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">AI-Powered Search</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Our AI will automatically search and analyze the best possible products for you based on intelligent market analysis and trends.
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Manual Search / Default Content */
                        <>
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

                            {/* Categories Selection - Only for Tactical Reverse Search */}
                            {isTacticalReverseSearch && (
                                <div>
                                    <label className="block text-xs text-[#737379] mb-1.5">
                                        Product Categories 
                                    </label>
                                    <Select
                                        mode="multiple"
                                        className="w-full"
                                        style={{ width: "100%" }}
                                        placeholder="Select categories"
                                        value={selectedCategories.length > 0 ? selectedCategories : undefined}
                                        onChange={(value: string[]) => setSelectedCategories(value)}
                                        options={
                                            categoriesData?.data?.map((category: any) => ({
                                                value: category.id.toString(),
                                                label: category.category_name,
                                            })) || []
                                        }
                                        loading={!categoriesData}
                                        maxTagCount="responsive"
                                        showSearch
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
                                                <img
                                                    src={selectedCountry.flag}
                                                    alt={`${selectedCountry.name} flag`}
                                                    className="inline-block w-4 h-4 mr-2 mt-2 rounded-sm"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        const nextElement = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                                                        if (nextElement) nextElement.style.display = 'flex';
                                                    }}
                                                />
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
                                                        <>
                                                            <img
                                                                src={country.flag}
                                                                alt={`${country.name} flag`}
                                                                className="inline-block w-4 h-4 mr-2 mt-2 rounded-sm"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                    const parentElement = (e.target as HTMLImageElement).parentElement;
                                                                    if (parentElement) {
                                                                        const nextElement = parentElement.nextElementSibling as HTMLElement;
                                                                        if (nextElement) nextElement.style.display = 'flex';
                                                                    }
                                                                }}
                                                            />
                                                            <div className="hidden inline-block w-4 h-4 mr-2 mt-2 rounded-sm bg-gray-200 items-center justify-center">
                                                                <span className="text-xs">🌍</span>
                                                            </div>
                                                        </>
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

                            <div>
                                <label className="block text-xs text-[#737379] mb-1.5">Select Search Type</label>
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsSearchTypeDropdown(!isSearchTypeDropdown)}
                                        className="w-full text-[#9F9FA3] text-sm p-3 border border-gray-300 rounded-md bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#4C3CC6]"
                                    >
                                        <span>{selectedSearchType?.type}</span>
                                        <GoChevronDown size={18} color="black" />
                                    </button>

                                    {isSearchTypeDropdown && (
                                        <div className="absolute z-10 mt-1 px-2 w-full text-sm bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                            {searchTypes.map((searchType) => (
                                                <button
                                                    key={searchType.id}
                                                    onClick={() => {
                                                        setSelectedSearchType(searchType);
                                                        setIsSearchTypeDropdown(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b"
                                                >
                                                    <span>{searchType.type}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
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