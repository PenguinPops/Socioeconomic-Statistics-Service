'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

const DataRangeDropdown = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [jsonData, setJsonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const options = [
    { value: 'inflation', label: 'Wszystkie dane dot. inflacji' },
    { value: 'pkb', label: 'Wszystkie dane dot. PKB' },
    { value: 'minimal', label: 'Wszystkie dane dot. płacy minimalnej' },
    { value: 'avg', label: 'Wszystkie dane dot. płacy średniej' },
    { value: 'retirement', label: 'Wszystkie dane dot. emerytur' }
  ];

  const fetchData = async (option) => {
    setIsLoading(true);
    setError(null);

    try {
      let response;
      if (option === 'retirement') {
        // First get retirement types
        const typesResponse = await fetch('http://localhost:3018/api/gus/retirement/types');
        const typesData = await typesResponse.json();

        // Then fetch data for each type
        const retirementPromises = Object.keys(typesData).map(async (id) => {
          const res = await fetch(`http://localhost:3018/api/gus/retirement/${id}/range/2000/2024`);
          return res.json();
        });

        const retirementData = await Promise.all(retirementPromises);
        response = {
          stat: 'retirement',
          range: '2000-2024',
          data: retirementData
        };
      } else {
        const res = await fetch(`http://localhost:3018/api/stats/${option}/range/2000/2024`);
        response = await res.json();
      }

      setJsonData(response);
    } catch (err) {
      setError('Wystąpił błąd podczas pobierania danych');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionChange = (e) => {
    const option = e.target.value;
    setSelectedOption(option);
    if (option) {
      fetchData(option);
    }
  };

  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/login?error=SessionRequired');
  }

  return (
    <div className="w-full mx-auto p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h1 className="text-xl font-bold mb-4 text-gray-700">Pobierz pełne zakresy danych</h1>

        <select
          value={selectedOption}
          onChange={handleOptionChange}
          className="w-full p-2 mb-4 border border-gray-300 rounded-lg hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700"
        >
          <option value="">Wybierz zakres danych</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {isLoading && (
          <div className="text-center py-4">
            <p>Ładowanie danych...</p>
          </div>
        )}

        {error && (
          <div className="text-red-500 p-2 mb-4 rounded bg-red-50">
            {error}
          </div>
        )}

        {jsonData && !isLoading && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">Dane JSON:</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm text-black">
              {JSON.stringify(jsonData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataRangeDropdown;