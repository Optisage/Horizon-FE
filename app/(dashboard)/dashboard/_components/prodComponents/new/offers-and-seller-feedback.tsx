import { MdOutlineInsertChartOutlined } from "react-icons/md";

type Seller = {
  id: string;
  type: string;
  name: string;

  price: number;
  stock: string;
};

const sellers: Seller[] = [
  {
    id: "1",
    type: "FBA",
    name: "Madelyn Herwitz",
    price: 20,
    stock: "21",
  },
  {
    id: "2",
    type: "FBM",
    name: "Erin Korsgaard",
    price: 12,
    stock: "18",
  },
  {
    id: "3",
    type: "FBM",
    name: "Haylie George",
    price: 123,
    stock: "23",
  },
];

const OffersAndSellerFeedback = () => {
  return (
    <div className="rounded-xl bg-white p-4 lg:p-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="bg-primary px-3 py-1.5 rounded-3xl text-white font-semibold text-sm w-max flex items-center gap-1.5"
        >
          <MdOutlineInsertChartOutlined className="size-5" />
          Offers
        </button>
        <button
          type="button"
          className="bg-[#F3F4F6] px-3 py-1.5 rounded-3xl text-[#676A75] font-semibold text-sm w-max flex items-center gap-1.5"
        >
          <MdOutlineInsertChartOutlined className="size-5" />
          Seller Feedback
        </button>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead>
            <tr className="border-b bg-[#F7F7F7] font-medium">
              <th className="p-4">S/N</th>
              <th className="p-4">Type</th>
              <th className="p-4">Seller</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Price</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((seller) => (
              <tr
                key={seller.name}
                className="border-b last:border-none text-[#252525] text-sm"
              >
                <td className="p-4">{seller.id}</td>
                <td className="p-4 min-w-[150px]">{seller.name}</td>
                <td className="p-4">{seller.type}</td>
                <td className="p-4">{seller.stock}</td>
                <td className="p-4">${seller.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OffersAndSellerFeedback;

