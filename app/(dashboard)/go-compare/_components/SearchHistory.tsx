"use client";
import { useEffect, useState } from "react";
import TablePagination from "./TablePagination";
import puma from '@/public/assets/svg/gocompare/puma.svg'
import canada from '@/public/assets/svg/gocompare/canada.svg'
import Image from "next/image";
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
        country: "Canada",
        countryCode: "ca",
        store: item.store.name,
        storeLogo: 'logo',
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
                                                <Image
                                                    src={canada}
                                                    alt={record.country}
                                                    width={16}
                                                    height={16}
                                                    quality={90} priority unoptimized
                                                    className="rounded-sm"
                                                />
                                                <span className="font-normal">{record.country}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {/* <Image
                                                src={record.storeLogo}
                                                alt={record.store}
                                                width={30}
                                                height={30}
                                                quality={90} priority unoptimized /> */}
                                            <Image
                                                src={puma}
                                                alt={record.store}
                                                width={30}
                                                height={30}
                                                quality={90} priority unoptimized />
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


// "use client";
// import { useEffect, useState } from "react";
// import TablePagination from "./TablePagination";
// import puma from '@/public/assets/svg/gocompare/puma.svg'
// import tesco from '@/public/assets/svg/gocompare/tesco.svg'
// import walmart from '@/public/assets/svg/gocompare/walmart.svg'
// import adidas from '@/public/assets/svg/gocompare/adidas.svg'
// import canada from '@/public/assets/svg/gocompare/canada.svg'
// import Image from "next/image";

// export interface SearchRecord {
//     id: number
//     asinOrUpc: string
//     searchType: string
//     searchDate: string
//     amazonPrice: string
//     country: string
//     countryCode: string
//     store: string
//     storeLogo: string
//     results: number
// }

// const searchData: SearchRecord[] = [
//     {
//         id: 1,
//         asinOrUpc: "B08CKLQLZI",
//         searchType: "Quick search",
//         searchDate: "21/02/2023",
//         amazonPrice: "$280.00",
//         country: "Canada",
//         countryCode: "ca",
//         store: "Walmart",
//         storeLogo: walmart,
//         results: 234,
//     },
//     {
//         id: 2,
//         asinOrUpc: "R347QWERTY9",
//         searchType: "Seller Products",
//         searchDate: "22/09/2023",
//         amazonPrice: "$450.00",
//         country: "US",
//         countryCode: "us",
//         store: "Puma",
//         storeLogo: puma,
//         results: 789,
//     },
//     {
//         id: 3,
//         asinOrUpc: "C56TYUIOP8",
//         searchType: "Search with filter",
//         searchDate: "30/12/2023",
//         amazonPrice: "$275.00",
//         country: "UK",
//         countryCode: "gb",
//         store: "TESCO",
//         storeLogo: tesco,
//         results: 123,
//     },
//     {
//         id: 4,
//         asinOrUpc: "D78PLMKOP5",
//         searchType: "Scan brands",
//         searchDate: "01/01/2026",
//         amazonPrice: "-",
//         country: "Canada",
//         countryCode: "ca",
//         store: "Puma",
//         storeLogo: puma,
//         results: 321,
//     },
//     {
//         id: 5,
//         asinOrUpc: "E90ASDFGH4",
//         searchType: "Most wanted",
//         searchDate: "11/11/2024",
//         amazonPrice: "-",
//         country: "Canada",
//         countryCode: "ca",
//         store: "Adidas",
//         storeLogo: adidas,
//         results: 654,
//     },
//     {
//         id: 6,
//         asinOrUpc: "F12QWERTY3",
//         searchType: "Import product",
//         searchDate: "05/05/2025",
//         amazonPrice: "$800.00",
//         country: "Canada",
//         countryCode: "ca",
//         store: "Walmart",
//         storeLogo: walmart,
//         results: 987,
//     },
//     {
//         id: 7,
//         asinOrUpc: "G45ZXCVBN2",
//         searchType: "Quick search",
//         searchDate: "20/02/2024",
//         amazonPrice: "$999.99",
//         country: "Canada",
//         countryCode: "ca",
//         store: "Walmart",
//         storeLogo: walmart,
//         results: 135,
//     },
//     {
//         id: 8,
//         asinOrUpc: "H78QWERTY1",
//         searchType: "Quick search",
//         searchDate: "15/03/2023",
//         amazonPrice: "$120.00",
//         country: "Canada",
//         countryCode: "ca",
//         store: "Puma",
//         storeLogo: puma,
//         results: 246,
//     },
//     {
//         id: 9,
//         asinOrUpc: "J90ASDFGH7",
//         searchType: "Quick search",
//         searchDate: "08/08/2026",
//         amazonPrice: "$350.50",
//         country: "Canada",
//         countryCode: "ca",
//         store: "Puma",
//         storeLogo: puma,
//         results: 852,
//     },
//     {
//         id: 10,
//         asinOrUpc: "K123CVBN9",
//         searchType: "Quick search",
//         searchDate: "12/12/2025",
//         amazonPrice: "$458.75",
//         country: "Canada",
//         countryCode: "ca",
//         store: "Puma",
//         storeLogo: puma,
//         results: 369,
//     },
// ]

// const tableColumns = [
//     { label: 'ASIN or UPC', key: 'asinOrUpc' },
//     { label: 'Type of search', key: 'searchType' },
//     { label: 'Search Date', key: 'searchDate' },
//     { label: 'Amazon Price', key: 'amazonPrice' },
//     { label: 'Country', key: 'country' },
//     { label: 'Store(s)', key: 'storeLogo' },
//     { label: 'No. of results', key: 'results' },
// ]

// const SearchHistory = () => {
//     const [page, setPage] = useState(1)
//     const [perPage, setPerPage] = useState(10)

//     const totalPages = Math.ceil(searchData.length / perPage)
//     const startIndex = (page - 1) * perPage
//     const endIndex = startIndex + perPage
//     const currentData = searchData.slice(startIndex, endIndex)

//     const handlePageChange = (page: number) => {
//         setPage(page)
//     }

//     const handlePerPageChange = (value: number) => {
//         setPerPage(value)
//         setPage(1)
//     }
//     return (
//         <div>
//             <p className="font-semibold">Search History</p>
//             <div className="w-full bg-white mt-5 border border-gray-200 rounded-lg ">
//                 <div className="overflow-x-auto ">
//                     <table className="w-full text-sm ">
//                         <thead>
//                             <tr className="border-b bg-[#FCFCFC]">
//                                 {tableColumns.map((column) => (
//                                     <th key={column.key} className="px-4 py-3 text-left text-[#737379] font-normal">{column.label}</th>
//                                 ))}
//                             </tr>
//                         </thead>
//                         <tbody className="">
//                             {currentData.map((record) => (
//                                 <tr key={record.id} className="font-medium">
//                                     <td className="px-4 pr-20 py-3 ">{record.asinOrUpc}</td>
//                                     <td className="px-4 py-3">{record.searchType}</td>
//                                     <td className="px-4 py-3">{record.searchDate}</td>
//                                     <td className="px-4 py-3">{record.amazonPrice}</td>
//                                     <td className="px-4 py-3">
//                                         <div className="flex items-center gap-2">
//                                             <Image
//                                                 src={canada}
//                                                 alt={record.country}
//                                                 width={16}
//                                                 height={16}
//                                                 quality={90} priority unoptimized
//                                                 className="rounded-sm"
//                                             />
//                                             <span className="font-normal">{record.country}</span>
//                                         </div>
//                                     </td>
//                                     <td className="px-4 py-3">
//                                         <Image
//                                             src={record.storeLogo}
//                                             alt={record.store}
//                                             width={30}
//                                             height={30}
//                                             quality={90} priority unoptimized />
//                                     </td>
//                                     <td className="px-4 py-3">{record.results}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//                 <TablePagination page={page} perPage={perPage} totalPages={totalPages} handlePageChange={handlePageChange} handlePerPageChange={handlePerPageChange} />
//             </div>
//         </div>
//     )
// }

// export default SearchHistory