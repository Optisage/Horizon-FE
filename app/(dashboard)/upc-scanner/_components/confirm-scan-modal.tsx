"use client";

import { useState } from "react";
import { Modal } from "antd";
import { IoClose } from "react-icons/io5";
import ScanVector from "@/public/assets/svg/ufc-scan-vector.svg";

interface ConfirmScanModalProps {
  scanId?: number;
  productName?: string;
  onConfirm: (scanId: number) => void;
  trigger?: React.ReactNode;
}

const ConfirmScanModal: React.FC<ConfirmScanModalProps> = ({
  scanId = 0,
  productName = "this product",
  onConfirm,
  trigger
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);
  
  const handleConfirm = () => {
    if (scanId) {
      onConfirm(scanId);
    }
    handleCancel();
  };

  return (
    <>
      {trigger ? (
        <span onClick={showModal}>{trigger}</span>
      ) : (
        <button
          onClick={showModal}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          Open Modal
        </button>
      )}

      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        closeIcon={null}
        centered
        width={500}
        styles={{
          body: {
            padding: 0,
          },
          content: {
            padding: 0,
            borderRadius: 12,
            overflow: "hidden",
          },
        }}
      >
        <div className="relative">
          {/* Background Image */}
          <div
            className="w-full h-[285px] bg-cover bg-center"
            style={{
              backgroundImage: `url(${ScanVector.src})`,
            }}
          />

          {/* Header */}
          <div className="absolute top-3 z-10 w-full flex items-center justify-between gap-8 px-4 border-b pb-3">
            <h4 className="text-[#0A0A0A] font-medium text-lg">
              Refresh Product Scan
            </h4>
            <button
              onClick={handleCancel}
              aria-label="Close"
              className="text-gray-500 hover:text-gray-700 bg-white p-2 rounded-full shadow-md shadow-[#00000026]"
            >
              <IoClose className="size-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="pb-6 p-4">
            <div className="bg-[#FAF5EC] rounded-2xl p-4 text-center flex flex-col gap-4">
              <p className="text-[#CA7D09] font-medium text-base max-w-[300px] mx-auto">
                Are you sure you want to refresh the scan for {productName}?
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-white rounded-[10px] px-6 py-2 text-black text-sm font-medium"
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="bg-[#FFC56E] border border-[#F6E6CF] rounded-[10px] px-6 py-2 text-black text-sm font-medium"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ConfirmScanModal;

