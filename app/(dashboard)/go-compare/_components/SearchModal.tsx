"use client";
import { useEffect, useRef, useState } from "react";
import { GoChevronDown } from "react-icons/go";
import { IoCloseOutline } from "react-icons/io5";
import { useLazyGetAllCountriesQuery } from "@/redux/api/quickSearchApi";
import { useRouter } from "next/navigation";
import { Country } from "@/types/goCompare";
import { message } from "antd";
import { useDispatch } from "react-redux";
import { setMarketPlaceId } from "@/redux/slice/globalSlice";

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
    const [selectedCountry, setSelectedCountry] = useState<Country | undefined>();
    const [isLoading, setIsLoading] = useState(true);
    const [asinOrUpc, setAsinOrUpc] = useState("");
    const [selectedSearchType, setSelectedSearchType] = useState(searchTypes[0]);
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [isSearchTypeDropdown, setIsSearchTypeDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsLoading(true);
        getCountries({});
    }, []);

    useEffect(() => {
        if (countries?.data?.length > 0) {
            const defaultCountry = countries?.data[0];
            setSelectedCountry(defaultCountry);
            // For the new API, we'll use the short_code to determine marketplace ID
            // This is a placeholder - you may need to adjust based on your marketplace mapping
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
        onClose();
    };

    const handleSearch = () => {
        if (!asinOrUpc || !selectedCountry) {
            message.error("Missing required fields");
            return;
        }
        
        // Show loading message before navigation
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
            
            // Set a small timeout to ensure the loading message is shown
            setTimeout(() => {
                router.push(
                    `/go-compare/quick-search?asin=${asinOrUpc}&marketplace_id=${marketplaceId}&queue=${selectedSearchType.value}`
                );
                handleClose();
            }, 100);
        } else {
            // Set a small timeout to ensure the loading message is shown
            setTimeout(() => {
                router.push(
                    `/go-compare/reverse-search?query=${asinOrUpc}`
                );
                handleClose();
            }, 100);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden shadow-xl">
                <div className="flex justify-between items-center p-5 pb-4 font-medium">
                    <h2 className="font-medium">{title}</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-500">
                        <IoCloseOutline size={22} />
                    </button>
                </div>

                <div className="p-5 pt-0 max-h-[70vh] overflow-y-auto space-y-4 font-normal">
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
