"use client";
import { useEffect, useRef, useState } from "react";
import { GoChevronDown } from "react-icons/go";
import { IoCloseOutline } from "react-icons/io5";
import { RiCheckboxBlankCircleFill } from "react-icons/ri";
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
    isMultiStore?: boolean;
}

const searchTypes = [
    { id: 1, type: "Normal Search - (No Images, Less wait time)", value: false },
    { id: 2, type: "Deep Search - (Longer wait time)", value: true },
];

export function SearchModal({ isOpen, onClose, title, inputLabel, isMultiStore = false }: SearchModalProps) {
    const router = useRouter();
    const dispatch = useDispatch();
    const [getCountries, { data: countries }] = useLazyGetAllCountriesQuery();
    const [selectedCountry, setSelectedCountry] = useState<Country | undefined>();
    const [selectedStores, setSelectedStores] = useState<string[]>([]);
    const [asinOrUpc, setAsinOrUpc] = useState("");
    const [selectedSearchType, setSelectedSearchType] = useState(searchTypes[0]);
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [isSearchTypeDropdown, setIsSearchTypeDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getCountries({});
    }, []);

    useEffect(() => {
        if (countries?.data?.data?.length > 0) {
            const defaultCountry = countries?.data?.data[0];
            setSelectedCountry(defaultCountry);
            const id = defaultCountry.id === 3 ? 6 : defaultCountry.id;
            dispatch(setMarketPlaceId(id));
        }
    }, [countries, dispatch]);

    const toggleStore = (storeName: string) => {
        if (isMultiStore) {
            setSelectedStores((prev) =>
                prev.includes(storeName) ? prev.filter((s) => s !== storeName) : [...prev, storeName]
            );
        } else {
            setSelectedStores([storeName]);
        }
    };

    const handleClose = () => {
        setAsinOrUpc("");
        setSelectedStores([]);
        setSelectedSearchType(searchTypes[0]);
        setSelectedCountry(countries?.data?.data[0]);
        onClose();
    };

    const handleSearch = () => {
        if (!asinOrUpc || !selectedCountry || selectedStores.length === 0) {
            message.error("Missing required fields");
            return;
        }
        const storeParam = isMultiStore ? selectedStores.join(",") : selectedStores[0];
        if (title === "Quick Search") {
            router.push(
                `/go-compare/quick-search?asin=${asinOrUpc}&country=${selectedCountry.id}&stores=${storeParam}&queue=${selectedSearchType.value}`
            );
        } else {
            router.push(
                `/go-compare/reverse-search?query=${asinOrUpc}&store=${storeParam}`
            );
        }
        handleClose();
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
                                    {countries?.data?.data.map((country: Country) => (
                                        <button
                                            key={country.id}
                                            onClick={() => {
                                                setSelectedCountry(country);
                                                setSelectedStores([]);
                                                setIsCountryDropdownOpen(false);
                                                const id = country.id === 3 ? 6 : country.id;
                                                dispatch(setMarketPlaceId(id));
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center border-b"
                                        >
                                            <span
                                                className="inline-block w-4 h-4 mr-2 mt-2"
                                                dangerouslySetInnerHTML={{ __html: country.flag || "" }}
                                            />
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

                    <div>
                        <label className="block text-xs text-[#737379] mb-1.5">{selectedCountry?.name} Stores</label>
                        <div className="space-y-2">
                            {selectedCountry?.stores?.map((store) => (
                                <div
                                    key={store.id}
                                    onClick={() => toggleStore(store.name)}
                                    className={`text-xs px-3 py-4 border rounded-md flex items-center justify-between cursor-pointer ${selectedStores.includes(store.name) ? "border-[#4C3CC6] bg-gray-100" : "border-gray-300"
                                        }`}
                                >
                                    <span>{store.name}</span>
                                    {selectedStores.includes(store.name) ? (
                                        <div className="h-4 w-4 bg-[#365AF9] rounded-full flex items-center justify-center">
                                            <RiCheckboxBlankCircleFill color="white" size={10} />
                                        </div>
                                    ) : (
                                        <div className="h-4 w-4 border border-gray-300 rounded-full bg-white" />
                                    )}
                                </div>
                            ))}
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
