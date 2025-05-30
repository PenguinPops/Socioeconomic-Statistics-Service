'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { LoadingSpinner } from '@/app/components/LoadingSpinner/page';
import yaml from 'js-yaml';

const DataRangeDropdown = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [jsonData, setJsonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayFormat, setDisplayFormat] = useState('json'); // json | yaml

  const options = [
    { value: 'inflation', label: 'Wszystkie dane dot. inflacji' },
    { value: 'pkb', label: 'Wszystkie dane dot. PKB' },
    { value: 'minimal', label: 'Wszystkie dane dot. płacy minimalnej' },
    { value: 'avg', label: 'Wszystkie dane dot. płacy średniej' },
    { value: 'retirement', label: 'Wszystkie dane dot. emerytur' },
    { value: 'events', label: 'Wszystkie dane dot. wydarzeń' }
  ];

  const formats = [
    { value: 'json', label: 'Wyświetl jako JSON' },
    { value: 'yaml', label: 'Wyświetl jako YAML' }
  ];

  const fetchData = async (option) => {
    setIsLoading(true);
    setError(null);

    try {
      let response;
      if (option === 'retirement') {
        const typesResponse = await fetch('http://localhost:3018/api/gus/retirement/types');
        const typesData = await typesResponse.json();

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
      } else if (option === 'events') {
        const res = await fetch('http://localhost:3018/api/events/range/2000/2024');
        response = await res.json();
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

  const jsonToXml = (obj, root = 'root') => {
    let xml = `<${root}>`;

    const convert = (obj) => {
      for (let key in obj) {
        const value = obj[key];
        if (Array.isArray(value)) {
          value.forEach((item) => {
            xml += `<${key}>`;
            convert(item);
            xml += `</${key}>`;
          });
        } else if (typeof value === 'object' && value !== null) {
          xml += `<${key}>`;
          convert(value);
          xml += `</${key}>`;
        } else {
          xml += `<${key}>${value}</${key}>`;
        }
      }
    };

    convert(obj);
    xml += `</${root}>`;
    return xml;
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(jsonData, null, 2);
    downloadFile(jsonStr, 'dane.json', 'application/json');
  };

  const handleDownloadXml = () => {
    const xmlStr = jsonToXml(jsonData);
    downloadFile(xmlStr, 'dane.xml', 'application/xml');
  };

  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (!session) {
    redirect('/login?error=SessionRequired');
  }

  return (
    <div className="w-full mx-auto p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h1 className="text-xl font-bold mb-4 text-gray-700">Pobierz pełne zakresy danych</h1>

        {/* Dropdown 1 – Typ danych */}
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

        {/* Dropdown 2 – Format danych */}
        <select
          value={displayFormat}
          onChange={(e) => setDisplayFormat(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded-lg hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700"
        >
          {formats.map((fmt) => (
            <option key={fmt.value} value={fmt.value}>
              {fmt.label}
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
            <h2 className="text-lg font-semibold mb-2 text-gray-700">
              Dane ({displayFormat.toUpperCase()}):
            </h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm text-black whitespace-pre-wrap h-[500px]">
              {displayFormat === 'json'
                ? JSON.stringify(jsonData, null, 2)
                : yaml.dump(jsonData)}
            </pre>

            <div className="mt-4 flex gap-4">
              <button
                onClick={handleDownloadJson}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
              >
                Pobierz JSON
              </button>
              <button
                onClick={handleDownloadXml}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow"
              >
                Pobierz XML
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataRangeDropdown;
