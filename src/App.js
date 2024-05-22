import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './App.css';
import Chart from 'chart.js/auto';

function App() {
  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'year', direction: 'ascending' });
  const [showGraph, setShowGraph] = useState(false);
  const [filteredJobTitles, setFilteredJobTitles] = useState([]);
  const [filterYear, setFilterYear] = useState('');
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    axios.get('http://localhost:3000/api/salaries')
      .then(response => {
        console.log('Fetched data:', response.data);
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const sortedData = React.useMemo(() => {
    let sortableData = [...data];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const requestSort = (key, direction = 'ascending') => {
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    if (showGraph && data.length > 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: sortedData.map(item => item.year),
          datasets: [{
            label: 'Average Salary (USD)',
            data: sortedData.map(item => item.averageSalary),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }, [showGraph, sortedData, data.length]);

  const handleFilter = () => {
    console.log('Filtering data for year:', filterYear);
    axios.get(`http://localhost:3000/api/salaries?year=${filterYear}`)
      .then(response => {
        console.log('Filtered jobs:', response.data);
        setFilteredJobTitles(response.data);
      })
      .catch(error => {
        console.error('Error filtering data:', error);
      });
  };

  return (
    <div className="App">
      <h1>ML Engineer Salaries (2020 - 2024)</h1>
      <div>
        <button onClick={() => setShowGraph(!showGraph)}>
          {showGraph ? 'Hide Graph' : 'Show Graph'}
        </button>
        <button onClick={() => requestSort('averageSalary', 'ascending')}>Sort by Ascending</button>
        <button onClick={() => requestSort('averageSalary', 'descending')}>Sort by Descending</button>
      </div>
      <table>
        <thead>
          <tr>
            <th onClick={() => requestSort('year')}>Year</th>
            <th onClick={() => requestSort('totalJobs')}>Total Jobs</th>
            <th onClick={() => requestSort('averageSalary')}>Average Salary (USD)</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr key={index}>
              <td>{item.year}</td>
              <td>{item.totalJobs}</td>
              <td>{item.averageSalary}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {showGraph && <canvas id="salaryChart" ref={chartRef} width="300" height="150"></canvas>}
      <div>
        <h2>Filter Job Titles by Year</h2>
        <input 
          type="text" 
          value={filterYear} 
          onChange={(e) => setFilterYear(e.target.value)} 
          placeholder="Enter year" 
        />
        <button onClick={handleFilter}>Filter</button>
      </div>
      {filteredJobTitles.length > 0 && (
        <div>
          <h2>Job Titles in {filterYear}</h2>
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Number of Jobs</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobTitles.map((item, index) => (
                <tr key={index}>
                  <td>{item.job_title}</td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div>
        <h2>Salaries Data Insights Chatbot</h2>
        <iframe
          src="http://localhost:8501"
          width="100%"
          height="500px"
          title="Salaries Data Insights Chatbot"
        ></iframe>
      </div>
    </div>
  );
}

export default App;
