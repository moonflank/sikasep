import { Chart, registerables } from 'chart.js';
import { categoryStats, monthlyStats } from '../data/mock-data.js';

Chart.register(...registerables);

let monthlyChart;
let categoryChart;

export function renderAdminCharts() {
  const monthlyCanvas = document.getElementById('monthlyChart');
  const categoryCanvas = document.getElementById('categoryChart');

  if (monthlyChart) monthlyChart.destroy();
  if (categoryChart) categoryChart.destroy();

  if (monthlyCanvas) {
    monthlyChart = new Chart(monthlyCanvas, {
      type: 'bar',
      data: {
        labels: monthlyStats.map((item) => item.month),
        datasets: [
          {
            label: 'Jumlah Skrining',
            data: monthlyStats.map((item) => item.total),
            backgroundColor: '#1976C9',
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
          },
        },
      },
    });
  }

  if (categoryCanvas) {
    categoryChart = new Chart(categoryCanvas, {
      type: 'doughnut',
      data: {
        labels: categoryStats.map((item) => item.label),
        datasets: [
          {
            data: categoryStats.map((item) => item.value),
            backgroundColor: categoryStats.map((item) => item.color),
            borderColor: '#FFFFFF',
            borderWidth: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, usePointStyle: true },
          },
        },
      },
    });
  }
}
