'use client';

import React, { useState, useEffect } from 'react';
import { RangeSlider } from "react-double-range-slider";
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';


const ApiBuilder = () => {
    // State for selected option (only one can be selected at a time)
    const [selectedOption, setSelectedOption] = useState(null);

    // State for retirement type dropdown
    const [retirementTypes, setRetirementTypes] = useState([]);
    const [selectedRetirementType, setSelectedRetirementType] = useState('');

    // State for year range
    const [yearRange, setYearRange] = useState({ min: 2000, max: 2024 });
    const yearLimits = { min: 2000, max: 2024 };

    // State for API URL and response
    const [apiUrl, setApiUrl] = useState('');
    const [jsonData, setJsonData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch retirement types on mount
    useEffect(() => {
        const fetchRetirementTypes = async () => {
            try {
                const response = await fetch('http://localhost:3018/api/gus/retirement/types');
                const data = await response.json();
                const typesArray = Object.entries(data).map(([id, name]) => ({ id, name }));
                setRetirementTypes(typesArray);
            } catch (error) {
                console.error('Error fetching retirement types:', error);
            }
        };

        fetchRetirementTypes();
    }, []);

    // Update API URL when options change
    useEffect(() => {
        buildApiUrl();
    }, [selectedOption, selectedRetirementType, yearRange]);

    const handleOptionSelect = (option) => {
        setSelectedOption(option === selectedOption ? null : option);
        if (option !== 'retirement') {
            setSelectedRetirementType('');
        }
    };

    const handleYearChange = (value) => {
        setYearRange({
            min: value.min,
            max: value.max
        });
    };

    const buildApiUrl = () => {
        if (!selectedOption) {
            setApiUrl('');
            return;
        }

        let url = 'http://localhost:3018';

        if (selectedOption === 'retirement' && selectedRetirementType) {
            url += `/api/gus/retirement/${selectedRetirementType}/range/${yearRange.min}/${yearRange.max}`;
        } else if (selectedOption !== 'retirement') {
            url += `/api/stats/${selectedOption}/range/${yearRange.min}/${yearRange.max}`;
        } else {
            url = '';
        }

        setApiUrl(url);
    };

    const fetchData = async () => {
        if (!apiUrl) return;

        setIsLoading(true);
        setError(null);
        setJsonData(null);

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            setJsonData(data);
        } catch (err) {
            setError('Error fetching data');
            console.error('Fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(apiUrl);
        alert('URL copied to clipboard!');
    };

    const options = [
        { value: 'inflation', label: 'Inflacja' },
        { value: 'avg', label: 'Średnia krajowa' },
        { value: 'pkb', label: 'PKB' },
        { value: 'minimal', label: 'Minimalna krajowa' },
        { value: 'retirement', label: 'Emerytura' }
    ];

    const { data: session, status } = useSession()

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (!session) {
        redirect('/login?error=SessionRequired');
    }


    return (
        <div className="w-full mx-auto p-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">API URL Builder</h1>

                <div className="grid grid-cols-5 gap-4 mb-6">
                    {options.map(option => (
                        <button
                            key={option.value}
                            onClick={() => handleOptionSelect(option.value)}
                            className={`px-4 py-2 rounded-lg border transition-colors ${selectedOption === option.value
                                    ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {selectedOption === 'retirement' && (
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Typ emerytury:</label>
                        <select
                            value={selectedRetirementType}
                            onChange={(e) => setSelectedRetirementType(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">Wybierz typ emerytury</option>
                            {retirementTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex justify-center mb-6">
                    <div className="w-full max-w-lg">
                        <RangeSlider
                            from={yearRange.min}
                            to={yearRange.max}
                            step={1}
                            value={{ min: yearLimits.min, max: yearLimits.max }}
                            onChange={handleYearChange}
                            className="px-2"
                            style={{
                                track: {
                                    backgroundColor: '#ffffff',
                                },
                                thumb: {
                                    backgroundColor: '#007bff',
                                },
                            }}
                        />
                    </div>
                </div>



                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Wygenerowane URL:</label>
                    <div className="flex">
                        <input
                            type="text"
                            value={apiUrl}
                            readOnly
                            className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
                        />
                        <button
                            onClick={copyToClipboard}
                            disabled={!apiUrl}
                            className={`px-4 py-2 rounded-r-lg ${!apiUrl ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Copy
                        </button>
                    </div>
                </div>

                <div className="flex gap-4 mb-6 justify-center">
                    <button
                        onClick={fetchData}
                        disabled={!apiUrl || isLoading}
                        className={`px-6 py-2 rounded-lg ${!apiUrl || isLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                    >
                        {isLoading ? 'Loading...' : 'Fetch Data'}
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {jsonData && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-3 text-gray-700">Odpowiedź API:</h2>
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm text-black">
                            {JSON.stringify(jsonData, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApiBuilder;