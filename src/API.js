const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const port = 3000;

app.use(cors());

let salaries = [];

// Function to load and parse CSV data
const loadCSVData = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(path.join(__dirname, 'salaries.csv'))
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        salaries = results;
        console.log('CSV file successfully processed');
        resolve();
      })
      .on('error', (err) => reject(err));
  });
};

// API endpoint to get salary data
app.get('/api/salaries', (req, res) => {
  const { year } = req.query;
  let result;

  if (year) {
    const filteredData = salaries.filter(item => item.work_year === year);
    const jobCount = {};
    filteredData.forEach(job => {
      const jobTitle = job.job_title;
      if (jobCount[jobTitle]) {
        jobCount[jobTitle]++;
      } else {
        jobCount[jobTitle] = 1;
      }
    });
    result = Object.entries(jobCount).map(([job_title, count]) => ({ job_title, count }));
  } else {
    result = salaries.reduce((acc, curr) => {
      const year = curr.work_year;
      const salary = parseFloat(curr.salary_in_usd);

      if (!acc[year]) {
        acc[year] = { year, totalJobs: 0, totalSalary: 0 };
      }

      acc[year].totalJobs += 1;
      acc[year].totalSalary += salary;

      return acc;
    }, {});

    result = Object.values(result).map(item => ({
      year: item.year,
      totalJobs: item.totalJobs,
      averageSalary: (item.totalSalary / item.totalJobs).toFixed(2)
    }));
  }

  res.json(result);
});

// Start server after CSV is loaded
loadCSVData()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Failed to load CSV data:', err);
  });
