import React, { useState } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/en";
import { BsCalendar } from "react-icons/bs";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

const CustomDatePicker: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());

  // Move to previous month
  const handlePrevMonth = () => {
    setSelectedDate((prev) => prev.subtract(1, "month"));
  };

  // Move to next month
  const handleNextMonth = () => {
    setSelectedDate((prev) => prev.add(1, "month"));
  };

  return (
    <div className="flex items-center">
      <button
        aria-label="Previous"
        type="button"
        className="p-2 rounded-l-full border border-gray-300"
        onClick={handlePrevMonth}
      >
        <HiChevronLeft size={16} />
      </button>

      {/* Ant Design DatePicker */}
      <span className="border flex items-center gap-2 px-2">
        <BsCalendar className="size-4" />
        <DatePicker
          picker="month"
          value={selectedDate}
          onChange={(date) => setSelectedDate(date || dayjs())}
          format="MMM YYYY"
          allowClear={false}
          suffixIcon={null}
          className="!border-none !rounded-none !shadow-none !p-1 !text-center !w-[93px]"
          popupClassName="custom-datepicker-popup"
          renderExtraFooter={() => null}
        />
      </span>

      <button
        aria-label="Next"
        type="button"
        className="p-2 rounded-r-full border border-gray-300"
        onClick={handleNextMonth}
      >
        <HiChevronRight size={16} />
      </button>
    </div>
  );
};

export default CustomDatePicker;
