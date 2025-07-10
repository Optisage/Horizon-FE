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
    const searchData: SearchRecord[] = data?.data?.data?.map((item: ApiSearchResponseItem) => ({
        id: item.id,
        asinOrUpc: item.query,
        searchType: item.type_of_search,
        searchDate: new Date(item.created_at.string).toLocaleDateString(),
        amazonPrice: item.amazon_price ? `$${item.amazon_price}` : "-",
        country: item.country.name,
        countryCode: item.country.short_code,
        countryId: item.country.id,
        countryFlag: item.country.flag,
        stores: item.stores,
        results: item.number_of_results,
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
            router.push(`/go-compare/quick-search?asin=${record.asinOrUpc}&country=${record.countryId}&stores=${record.stores[0].name}&queue=false&searchId=${record.id}`)
        } else {
            const storeNames = record.stores.map(store => store.name).join(',');
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
                                                <div
                                                    className="w-4 h-4 mt-2"
                                                    dangerouslySetInnerHTML={{ __html: record.countryFlag.trim() || "" }}
                                                />
                                                <span className="font-normal">{record.country}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2 items-center justify-center">
                                                {[...new Map(record.stores.filter(store => store.logo).map(store => [store.name || store.id, store])).values()].map((store) => (
                                                    <img key={store.id} src={store.logo} alt="" className="object-contain w-10 h-10" />
                                                ))}
                                            </div>

                                        </td>
                                        <td className="px-4 py-3">{record.results}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <TablePagination page={page} perPage={perPage} totalPages={data?.data?.meta?.last_page} handlePageChange={handlePageChange} handlePerPageChange={handlePerPageChange} />
                    <p className="text-green-600 text-end mx-4 mb-2 text-sm">Results will be cleared after 7 days</p>

                </div>
            }
        </div>
    )
}

export default SearchHistory
