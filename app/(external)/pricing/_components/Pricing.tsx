import { FaCheckCircle } from "react-icons/fa";

const Pricing = () => {
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
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-4">
          <h3 className="text-xl font-semibold">Free</h3>
          <p className="text-3xl font-bold">$0</p>

          <p className="text-gray-600">2,000 words per month</p>
          <ul className="mt-4 text-left space-y-2">
            <li className="flex gap-2 items-center">
              <FaCheckCircle className="size-5 text-green-700" /> Only 1 user
              seat
            </li>
            <li className="flex gap-2 items-center">
              <FaCheckCircle className="size-5 text-green-700" /> Unlimited
              Projects
            </li>
            <li className="flex gap-2 items-center">
              <FaCheckCircle className="size-5 text-green-700" /> 90+
              copywriting tools
            </li>
            <li className="flex gap-2 items-center">
              <FaCheckCircle className="size-5 text-green-700" /> Priority email
              support
            </li>
            <li className="flex gap-2 items-center">
              <FaCheckCircle className="size-5 text-gray-500" /> 24+ Languages
            </li>
          </ul>
          <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg w-full">
            Sign Up for Free
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-white p-6 rounded-xl shadow-md relative border-2 border-green-500 flex flex-col gap-4">
          <span className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 text-sm rounded-lg">
            Most Popular
          </span>
          <h3 className="text-xl font-semibold">Pro</h3>
          <p className="text-3xl font-bold mt-2">
            $24<span className="text-lg">/mo</span>
          </p>
          <p className="text-gray-600">20,000 words per month</p>
          <ul className="mt-4 text-left space-y-2">
            <li className="flex gap-2 items-center">
              <FaCheckCircle className="size-5 text-green-700" /> 6 User Seats
            </li>
            <li className="flex gap-2 items-center">
              <FaCheckCircle className="size-5 text-green-700" /> Unlimited
              Projects
            </li>
            <li className="flex gap-2 items-center">
              <FaCheckCircle className="size-5 text-green-700" /> 90+
              copywriting tools
            </li>
            <li className="flex gap-2 items-center">
              <FaCheckCircle className="size-5 text-green-700" /> Priority email
              support
            </li>
            <li className="flex gap-2 items-center">
              <FaCheckCircle className="size-5 text-green-700" /> 24+ Languages
            </li>
          </ul>
          <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg w-full">
            Get Started
          </button>
        </div>

        {/* Business Plan */}
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-4">
          <h3 className="text-xl font-semibold">Business</h3>
          <p className="text-3xl font-bold">
            $45<span className="text-lg">/mo</span>
          </p>
          <p className="text-gray-600">100,000 words per month</p>
          <ul className="mt-4 text-left space-y-2">
            <li className="flex gap-2 items-center">
              <FaCheckCircle className="size-5 text-green-700" /> Chat Interface
            </li>
            <li className="flex gap-2 items-center">
              <FaCheckCircle className="size-5 text-green-700" /> Unlimited User
              Seats
            </li>
            <li className="flex gap-2 items-center">
              <FaCheckCircle className="size-5 text-green-700" /> 90+
              copywriting tools
            </li>
            <li className="flex gap-2 items-center">
              <FaCheckCircle className="size-5 text-green-700" /> Private
              company infobase
            </li>
            <li className="flex gap-2 items-center">
              <FaCheckCircle className="size-5 text-green-700" /> SOC 2
              compliant
            </li>
          </ul>
          <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg w-full">
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
