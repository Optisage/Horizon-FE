import { MdOutlineInsertChartOutlined } from "react-icons/md";
import { FaStar } from "react-icons/fa";

type Seller = {
  name: string;
  reviews: number;
  price: number;
  won: string;
  lastWon: string;
};

const sellers: Seller[] = [
  {
    name: "T0SSI",
    reviews: 763,
    price: 30.08,
    won: "21%",
    lastWon: "3 weeks ago",
  },
  {
    name: "Peak Health",
    reviews: 347,
    price: 29.65,
    won: "18%",
    lastWon: "2 weeks ago",
  },
  {
    name: "CB Int",
    reviews: 213,
    price: 31.58,
    won: "23%",
    lastWon: "3 weeks ago",
  },
];

const TopSellers = () => {
  return (
    <div className="rounded-xl bg-white p-4 lg:p-5">
      <span className="bg-primary px-3 py-1.5 rounded-3xl text-white font-semibold text-sm w-max flex items-center gap-1.5">
        <MdOutlineInsertChartOutlined className="size-5" />
        Top Sellers
      </span>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead>
            <tr className="border-b bg-[#F7F7F7] font-medium">
              <th className="p-4">Seller</th>
              <th className="p-4">Price</th>
              <th className="p-4">Won</th>
              <th className="p-4">Last Won</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((seller) => (
              <tr
                key={seller.name}
                className="border-b last:border-none text-[#252525] text-sm"
              >
                <td className="p-4 min-w-[160px]">
                  <div>
                    {seller.name} ({seller.reviews})
                  </div>
                  <div className="flex text-yellow-400 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaStar key={i} className="size-3" />
                    ))}
                  </div>
                </td>
                <td className="p-4">${seller.price.toFixed(2)}</td>
                <td className="p-4">{seller.won}</td>
                <td className="p-4 whitespace-nowrap">{seller.lastWon}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopSellers;

