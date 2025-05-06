'use client';

import Menu from "@/app/components/Menu/page";
import Events from "@/app/components/Events/page";
import Filters from "@/app/components/Filters/page";
import ChartComponent from "@/app/components/ChartComponent/page";
import { LoadingSpinner } from "../components/LoadingSpinner/page";

import { useState } from 'react';
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react"

export default function Home() {
  const [filters, setFilters] = useState(null);
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (!session) {
    redirect('/login?error=SessionRequired');
  }


  const handleApplyFilters = (appliedFilters) => {
    setFilters(appliedFilters);
  };

  const handleResetFilters = () => {
    setFilters(null);
  };

  return (
    <div className="p-4 overflow-x-auto grid grid-cols-1 gap-4 md:grid-cols-1 md:grid-rows-[auto_auto] lg:grid-cols-[1fr] lg:grid-rows-[auto_1fr]">
      {/* Full-width Chart */}
      <div className="md:col-span-full lg:col-span-full">
        <ChartComponent filters={filters} />
      </div>

      {/* Filters and Events to wrap below on small screens */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-[32rem_1fr] h-full">
        <div className="md:row-start-2 lg:row-start-1">
          <Filters
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
          />
        </div>
        <div className="md:row-start-3 lg:row-start-1 h-full">
          <Events filters={filters}/>
        </div>
      </div>
    </div>
  );
}