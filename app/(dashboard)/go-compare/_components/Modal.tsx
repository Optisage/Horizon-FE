"use client"
import { useRef, useState } from "react"
import { GoChevronDown } from "react-icons/go"
import { IoCloseOutline } from "react-icons/io5"
import { RiCheckboxBlankCircleFill } from "react-icons/ri"
import canada from '@/public/assets/svg/gocompare/canada.svg'
import './styles.css'
import Image from "next/image"

interface Store {
    id: string
    name: string
}
interface Country {
    id: string
    name: string
    flag: string
}

const Modal = ({ isOpen, onClose, setDeck }: {
    isOpen: boolean
    onClose: () => void
    setDeck: React.Dispatch<React.SetStateAction<any>> 
}) => {
    const [selectedCountry, setSelectedCountry] = useState<Country>({
        id: "canada",
        name: "Canada",
        flag: canada,
    })
    const [selectedStores, setSelectedStores] = useState<string[]>(["Walmart"])
    const [asinOrUpc, setAsinOrUpc] = useState("");
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null);

    const countries: Country[] = [
        { id: "canada", name: "Canada", flag: canada },
        { id: "usa", name: "United States", flag: canada },
        { id: "uk", name: "United Kingdom", flag: canada },
        { id: "australia", name: "Australia", flag: canada },
        { id: "germany", name: "Germany", flag: canada },
        { id: "france", name: "France", flag: canada },
        { id: "japan", name: "Japan", flag: canada },
    ]

    const stores: Store[] = [
        { id: "walmart", name: "Walmart" },
        { id: "canadian-tire", name: "Canadian Tire" },
        { id: "dollarama", name: "Dollarama" },
        { id: "uline", name: "ULine" },
        { id: "kitchen-stuss-plus", name: "Kitchen Stuss Plus" },
    ]

    const toggleStore = (storeId: string) => {
        if (selectedStores.includes(storeId)) {
            setSelectedStores(selectedStores.filter((id) => id !== storeId))
        } else {
            setSelectedStores([...selectedStores, storeId])
        }
    }

    const handleSearch = () => {
        console.log({
            asinOrUpc,
            selectedCountry,
            selectedStores,
        })
        onClose()
        setDeck("quickSearch")
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden shadow-xl">
                <div className="flex justify-between items-center p-5 pb-4 font-medium">
                    <h2 className="text-lg">Quick Search (100 Products)</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <IoCloseOutline size={22} />
                    </button>
                </div>

                <div className="p-5 pt-0 max-h-[70vh] overflow-y-auto alp">
                    <div className="space-y-4 font-normal">
                        <div>
                            <label htmlFor="asin-upc" className="block text-xs text-[#737379] mb-1.5">
                                Enter ASIN or UPC
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
                                        {/* <span className="mr-2">{selectedCountry.flag}</span> */}
                                        <Image src={selectedCountry.flag} alt='🇨🇦' className="mr-2"/>
                                        <span>{selectedCountry.name}</span>
                                    </div>
                                    <GoChevronDown size={18} color="black"/>
                                </button>

                                {isCountryDropdownOpen && (
                                    <div className="absolute z-10 mt-1 px-2 w-full text-sm bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                        {countries.map((country) => (
                                            <button
                                                key={country.id}
                                                onClick={() => {
                                                    setSelectedCountry(country)
                                                    setIsCountryDropdownOpen(false)
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center border-b"
                                            >
                                                {/* <span className="mr-2">{country.flag}</span> */}
                                                <Image src={country.flag} alt='🇨🇦' className="mr-2"/>
                                                <span>{country.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-[#737379] mb-1.5">Canada Stores</label>
                            <div className="space-y-2">
                                {stores.map((store) => (
                                    <div
                                        key={store.id}
                                        onClick={() => toggleStore(store.id)}
                                        className={`text-xs px-3 py-4 border rounded-md flex items-center justify-between cursor-pointer ${selectedStores.includes(store.id) ? "border-[#4C3CC6] bg-gray-100" : "border-gray-300"
                                            }`}
                                    >
                                        <span>{store.name}</span>
                                        {selectedStores.includes(store.id) ? (
                                            <div className="h-4 w-4 bg-[#365AF9] rounded-full flex items-center justify-center">
                                                <RiCheckboxBlankCircleFill  color="white" size={10}/>
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
                        onClick={onClose}
                        className="px-4 py-1 shadow-lg border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button onClick={handleSearch} className="px-4 py-1 shadow-lg bg-[#18cb96] text-white rounded-md hover:bg-[#15b588]">
                        Search
                    </button>
                </div>
            </div>
        </div>
    )
}
export default Modal
