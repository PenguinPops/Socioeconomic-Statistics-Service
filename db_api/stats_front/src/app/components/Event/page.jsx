// Event.jsx
import React from "react";
import { MdLink } from "react-icons/md";

const Event = ({ title, date, link }) => {
  return (
    <div className="py-3 border-b border-gray-200">
      <div className="flex flex-row items-center justify-between">
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
        <a href={link} target="_blank" rel="noopener noreferrer">
          <MdLink size={20} className="text-gray-500" />
        </a>
      </div>
    </div>
  );
};

export default Event;