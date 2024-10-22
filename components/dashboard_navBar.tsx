import React from "react";
import Logo from "./Logo";
import { FaSearch } from "react-icons/fa";
import { Button } from "./ui/button";
import { IoMdNotificationsOutline } from "react-icons/io";
import Image from "next/image";

interface DashboardNavBarProps {
  children: React.ReactNode;
}

const DashboardNavBar: React.FC<DashboardNavBarProps> = ({ children }) => {
  return (
    <div className="bg-gray-300">
      <nav className="flex h-20 w-full bg-white justify-evenly items-center">
        <div className="text-2xl font-bold  text-black">
          <Logo />
        </div>
        <div className="relative w-1/2 ">
          <div className="relative flex items-center">
            <FaSearch className="absolute left-3 text-black/35 " size={20} />
            <input
              className="bg-gray-300 border outline-none w-full p-2 pl-10 rounded-lg text-black/65"
              placeholder="search Course"
              id="searchHere"
            />
          </div>
        </div>
        <div>
          <Button className="bg-[#5AC35A] w-full">Take Test</Button>
        </div>
        <div>
          <IoMdNotificationsOutline className="text-black h-8 w-8" />
        </div>
        <div className="flex items-center ">
          <Image
            src="/assets/person_feedback.png"
            width={30}
            height={30}
            alt="personIcon"
            className="rounded-full size-8"
          />
          <p className="text-black ">Me</p>
        </div>
      </nav>
      {children}
    </div>
  );
};

export default DashboardNavBar;
