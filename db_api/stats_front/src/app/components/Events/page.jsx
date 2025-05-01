"use client";
import React, { useState, useEffect } from "react";
import Event from "../Event/page";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

const Events = ({ filters }) => {
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        // Use the year range from filters if available, otherwise use default
        const yearRange = filters?.yearRange || [2005, 2010];
        const response = await fetch(
          `http://localhost:3018/api/events/range/${yearRange[0]}/${yearRange[1]}`
        );
        if (!response.ok) throw new Error("Failed to fetch events");

        const data = await response.json();
        setEvents(data.events);

        // Calculate total pages based on actual data length
        setTotalPages(Math.ceil(data.events.length / itemsPerPage));
        setCurrentPage(1); // Reset to first page when filters change
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [filters]); // Now depends on filters prop

  // Get current events for the page
  const getCurrentEvents = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return events.slice(startIndex, endIndex);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (isLoading) return <div className="text-center py-4">Ładowanie...</div>;
  if (error)
    return <div className="text-center py-4 text-red-500">Błąd: {error}</div>;

  const currentEvents = getCurrentEvents();
  const totalEvents = events.length;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalEvents);

  return (
    <div className="w-full h-[550px] text-gray-700">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-black h-[550px] overflow-y-auto">
        <h1 className="text-xl font-bold mb-4 text-gray-500">Wydarzenia prasowe</h1>
        {currentEvents.map((event, index) => (
          <Event
            key={event.date + index}
            title={event.description}
            date={event.date}
            link={event.link}
          />
        ))}
        <div className="flex justify-between items-center mt-4 text-sm">
          <div>
            {startItem} - {endItem} z {totalEvents}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <MdKeyboardArrowLeft size={20} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <MdKeyboardArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;