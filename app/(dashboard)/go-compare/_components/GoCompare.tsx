"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react"
import { BsPlus } from "react-icons/bs"
import { PiFolderPlus } from "react-icons/pi"
import Create from "./Create";
import SearchHistory from "./SearchHistory";
import { IoCloseOutline } from "react-icons/io5";
import { CiImport, CiSearch } from "react-icons/ci";
import { GoChevronRight } from "react-icons/go";
import { LuScanSearch } from "react-icons/lu";
import { MdOutlineHistory } from "react-icons/md";
import wanted from '../../../../public/assets/svg/gocompare/wanted.svg'
import Image from "next/image";
import Modal from "./Modal";
import { ScanBrandsIcon } from "./icons";
import { ProductObj } from "./QuickSearchTable";

export type Product = {
    id: string
    name: string
    image: string
    price: number
    store: {
        name: string
        logo: string
    }
    description: string
    profitMargin: number
    grossROI: number
    targetLoss: number
    salesRank: number
    buyBoxPrice: number
    numberOfSellers: number
    asin?: string
    numberOfSellersTotal?: number
    amazonListing?: string
    avgMonthlyRank?: number
    avgDailyPrice?: number
}

export interface AmazonProduct {
    id: string;
    store_id: string;
    store_name: string;
    asin: string;
    sku: string;
    product_name: string;
    page_url: string;
    image_url: string;
    seller: string;
    pricing: {
        current_price: number;
        original_price: number | null;
        avg_amazon_90_day_price: number | null;
        amazon_fees: number | null;
    };
    metrics: {
        sales_rank: number | null;
        avg_3_month_sales_rank: number | null;
        number_of_sellers: number | null;
        monthly_sellers: number | null;
        amazon_on_listing: boolean;
        estimated_monthly_sales: number | null;
    };
    ratings: {
        rating: string;
        rating_display: string;
        review_count: number;
    };
    competition: string;
    created_at: string;
    updated_at: string;
    store: {
        id: string;
        name: string;
        logo: string;
        marketplace_id: string | null;
        country_id: number;
        created_at: {
            human: string;
            string: string;
            timestamp: number;
            locale: string;
        };
    };
}


const GoCompare = () => {
    const [activeTab, setActiveTab] = useState("create");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [deck, setDeck] = useState("empty");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [searchRe, setSearchRe] = useState<{
        amazon_product: AmazonProduct | null;
        opportunities: ProductObj[];
    }>({
        amazon_product: null,
        opportunities: [],
    });
    

    const [asin, setAsin] = useState('')

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen)
    }
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen)
        setIsDropdownOpen(!isDropdownOpen)
    }

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };

    const handleCreate = () => {
        setActiveTab("create");
        toggleDropdown();
    }

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    return (
        <section className="flex flex-col gap-5 min-h-[50dvh] md:min-h-[80dvh]">
            <div>
                <div className="grid grid-cols-2 gap-4">
                    <div onClick={handleCreate} className={`border px-2 py-3 rounded-lg flex flex-col cursor-pointer gap-1.5 ${activeTab === 'create' ? 'bg-gray-100' : 'bg-white'} ${isDropdownOpen ? 'border-green-600 bg-[#f6f6f7]' : 'border-[#E1E0E5] '} `}>
                        <BsPlus size={20} className="text-green-600" />
                        <p className="text-sm text-[#2E2E37]">Create</p>
                    </div>
                    <div onClick={() => setActiveTab("history")} className={`border-[#E1E0E5] border px-2 py-3 rounded-lg flex flex-col cursor-pointer gap-1.5 ${activeTab === 'history' ? 'bg-gray-100' : 'bg-white'}`}>
                        <PiFolderPlus size={20} className="text-green-600" />
                        <p className="text-sm text-[#2E2E37]">Search History</p>
                    </div>
                </div>
                {isDropdownOpen && (
                    <div className="absolute z-10 bg-white rounded-lg shadow-2xl w-[290px] mt-1" ref={dropdownRef}>
                        <div className="px-5 pt-2">
                            <button onClick={toggleDropdown} className="">
                                <IoCloseOutline size={22} className="text-[#737379]" />
                            </button>
                            <p className="text-[#737379] text-xs mt-1">Create</p>
                        </div>

                        <div className="p-2 pt-0">
                            <button onClick={toggleModal} className="flex items-center justify-between rounded-md w-full p-2 hover:bg-[#f6f6f7] text-[#737379]">
                                <div className="flex items-center gap-2.5">
                                    <CiSearch size={20} />
                                    <span className="text-sm">Quick Search (100 products)</span>
                                </div>
                                <GoChevronRight />
                            </button>

                            <button className="flex items-center justify-between rounded-md w-full p-2 hover:bg-[#f6f6f7] text-[#737379]">
                                <div className="flex items-center gap-2.5">
                                    <CiSearch size={20} />
                                    <span className="text-sm">Search Seller Products</span>
                                </div>
                                <GoChevronRight />
                            </button>

                            <button className="flex items-center justify-between rounded-md w-full p-2 hover:bg-[#f6f6f7] text-[#737379]">
                                <div className="flex items-center gap-2.5">
                                    <LuScanSearch size={20} />
                                    <span className="text-sm">Search with Filter</span>
                                </div>
                                <GoChevronRight />
                            </button>

                            <button className="flex items-center justify-between rounded-md w-full p-2 hover:bg-[#f6f6f7] text-[#737379]">
                                <div className="flex items-center gap-2.5">
                                    {<ScanBrandsIcon />}
                                    <span className="text-sm">Scan Brands</span>
                                </div>
                                <GoChevronRight />
                            </button>

                            <button className="flex items-center justify-between rounded-md w-full p-2 hover:bg-[#f6f6f7] text-[#737379]">
                                <div className="flex items-center gap-2.5">
                                    <Image src={wanted} alt="icon" />
                                    <span className="text-sm">Scan Most Wanted</span>
                                </div>
                                <GoChevronRight />
                            </button>
                        </div>

                        <div className="py-1 px-2 border-t border-[#e1e0e5]">
                            <div className="pt-2 px-3 text-xs text-[#737379]">Add</div>
                            <button className="flex items-center justify-between rounded-md w-full p-2 hover:bg-[#f6f6f7] text-[#737379]">
                                <div className="flex items-center gap-2.5">
                                    <CiImport size={20} />
                                    <span className="text-sm">Import Product Codes</span>
                                </div>
                                <GoChevronRight />
                            </button>
                        </div>

                        <div className="py-1 px-2 border-t border-[#e1e0e5]">
                            <div className="pt-2 px-3 text-xs text-[#737379]">Modify</div>
                            <button onClick={() => setActiveTab("searchHistory")} className="flex items-center justify-between rounded-md w-full p-2 hover:bg-[#f6f6f7] text-[#737379]">
                                <div className="flex items-center gap-2.5">
                                    <MdOutlineHistory size={20} />
                                    <span className="text-sm">Search History</span>
                                </div>
                                <GoChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} setDeck={setDeck} setSearchRe={setSearchRe} setAsin={setAsin} />
            {activeTab === 'create' ? 
                <Create deck={deck} searchRe={searchRe} asin={asin} /> : <SearchHistory />}
        </section>
    )
}

export default GoCompare