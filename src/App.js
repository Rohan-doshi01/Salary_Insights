import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './App.css';
import Chart from 'chart.js/auto';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, TablePagination, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Chatbot from './Chatbot';

function App() {
  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'year', direction: 'ascending' });
  const [showGraph, setShowGraph] = useState(false);
  const [filteredJobTitles, setFilteredJobTitles] = useState([]);
  const [filterYear, setFilterYear] = useState('');
  const [showDetailTable, setShowDetailTable] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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

  const handleFilter = (year) => {
    console.log('Filtering data for year:', year);
    setFilterYear(year);
    axios.get(`http://localhost:3000/api/salaries?year=${year}`)
      .then(response => {
        console.log('Filtered jobs:', response.data);
        setFilteredJobTitles(response.data);
        setShowDetailTable(true);
      })
      .catch(error => {
        console.error('Error filtering data:', error);
      });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className="App">
      <div className="header">
        <h1>ML Engineer Salaries (2020 - 2024)</h1>
      </div>
      <div className="content">
        <button
          variant="contained"
          style={{ backgroundColor: '#abb1be', color: 'black' }}
          onClick={() => setShowGraph(!showGraph)}
        >
          {showGraph ? 'Hide Graph' : 'Show Graph'}
        </button>
        <button
          variant="contained"
          style={{ backgroundColor: '#abb1be', color: 'black' }}
          onClick={() => requestSort('averageSalary', 'ascending')}
        >
          Sort by Ascending
        </button>
        <button
          variant="contained"
          style={{ backgroundColor: '#abb1be', color: 'black' }}
          onClick={() => requestSort('averageSalary', 'descending')}
        >
          Sort by Descending
        </button>
        <div className="table-container">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell onClick={() => requestSort('year')}>Year</TableCell>
                  <TableCell onClick={() => requestSort('totalJobs')}>Total Jobs</TableCell>
                  <TableCell onClick={() => requestSort('averageSalary')}>Average Salary (USD)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.map((item, index) => (
                  <TableRow key={index} onClick={() => handleFilter(item.year)}>
                    <TableCell>{item.year}</TableCell>
                    <TableCell>{item.totalJobs}</TableCell>
                    <TableCell>{item.averageSalary}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </div>
        {showGraph && <canvas id="salaryChart" ref={chartRef} width="300" height="150"></canvas>}
        {showDetailTable && (
          <div className="detail-table">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Job Titles in {filterYear}</h2>
              <IconButton onClick={() => setShowDetailTable(false)} style={{ marginLeft: 'auto' }}>
                <CloseIcon />
              </IconButton>
            </div>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Job Title</TableCell>
                    <TableCell>Number of Jobs</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredJobTitles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.job_title}</TableCell>
                      <TableCell>{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredJobTitles.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        )}
        <Chatbot />
      </div>
    </div>
  );
}

export default App;
