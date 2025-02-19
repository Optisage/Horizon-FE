"use client"
import { useLazyGetPricingQuery } from "@/redux/api/auth";
import { setSubScriptionId } from "@/redux/slice/globalSlice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useDispatch } from "react-redux";

const Pricing = () => {
  const dispatch = useDispatch(); // Initialize dispatch
  const router = useRouter(); // Initialize dispatch
  const [getPricing, {data, isLoading}] = useLazyGetPricingQuery()

  useEffect(()=>{
    getPricing({})
  },[])

  console.log(data)
 // Assuming response.payload.data is available
 // Ensure data is defined before mapping
 const subInfo = data?.data ? data.data.map(item => ({
  key: item.id,
  title: item.name,
  price: item.price,
  subTitle: `${item.price === '0.00' ? '2,000 words per month' : item.price === '24.00' ? '20,000 words per month' : '100,000 words per month'}`,
  subItems: [
    item.name === 'Free' ? 'Only 1 user seat' : item.name === 'Pro' ? '6 User Seats' : 'Unlimited User Seats',
    'Unlimited Projects',
    '90+ copywriting tools',
    'Priority email support',
    item.name === 'Pro' ? '24+ Languages' : null,
    item.name === 'Business' ? 'Private company infobase' : null,
    item.name === 'Business' ? 'SOC 2 compliant' : null,
  ].filter(Boolean) // Remove null values
})) : [];

  return (
    <section className="py-12 px-4 bg-gray-100 h-dvh flex flex-col gap-12">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold">Our Pricing</h2>
        <p className="text-gray-600 mt-2">
          At Outgrid, we offer flexible pricing options to match your content
          needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto font-medium">
        {/* Free Plan */}
        {
          subInfo.map((item, index)=> (
            <div className={`${item.title === 'Pro'? "border-2 border-green-500":""} h-fit bg-white p-6 rounded-xl shadow-md flex flex-col gap-4 relative`} key={index}>
               {
                item.title === "Pro" && (
                  <span className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 text-sm rounded-lg">
            Most Popular
          </span>
                )
               }
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <p className="text-3xl font-bold">
              ${item.price}
              <span className="text-lg">/mo</span>
              </p>
  
            <p className="text-gray-600">{item.subTitle}</p>
            <ul className="mt-4 text-left space-y-2">
              {
                item.subItems.map((subItem, index)=>(
                  <li className="flex gap-2 items-center" key={index}>
                  <FaCheckCircle className="size-5 text-green-700" /> {subItem}
                </li>
                ))
              }
             
              
            </ul>
            <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg w-full"
           onClick={() => {
            console.log("Item being dispatched:", item); // Log the item
            dispatch(setSubScriptionId(item.key)); 
            router.push('/checkout');
          }}
            >
            {
              item.title === "Free"? '  Sign Up for Free' : 'Get Started'
            }
            </button>
          </div>
          ))
        }
      
      </div>
    </section>
  );
};

export default Pricing;
