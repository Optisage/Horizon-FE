"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/public/assets/svg/Optisage Logo.svg";
import { CgMenuRightAlt } from "react-icons/cg";
import CountrySelect from "./CountrySelect";
import { useState, useEffect } from "react";
import SearchInput from "./SearchInput";
import UserProfile from "./UserProfile";
import { VscBell, VscBellDot } from "react-icons/vsc";
import { Drawer } from "antd";
import { HiMiniXMark } from "react-icons/hi2";
import { BiCheck, BiTrash } from "react-icons/bi";
import { useLazyGetNotificationsQuery } from "@/redux/api/user";

const DashNav = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [hoveredNotification, setHoveredNotification] = useState<string | null>(null);
  const [getNotification, { data: notificationsData }] = useLazyGetNotificationsQuery()
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">("all");

  useEffect(()=>{
    getNotification({})
  },[])

  // Helper function to format timestamps
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now.getTime() - notifTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Filter notifications based on status
  const notifications = notificationsData?.data || [];
  const filteredNotifications = notifications.filter((notif: any) => {
    if (filterStatus === "all") return true;
    return notif.status === filterStatus;
  });

  const unreadCount = notifications.filter((n: any) => n.status === "unread").length;
  const displayCount = unreadCount > 90 ? "90+" : unreadCount;

  // Validate ASIN format (10 characters, starts with B followed by alphanumeric)
  const isValidASIN = (value: string): boolean => {
    const asinRegex = /^B[A-Z0-9]{9}$/i;
    return asinRegex.test(value);
  };

  // Validate UPC format (12 digits)
  const isValidUPC = (value: string): boolean => {
    const upcRegex = /^\d{12}$/;
    return upcRegex.test(value);
  };

  // Prefetch product route on component mount
  useEffect(() => {
    // Prefetch the product route template
    router.prefetch('/dashboard/product/[id]');
  }, [router]);

  const handleSearch = () => {
    const trimmedValue = searchValue.trim();
    
    if (!trimmedValue) {
      setError("Please enter an ASIN or UPC");
      return;
    }

    if (isValidASIN(trimmedValue)) {
      setError("");
      router.push(`/dashboard/product/${trimmedValue}`);
      setSearchValue("");
    } else if (isValidUPC(trimmedValue)) {
      setError("");
      router.push(`/dashboard/product/${trimmedValue}`);
      setSearchValue("");
    } else {
      setError("Invalid format. Please enter a valid ASIN or UPC");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleChange = (value: string) => {
    setSearchValue(value);
    if (error) {
      setError("");
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    // TODO: Call API to mark notification as read
    console.log("Mark as read:", notificationId);
    // After API call, refetch notifications
    getNotification({});
  };

  const handleDelete = (notificationId: string) => {
    // TODO: Call API to delete notification
    console.log("Delete notification:", notificationId);
    // After API call, refetch notifications
    getNotification({});
  };

  return (
    <nav className="flex items-center justify-between px-5 py-3 md:py-4 lg:px-6 sticky top-0 bg-white lg:shadow-sm lg:border-transparent border-b border-gray-200 z-40 rounded-xl">
        <Image
          src={Logo}
          alt="Logo"
          className="lg:hidden w-1/3 sm:w-[187px] sm:h-[49px]"
          width={187}
          height={49}
          quality={90}
          priority
        />

        <div className="max-w-[484px] w-full hidden lg:block relative">
          <SearchInput
            placeholder="Search by ASIN or UPC"
            value={searchValue}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />
          {error && (
            <p className="absolute top-full text-xs text-red-600 font-medium">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-4 sm:gap-8 md:gap-6 items-center">
          <div className="flex gap-3 ms:gap-6 items-center relative">
            <CountrySelect />
            <div className="relative">
              <VscBell size={25} className=" cursor-pointer" color="#18cb96" onClick={()=>setOpen(true)}/>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {displayCount}
                </span>
              )}
            </div>
            <UserProfile />
          </div>

          <label
            htmlFor="my-drawer-2"
            className="block lg:hidden text-primary-400 md:ml-4 "
          >
            <CgMenuRightAlt size="25" />
          </label>
        </div>

         <Drawer
      open={open}
      placement="right"
      closable={false}
      width={380}
      styles={{ body:{padding: 0} }}
      className="!p-0"
    >
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b">
        <h2 className="text-lg font-medium">Notifications</h2>
        <button
          onClick={() => setOpen(false)}
          className="hover:bg-gray-100 p-1 rounded-full transition"
        >
          <HiMiniXMark size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 px-5 py-3 border-b bg-[#F7F7F7]">
        <button 
          onClick={() => setFilterStatus("all")}
          className={`px-3 py-1 rounded-full text-sm ${
            filterStatus === "all" 
              ? "bg-[#18CB96] text-white" 
              : "bg-[#E4E6EA] text-gray-600"
          }`}
        >
          All
        </button>
        <button 
          onClick={() => setFilterStatus("unread")}
          className={`px-4 py-1 rounded-full text-sm flex items-center gap-1 ${
            filterStatus === "unread" 
              ? "bg-[#18CB96] text-white" 
              : "bg-[#E4E6EA] text-gray-600"
          }`}
        >
          Unread {unreadCount > 0 && <span className="h-2 w-2 bg-red-500 rounded-full inline-block"></span>}
        </button>
        <button 
          onClick={() => setFilterStatus("read")}
          className={`px-4 py-1 rounded-full text-sm ${
            filterStatus === "read" 
              ? "bg-[#18CB96] text-white" 
              : "bg-[#E4E6EA] text-gray-600"
          }`}
        >
          Read
        </button>
      </div>

      {/* Notification List */}
      <div className=" py-4 space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No {filterStatus !== "all" ? filterStatus : ""} notifications
          </div>
        ) : (
          filteredNotifications.map((item: any, index: number) => (
            <div 
              key={item.id} 
              className="w-full even:bg-[#F7F7F7] relative"
              onMouseEnter={() => setHoveredNotification(item.id)}
              onMouseLeave={() => setHoveredNotification(null)}
            >
              <div className="flex gap-3  items-start px-6 py-3">
                <div
                  className={`h-10 w-10 border-none rounded-full border flex items-center justify-center ${
                    item.status === "unread" ? " bg-[#DAF4EC]" : " bg-[#E8E8E8]"
                  }`}
                >
                  <VscBell size={20}  className={` ${
                    item.status === "unread" ? "text-[#009F6D]" : "text-[#444444]"
                  }`}/>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">{item.title}</p>
                  <p className="text-sm text-gray-800">{item.message}</p>
                  <span className="text-xs text-gray-400">{formatTimeAgo(item.created_at)}</span>
                </div>

                {/* Action Buttons - Show on Hover */}
                {hoveredNotification === item.id && (
                  <div className="flex gap-2 items-center">
                    {item.status === "unread" && (
                      <button
                        onClick={() => handleMarkAsRead(item.id)}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        title="Mark as read"
                      >
                   Mark as read
                      </button>
                    )}
                    {/** 
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                      title="Delete"
                    >
                      <BiTrash size={18} className="text-red-600" />
                    </button>
                    */}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Drawer>
      </nav>
  );
};

export default DashNav;