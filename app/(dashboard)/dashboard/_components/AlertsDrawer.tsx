"use client";

import { useState } from "react";
import { Drawer } from "antd";
import { RxArrowTopRight } from "react-icons/rx";
import { IoClose } from "react-icons/io5";

const AlertsDrawer = () => {
  const [open, setOpen] = useState(false);

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={showDrawer}
        className="border border-border bg-white px-3 py-2 rounded-xl flex gap-1 items-center font-semibold active:scale-95 duration-200 text-sm md:text-base"
      >
        See all alerts
        <RxArrowTopRight className="size-5" />
      </button>

      <Drawer
        onClose={onClose}
        open={open}
        closable={false}
        width={500}
        styles={{ body: { padding: 0 } }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Alerts</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 border border-border"
          >
            <IoClose className="size-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <div className="border border-border rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Rosemary Mint Scalp & Hair Strengthening Oil Model(399-9243)
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              ASIN:
              <span className="font-medium">B09TQLC5TK</span>
            </p>

            <h4 className="text-2xl font-semibold mt-4">
              This Product is Eligible to Sell
            </h4>

            {/* Alert Details */}
            <div className="mt-4 space-y-3">
              {[
                { label: "Amazon Share Buy Box", value: "Never on Listing" },
                { label: "Private Label", value: "Unlikely" },
                { label: "IP Analysis", value: "No known IP issues" },
                { label: "Size", value: "Standard Size" },
                { label: "Meltable", value: "No" },
                { label: "Variations", value: "No" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="text-sm font-medium flex flex-col gap-1"
                >
                  <p className="text-[#525252]">{item.label}</p>
                  <p className="text-[#0A0A0A] rounded-lg p-4 bg-[#FAFAFA]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default AlertsDrawer;
