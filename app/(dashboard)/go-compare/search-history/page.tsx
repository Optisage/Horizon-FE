"use client";
import { useState } from "react";
import { useSearchHistoryQuery } from "@/redux/api/quickSearchApi";
import Loader from "@/utils/loader";
import TablePagination from "../_components/TablePagination";
import { ApiSearchResponseItem, SearchRecord } from "@/types/goCompare";
import { useRouter } from "next/navigation";

const tableColumns = [
    { label: 'ASIN, UPC or Query Name', key: 'asinOrUpc' },
    { label: 'Type of search', key: 'searchType' },
    { label: 'Search Date', key: 'searchDate' },
    { label: 'Amazon Price', key: 'amazonPrice' },
    { label: 'Country', key: 'country' },
    { label: 'Store(s)', key: 'storeLogo' },
    { label: 'No. of results', key: 'results' },
]

const SearchHistory = () => {
    const [perPage, setPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const router = useRouter();

    const { data, isLoading, isFetching, isError } = useSearchHistoryQuery({ page, perPage });
    const searchData: SearchRecord[] = data?.data?.map((item: ApiSearchResponseItem) => ({
        id: item.id,
        asinOrUpc: item.asin_upc,
        searchType: item.search_type,
        searchDate: new Date(item.search_date).toLocaleDateString(),
        amazonPrice: item.amazon_price ? `$${item.amazon_price}` : "-",
        country: item.country.country,
        stores: item.stores || [],
        results: item.results_count,
        countryId: item.country.id,
    })) || []


    const handlePageChange = (page: number) => {
        setPage(page)
    }

    const handlePerPageChange = (value: number) => {
        setPerPage(value)
        setPage(1)
    }

    const handleRouting = (record: SearchRecord) => {
        if (record.searchType === 'quick_search') {
            const storeName = record.stores && record.stores.length > 0 ? record.stores[0].name : '';
            router.push(`/go-compare/quick-search?asin=${record.asinOrUpc}&country=${record.countryId}&stores=${storeName}&queue=false&searchId=${record.id}`)
        } else {
            const storeNames = record.stores && record.stores.length > 0 ? record.stores.map(store => store.name).join(',') : '';
            router.push(`/go-compare/reverse-search?queryName=${record.asinOrUpc}&store=${encodeURIComponent(storeNames)}&searchId=${record.id}`);
        }
    }

    if (isLoading || isFetching) return (
        <div className="flex items-center justify-center">
            <Loader />
        </div>
    )

    return (
        <div>
            <p className="font-semibold">Search History</p>
            {isError && <p>Error fetching history</p>}
            {data?.data &&
                <div className="w-full bg-white mt-5 border border-gray-200 rounded-lg ">
                    <div className="overflow-x-auto ">
                        <table className="w-full text-sm ">
                            <thead>
                                <tr className="border-b bg-[#FCFCFC]">
                                    {tableColumns.map((column) => (
                                        <th key={column.key} className={`px-4 py-3 text-left text-[#737379] font-normal ${column.key === 'storeLogo' && 'text-center'}`}>{column.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="">
                                {searchData?.map((record) => (
                                    <tr key={record.id} className="font-medium cursor-pointer" onClick={() => handleRouting(record)}>
                                        <td className="px-4 pr-20 py-3 ">{record.asinOrUpc}</td>
                                        <td className="px-4 py-3">{record.searchType}</td>
                                        <td className="px-4 py-3">{record.searchDate}</td>
                                        <td className="px-4 py-3">{record.amazonPrice}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-normal">{record.country}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-2 items-center justify-center">
                                                {Array.isArray(record.stores) ? (
                                                    record.stores.length > 0 ? (
                                                        <span className="text-sm">{record.stores.join(', ')}</span>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">No stores</span>
                                                    )
                                                ) : (
                                                    <span className="text-sm text-gray-400">No stores</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{record.results}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <TablePagination page={page} perPage={perPage} totalPages={data?.meta?.last_page} handlePageChange={handlePageChange} handlePerPageChange={handlePerPageChange} />
                    <p className="text-green-600 text-end mx-4 mb-2 text-sm">Results will be cleared after 7 days</p>

                </div>
            }
        </div>
    )
}

export default SearchHistory
