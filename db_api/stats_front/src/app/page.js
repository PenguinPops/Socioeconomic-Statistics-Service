'use client';

import Menu from "./components/Menu/page";
import Events from "./components/Events/page";
import Filters from "./components/Filters/page";
import ChartComponent from "./components/ChartComponent/page";

import { useState } from 'react';

export default function Home() {
  const [filters, setFilters] = useState(null);

  const handleApplyFilters = (appliedFilters) => {
    setFilters(appliedFilters);
  };

  const handleResetFilters = () => {
    setFilters(null);
  };

  return (
    <div className="grid grid-cols-[16rem_1fr] h-screen">
      {/* Left-side Menu */}
      <div className="border-r border-gray-200 h-full">
        <Menu
          user={{
            name: "Sergey",
            email: "company@example.com",
          }}
        />
      </div>

      {/* Right-side Main Content */}
      <div className="p-4 overflow-auto grid grid-rows-[auto_1fr] gap-4">
        {/* Full-width Chart */}
        <div>
          <ChartComponent filters={filters} />
        </div>

        {/* Filters and Events side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-[32rem_1fr] h-full gap-4">
          <Filters
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
          />
          <Events filters={filters}/>
        </div>
      </div>
    </div>
  );
}
