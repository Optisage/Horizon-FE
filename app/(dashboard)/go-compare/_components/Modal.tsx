"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react"
import { GoChevronDown } from "react-icons/go"
import { IoCloseOutline } from "react-icons/io5"
import { RiCheckboxBlankCircleFill } from "react-icons/ri"
import { useLazyGetAllCountriesQuery, useLazyQuickSearchQuery } from "@/redux/api/quickSearchApi"
import { message } from "antd"
import { AmazonProduct } from "./GoCompare"
import { ProductObj } from "./QuickSearchTable"

interface Store {
    id: string;
    name: string;
    marketplace_id: string | null;
    country_id: number;
    created_at: {
        human: string;
        string: string;
        timestamp: number;
        locale: string;
    };
}

interface Country {
    id: number;
    name: string;
    flag: string;
    short_code: string;
    created_at: {
        human: string;
        string: string;
        timestamp: number;
        locale: string;
    };
    stores: Store[];
}

const Modal = ({ isOpen, onClose, setDeck, setSearchRe, setAsin }: {
    isOpen: boolean;
    onClose: () => void;
    setDeck: React.Dispatch<React.SetStateAction<string>>;
    setSearchRe: React.Dispatch<React.SetStateAction<{
        amazon_product: AmazonProduct | null;
        opportunities: ProductObj[];
    }>>;
    setAsin: React.Dispatch<React.SetStateAction<string>>;
}) => {
    const [getCountries, { data: countries }] = useLazyGetAllCountriesQuery();
    const [selectedCountry, setSelectedCountry] = useState<Country | undefined>();
    useEffect(() => {
        console.log('fetching....')
        getCountries({});
    }, [])
    useEffect(() => {
        if (countries && countries?.data?.length > 0) {
            console.log(countries);
            setSelectedCountry(countries?.data[0]);
        }
    }, [countries]);
    const [selectedStores, setSelectedStores] = useState<string[]>([])
    const [asinOrUpc, setAsinOrUpc] = useState("");
    const [triggerQuickSearch, { isFetching }] = useLazyQuickSearchQuery();
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isSearchTypeDropdown, setIsSearchTypeDropdown] = useState(false);

    const searchTypes = [
        { id: 1, type: 'Normal Search - (No Images, Less wait time)', value: false },
        { id: 2, type: 'Deep Search - (Longer wait time)', value: true },
        // { id: 3, type: 'Pro Search - (Longer wait time)', value: true },
    ]

    const [selectedSearchType, setSelectedSearchType] = useState(searchTypes[0]);

    const toggleStore = (storeName: string) => {
        if (selectedStores.includes(storeName)) {
            setSelectedStores(selectedStores.filter((name) => name !== storeName));
        } else {
            setSelectedStores([...selectedStores, storeName]);
        }
    }
    const resetFields = () => {
        setAsinOrUpc("");
        setSelectedStores([]);
        setSelectedCountry(countries?.data[0]);
        setSelectedSearchType(searchTypes[0]);
    };

    const handleClose = () => {
        resetFields();
        onClose();
    };


    const handleSearch = async () => {
        if (!asinOrUpc || !selectedCountry || selectedStores.length === 0) {
            console.warn("Missing required fields");
            return;
        }
        const country_ids = (String(selectedCountry.id));
        const queue = selectedSearchType.value;
        try {
            setAsin(asinOrUpc)
            const response = await triggerQuickSearch({ asin: asinOrUpc, store_names: selectedStores, country_ids, queue }).unwrap();
            setSearchRe(response);
            console.log("Quick Search Response:", response);
            setDeck("quickSearch");
            handleClose();
        } catch (error: unknown) {
            let errorMessage = "Unknown error";
            if (typeof error === "object" && error !== null) {
                if ("data" in error && typeof (error as any).data === "object") {
                    errorMessage =
                        (error as any).data?.error ||
                        (error as any).error ||
                        errorMessage;
                } else if ("message" in error) {
                    errorMessage = String((error as { message?: string }).message);
                }
            }
            console.error("Quick Search failed:", errorMessage);
            message.error(`Quick Search failed: ${errorMessage}`);
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden shadow-xl">
                <div className="flex justify-between items-center p-5 pb-4 font-medium">
                    <h2 className="text-lg">Quick Search (100 Products)</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-500">
                        <IoCloseOutline size={22} />
                    </button>
                </div>

                <div className="p-5 pt-0 max-h-[70vh] overflow-y-auto alp">
                    <div className="space-y-4 font-normal">
                        <div>
                            <label htmlFor="asin-upc" className="block text-xs text-[#737379] mb-1.5">
                                Enter ASIN, UPC or Product Name
                            </label>
                            <input
                                id="asin-upc"
                                type="text"
                                value={asinOrUpc}
                                onChange={(e) => setAsinOrUpc(e.target.value)}
                                placeholder="1234-5678-90"
                                className="w-full text-[#9F9FA3] text-sm p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4C3CC6] focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label htmlFor="country" className="block text-xs text-[#737379] mb-1.5">
                                Search Country
                            </label>
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    id="country"
                                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                                    className="w-full text-[#9F9FA3] text-sm p-3 border border-gray-300 rounded-md bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#4C3CC6] focus:border-transparent"
                                >
                                    <div className="flex items-center">
                                        <span
                                            className="inline-block w-4 h-4 mr-2 mt-2"
                                            dangerouslySetInnerHTML={{ __html: selectedCountry?.flag || "" }}
                                        />
                                        <span>{selectedCountry?.name}</span>
                                    </div>
                                    <GoChevronDown size={18} color="black" />
                                </button>

                                {isCountryDropdownOpen && (
                                    <div className="absolute z-10 mt-1 px-2 w-full text-sm bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                        {countries?.data.map((country: Country) => (
                                            <button
                                                key={country?.id}
                                                onClick={() => {
                                                    setSelectedCountry(country)
                                                    setSelectedStores([]);
                                                    setIsCountryDropdownOpen(false)
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center border-b"
                                            >
                                                {/* <Image src={country?.flag} alt={country?.short_code} className="mr-2" /> */}
                                                <span
                                                    className="inline-block w-4 h-4 mr-2 mt-2"
                                                    dangerouslySetInnerHTML={{ __html: country?.flag || "" }}
                                                />
                                                <span>{country?.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="searchType" className="block text-xs text-[#737379] mb-1.5">
                                Select Search Type
                            </label>
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    id="searchType"
                                    onClick={() => setIsSearchTypeDropdown(!isSearchTypeDropdown)}
                                    className="w-full text-[#9F9FA3] text-sm p-3 border border-gray-300 rounded-md bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#4C3CC6] focus:border-transparent"
                                >
                                    <div>
                                        {selectedSearchType?.type}
                                    </div>
                                    <GoChevronDown size={18} color="black" />
                                </button>

                                {isSearchTypeDropdown && (
                                    <div className="absolute z-10 mt-1 px-2 w-full text-sm bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                        {searchTypes?.map((searchType) => (
                                            <button
                                                key={searchType?.id}
                                                onClick={() => {
                                                    setSelectedSearchType(searchType)
                                                    setIsSearchTypeDropdown(false)
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b"
                                            >
                                                <span>{searchType?.type}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-[#737379] mb-1.5">{selectedCountry?.name} Stores</label>
                            <div className="space-y-2">
                                {selectedCountry?.stores?.map((store) => (
                                    <div
                                        key={store.id}
                                        onClick={() => toggleStore(store.name)}
                                        className={`text-xs px-3 py-4 border rounded-md flex items-center justify-between cursor-pointer ${selectedStores.includes(store.id) ? "border-[#4C3CC6] bg-gray-100" : "border-gray-300"
                                            }`}
                                    >
                                        <span>{store.name}</span>
                                        {selectedStores.includes(store.name) ? (
                                            <div className="h-4 w-4 bg-[#365AF9] rounded-full flex items-center justify-center">
                                                <RiCheckboxBlankCircleFill color="white" size={10} />
                                            </div>
                                        ) : (
                                            <div className="h-4 w-4 border border-gray-300 rounded-full bg-white">
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 text-sm font-medium flex justify-end space-x-3 D">
                    <button
                        onClick={handleClose}
                        className="px-4 py-1 shadow-lg border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button onClick={handleSearch} disabled={isFetching} className="px-4 py-1 shadow-lg bg-[#18cb96] text-white rounded-md hover:bg-[#15b588]">
                        {isFetching ? (
                            <div className="h-4 w-4 border-2 border-t-transparent border-white animate-spin rounded-full"></div>
                        ) : (
                            'Search'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
export default Modal
