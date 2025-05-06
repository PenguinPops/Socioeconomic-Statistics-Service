'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

const ChartComponent = ({ filters }) => {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retirementTypeNames, setRetirementTypeNames] = useState({});

  // Map filter options to API endpoints
  const statEndpoints = {
    inflacja: 'inflation',
    sredniaKrajowa: 'avg',
    PKB: 'pkb',
    minimalnaKrajowa: 'minimal',
    emerytura: 'retirement'
  };

  // Fetch retirement type names
  useEffect(() => {
    const fetchRetirementTypeNames = async () => {
      try {
        const response = await fetch('http://localhost:3018/api/gus/retirement/types');
        const data = await response.json();
        setRetirementTypeNames(data);
      } catch (err) {
        console.error('Error fetching retirement types:', err);
      }
    };

    fetchRetirementTypeNames();
  }, []);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      if (!filters) return;

      setLoading(true);
      setError(null);

      try {
        const { selectedOptions, dropdownOption, yearRange } = filters;
        const [startYear, endYear] = yearRange;

        // Prepare all data requests
        const dataRequests = Object.entries(selectedOptions)
          .filter(([key, value]) => value && key !== 'emerytura')
          .map(async ([key]) => {
            const endpoint = statEndpoints[key];
            const response = await fetch(
              `http://localhost:3018/api/stats/${endpoint}/range/${startYear}/${endYear}`
            );
            const data = await response.json();
            return { stat: endpoint, data: data.data };
          });

        // Handle retirement data separately if selected
        if (selectedOptions.emerytura && dropdownOption) {
          const retirementResponse = await fetch(
            `http://localhost:3018/api/gus/retirement/${dropdownOption}/range/${startYear}/${endYear}`
          );
          const retirementData = await retirementResponse.json();
          dataRequests.push(Promise.resolve({
            stat: 'emerytura',
            data: retirementData.data.map(item => ({
              year: item.year,
              value: item.val  // Note: using 'val' instead of 'value'
            })),
            retirementTypeId: dropdownOption
          }));
        }

        // Wait for all data to be fetched
        const allData = await Promise.all(dataRequests);

        // Process the data for Chart.js
        const datasets = [];
        const years = new Set();

        allData.forEach((dataItem) => {
          if (!dataItem.data) return;

          // Collect all unique years
          dataItem.data.forEach(item => years.add(item.year));

          // Determine chart type and styling based on the stat
          let chartType, backgroundColor, borderColor, borderWidth, label;

          switch (dataItem.stat) {
            case 'inflation':
              chartType = 'line';
              backgroundColor = 'rgba(255, 99, 132, 0.5)';
              borderColor = 'rgba(255, 99, 132, 1)';
              borderWidth = 2;
              label = 'Inflacja (%)';
              break;
            case 'minimal':
              chartType = 'line';
              backgroundColor = 'rgba(75, 192, 192, 0.5)';
              borderColor = 'rgba(75, 192, 192, 1)';
              borderWidth = 2;
              label = 'Minimalna krajowa (zł)';
              break;
            case 'avg':
              chartType = 'line';
              backgroundColor = 'rgba(153, 102, 255, 0.5)';
              borderColor = 'rgba(153, 102, 255, 1)';
              borderWidth = 2;
              label = 'Średnia krajowa (zł)';
              break;
            case 'emerytura':
              chartType = 'line';
              backgroundColor = 'rgba(255, 159, 64, 0.5)';
              borderColor = 'rgba(255, 159, 64, 1)';
              borderWidth = 2;
              label = `${retirementTypeNames[dataItem.retirementTypeId] || 'Emerytura'} (zł)`;
              break;
            case 'pkb':
              chartType = 'bar';
              backgroundColor = 'rgba(54, 162, 235, 0.5)';
              borderColor = 'rgba(54, 162, 235, 1)';
              borderWidth = 1;
              label = 'PKB (zł na os.)';
              break;
          }

          datasets.push({
            type: chartType,
            label: label,
            data: dataItem.data.map(item => ({
              x: item.year,
              y: dataItem.stat === 'inflation' ? item.value - 100 : item.value
            })),
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: borderWidth,
            yAxisID: dataItem.stat === 'inflation' ? 'y1' : 'y'
          });
        });

        // Sort years in ascending order
        const sortedYears = Array.from(years).sort((a, b) => a - b);

        const sortedDatasets = [
          ...datasets.filter(ds => ds.type === 'line'),
          ...datasets.filter(ds => ds.type === 'bar'),
        ];
        
        setChartData({
          labels: sortedYears,
          datasets: sortedDatasets,
        });
        

      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Wystąpił błąd podczas ładowania danych. Spróbuj ponownie.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, retirementTypeNames]);

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Dane statystyczne',
        font: {
          size: 18
        },
        align:'left'
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              // Format numbers differently based on the dataset
              if (context.dataset.label.includes('PKB')) {
                label += new Intl.NumberFormat('pl-PL', {
                  style: 'decimal',
                  maximumFractionDigits: 2
                }).format(context.parsed.y);
              } else if (context.dataset.label.includes('zł')) {
                label += new Intl.NumberFormat('pl-PL', {
                  style: 'decimal',
                  maximumFractionDigits: 2
                }).format(context.parsed.y) + ' zł';
              } else if (context.dataset.label.includes('%')) {
                label += new Intl.NumberFormat('pl-PL', {
                  style: 'decimal',
                  maximumFractionDigits: 2
                }).format(context.parsed.y) + '%';
              } else {
                label += context.parsed.y.toLocaleString('pl-PL');
              }
            }
            return label;
          }
        }
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Wartość'
        },
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat('pl-PL').format(value);
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Inflacja (%)'
        },
        ticks: {
          callback: function (value) {
            return value + '%';
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Błąd!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-[460px] bg-gray-50 rounded-lg">
        <p className="text-gray-500">Wybierz filtry aby wyświetlić dane</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[460px] p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <Chart
        ref={chartRef}
        type='bar'
        options={options}
        data={{
          labels: chartData.labels,
          datasets: chartData.datasets
        }}
      />
    </div>
  );
};

export default ChartComponent;