"use client";

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

const TokenChart = ({ chartData, timePeriod, setTimePeriod, loading, error }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartData && chartRef.current) {
      // Clean up previous chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      const ctx = chartRef.current.getContext('2d');
      
      // Determine gradient colors based on price trend
      const isPriceUp = chartData.prices[chartData.prices.length - 1] > chartData.prices[0];
      const gradientColor1 = isPriceUp ? 'rgba(0, 246, 170, 0.8)' : 'rgba(255, 91, 91, 0.8)';
      const gradientColor2 = isPriceUp ? 'rgba(0, 163, 255, 0.8)' : 'rgba(255, 30, 30, 0.8)';
      
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, gradientColor1);
      gradient.addColorStop(1, gradientColor2);
      
      const fillGradient = ctx.createLinearGradient(0, 0, 0, 400);
      fillGradient.addColorStop(0, isPriceUp ? 'rgba(0, 246, 170, 0.2)' : 'rgba(255, 91, 91, 0.2)');
      fillGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      // Create the chart
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: 'Price (USD)',
            data: chartData.prices,
            borderColor: gradient,
            borderWidth: 2,
            pointBackgroundColor: 'rgba(0, 0, 0, 0)',
            pointBorderColor: 'rgba(0, 0, 0, 0)',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: gradientColor1,
            pointHoverRadius: 6,
            pointHoverBorderWidth: 3,
            fill: true,
            backgroundColor: fillGradient,
            tension: 0.4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              padding: 10,
              displayColors: false,
              callbacks: {
                label: function(context) {
                  return `$${context.parsed.y.toFixed(8)}`;
                }
              }
            }
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: timePeriod === '30D' ? 'day' : 'month',
                displayFormats: {
                  day: 'MMM d',
                  month: 'MMM yyyy'
                }
              },
              grid: {
                display: false,
                drawBorder: false,
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.5)',
                maxRotation: 0
              }
            },
            y: {
              grid: {
                color: 'rgba(255, 255, 255, 0.05)',
                drawBorder: false,
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.5)',
                callback: function(value) {
                  return '$' + value.toFixed(6);
                }
              }
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          },
          elements: {
            point: {
              radius: 0, // Hide points by default
            }
          }
        }
      });
    }
    
    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData, timePeriod]);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M23 6l-9.5 9.5-5-5L1 18" />
            <path d="M17 6h6v6" />
          </svg>
          Price History
        </h3>
        <div className="time-period-selector">
          <button 
            className={`time-period-button ${timePeriod === '30D' ? 'active' : ''}`}
            onClick={() => setTimePeriod('30D')}
          >
            30D
          </button>
          <button 
            className={`time-period-button ${timePeriod === '90D' ? 'active' : ''}`}
            onClick={() => setTimePeriod('90D')}
          >
            90D
          </button>
          <button 
            className={`time-period-button ${timePeriod === '1Y' ? 'active' : ''}`}
            onClick={() => setTimePeriod('1Y')}
          >
            1Y
          </button>
          <button 
            className={`time-period-button ${timePeriod === 'All' ? 'active' : ''}`}
            onClick={() => setTimePeriod('All')}
          >
            All
          </button>
        </div>
      </div>
      <div className="chart-wrapper">
        {loading ? (
          <div className="chart-loading">Loading chart data...</div>
        ) : error ? (
          <div className="chart-error">{error}</div>
        ) : (
          <canvas ref={chartRef}></canvas>
        )}
      </div>
      <div className="chart-legend">
        <span>{timePeriod === 'All' ? 'All time' : timePeriod} • Price in USD</span>
      </div>
    </div>
  );
};

export default TokenChart;