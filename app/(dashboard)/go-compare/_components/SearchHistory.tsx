"use client";
import { useState } from "react";
import TablePagination from "./TablePagination";
//import Image from "next/image";
import { useSearchHistoryQuery } from "@/redux/api/quickSearchApi";
import Loader from "@/utils/loader";

export interface SearchRecord {
    id: number
    asinOrUpc: string
    searchType: string
    searchDate: string
    amazonPrice: string
    country: string
    countryCode: string
    countryFlag: string
    store: string
    storeLogo: string
    results: number
}

const tableColumns = [
    { label: 'ASIN or UPC', key: 'asinOrUpc' },
    { label: 'Type of search', key: 'searchType' },
    { label: 'Search Date', key: 'searchDate' },
    { label: 'Amazon Price', key: 'amazonPrice' },
    { label: 'Country', key: 'country' },
    { label: 'Store(s)', key: 'storeLogo' },
    { label: 'No. of results', key: 'results' },
]

const SearchHistory = () => {
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)

    const { data, isLoading, isError } = useSearchHistoryQuery({});
    const searchData: SearchRecord[] = data?.data.map((item: any) => ({
        id: item.id,
        asinOrUpc: item.query,
        searchType: item.type_of_search,
        searchDate: new Date(item.created_at.string).toLocaleDateString(),
        amazonPrice: item.amazon_price ? `$${item.amazon_price}` : "-",
        country: item.country.name,
        countryCode: item.country.short_code,
        countryFlag: item.country.flag,
        store: item.store.name,
        storeLogo: item.store.logo,
        results: item.number_of_results,
    })) || [];


    const totalPages = Math.ceil(searchData.length / perPage)
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const currentData = searchData.slice(startIndex, endIndex)


    const handlePageChange = (page: number) => {
        setPage(page)
    }

    const handlePerPageChange = (value: number) => {
        setPerPage(value)
        setPage(1)
    }
    return (
        <div>
            <p className="font-semibold">Search History</p>
            {isError && <p>Error fetching history</p>}
            <div className="flex items-center justify-center">
                {isLoading && <Loader />}
            </div>
            {data?.data &&
                <div className="w-full bg-white mt-5 border border-gray-200 rounded-lg ">
                    <div className="overflow-x-auto ">
                        <table className="w-full text-sm ">
                            <thead>
                                <tr className="border-b bg-[#FCFCFC]">
                                    {tableColumns.map((column) => (
                                        <th key={column.key} className="px-4 py-3 text-left text-[#737379] font-normal">{column.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="">
                                {currentData.map((record) => (
                                    <tr key={record.id} className="font-medium">
                                        <td className="px-4 pr-20 py-3 ">{record.asinOrUpc}</td>
                                        <td className="px-4 py-3">{record.searchType}</td>
                                        <td className="px-4 py-3">{record.searchDate}</td>
                                        <td className="px-4 py-3">{record.amazonPrice}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-4 h-4 mt-2"
                                                    dangerouslySetInnerHTML={{ __html: record.countryFlag.trim() || ""}}
                                                />
                                                <span className="font-normal">{record.country}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <img src={record.storeLogo} alt="" className="object-contain w-10 h-10" />
                                        </td>
                                        <td className="px-4 py-3">{record.results}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <TablePagination page={page} perPage={perPage} totalPages={totalPages} handlePageChange={handlePageChange} handlePerPageChange={handlePerPageChange} />
                </div>
            }
        </div>
    )
}

export default SearchHistory
