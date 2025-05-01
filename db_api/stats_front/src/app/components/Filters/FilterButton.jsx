import React from 'react';

const FilterButton = ({ label, isSelected, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg border transition-colors ${
                isSelected
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-sky-200'
            }`}
        >
            {label}
        </button>
    );
};

export default FilterButton;