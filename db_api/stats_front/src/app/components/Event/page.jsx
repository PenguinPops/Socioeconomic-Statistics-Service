import React from "react";
import { MdLink } from "react-icons/md";

const Event = ({ title, date, link }) => {
  return (
    <a 
      href={link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block py-3 border-b border-gray-200 hover:bg-red-50 hover:shadow-[0_0_8px_rgba(239,68,68,0.2)] transition-all duration-200 rounded-2xl"
    >
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <div className="flex flex-col">
          <h3 className="text-lg font-medium mb-3">{title}</h3>
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500 text-gray-100`}
            >
              {date}
            </span>
          </div>
        </div>
        <div className="mr-5">
          <MdLink size={20} className="text-gray-500" />
        </div>
      </div>
    </a>
  );
};

export default Event;