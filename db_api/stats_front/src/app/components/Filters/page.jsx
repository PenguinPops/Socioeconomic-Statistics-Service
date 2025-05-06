'use client';

import React, { useState, useEffect } from 'react';
import { RangeSlider } from "react-double-range-slider";
import FilterButton from './FilterButton';

const Filters = ({ onApplyFilters, onResetFilters }) => {
    const [selectedOptions, setSelectedOptions] = useState({
        inflacja: false,
        sredniaKrajowa: false,
        PKB: false,
        minimalnaKrajowa: false,
        emerytura: false,
    });

    const [retirementTypes, setRetirementTypes] = useState([]);
    const [dropdownOption, setDropdownOption] = useState('');
    const [yearRange, setYearRange] = useState({ min: 2010, max: 2018 });
    const yearLimits = { min: 2004, max: 2024 };

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

    const handleCheckboxChange = (key) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
        
        // Reset dropdown option when emerytura is deselected
        if (key === 'emerytura' && selectedOptions.emerytura) {
            setDropdownOption('');
        }
    };

    const handleYearChange = (value) => {
        setYearRange({
            min: value.min,
            max: value.max
        });
    };

    const handleApplyFilters = () => {
        onApplyFilters({
            selectedOptions,
            dropdownOption: selectedOptions.emerytura ? dropdownOption : '',
            yearRange: [yearRange.min, yearRange.max]
        });
    };

    const handleResetFilters = () => {
        setSelectedOptions({
            inflacja: false,
            sredniaKrajowa: false,
            PKB: false,
            minimalnaKrajowa: false,
            emerytura: false,
        });
        setDropdownOption('');
        setYearRange({ min: 2010, max: 2018 });
        onResetFilters();
    };

    return (
        <div className="max-w-2xl h-[450px] text-gray-700">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-black h-[450px] overflow-y-auto">
                <h1 className="text-xl font-bold mb-4 text-gray-500">Filtry</h1>
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <FilterButton
                        label="Inflacja"
                        isSelected={selectedOptions.inflacja}
                        onClick={() => handleCheckboxChange('inflacja')}
                    />
                    <FilterButton
                        label="Średnia Krajowa"
                        isSelected={selectedOptions.sredniaKrajowa}
                        onClick={() => handleCheckboxChange('sredniaKrajowa')}
                    />
                    <FilterButton
                        label="PKB"
                        isSelected={selectedOptions.PKB}
                        onClick={() => handleCheckboxChange('PKB')}
                    />
                    <FilterButton
                        label="Minimalna Krajowa"
                        isSelected={selectedOptions.minimalnaKrajowa}
                        onClick={() => handleCheckboxChange('minimalnaKrajowa')}
                    />
                </div>

                <div className="mb-4 flex justify-between items-center">
                    <FilterButton
                        label="Emerytura"
                        isSelected={selectedOptions.emerytura}
                        onClick={() => handleCheckboxChange('emerytura')}
                    />
                    <select
                        value={dropdownOption}
                        onChange={(e) => setDropdownOption(e.target.value)}
                        disabled={!selectedOptions.emerytura || retirementTypes.length === 0}
                        className={`p-2 border rounded-lg w-full max-w-xs transition-colors ${
                            !selectedOptions.emerytura || retirementTypes.length === 0
                                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                                : 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        }`}
                    >
                        <option value="">Wybierz typ emerytury</option>
                        {retirementTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='flex flex-col items-center'>
                    <h2 className='text-xl text-gray-700'>Zakres lat</h2>
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
                <div className="flex flex-row-reverse gap-8 justify-center mt-4">
                    <button
                        onClick={handleApplyFilters}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Zastosuj Filtry
                    </button>
                    <button
                        onClick={handleResetFilters}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Resetuj Filtry
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Filters;