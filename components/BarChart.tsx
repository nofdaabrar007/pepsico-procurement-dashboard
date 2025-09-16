
import React, { useEffect, useRef } from 'react';

// This is to make TypeScript happy with the Chart.js library loaded from CDN
declare const Chart: any;

interface BarChartProps {
    chartData: {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            backgroundColor: string;
            borderColor: string;
            borderWidth: number;
        }[];
    };
}

const BarChart: React.FC<BarChartProps> = ({ chartData }) => {
    const chartContainer = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<any>(null);

    useEffect(() => {
        if (chartContainer.current) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
            const ctx = chartContainer.current.getContext('2d');
            if (ctx) {
                chartInstance.current = new Chart(ctx, {
                    type: 'bar',
                    data: chartData,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Unique PO Count by Marketer'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Number of POs'
                                }
                            }
                        }
                    }
                });
            }
        }
        
        return () => {
             if (chartInstance.current) {
                chartInstance.current.destroy();
             }
        }
    }, [chartData]);

    return (
        <div className="relative h-96">
            <canvas ref={chartContainer} />
        </div>
    );
};

export default BarChart;
