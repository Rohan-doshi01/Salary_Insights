const express = require('express');
const cors = require('cors');
const app = express();
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

app.use(cors());

const data = [];

fs.createReadStream(path.join(__dirname, 'salaries.csv'))
  .pipe(csv())
  .on('data', (row) => {
    data.push(row);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });

app.get('/api/salaries', (req, res) => {
  const { year } = req.query;
  if (year) {
    const filteredData = data.filter(item => item.work_year === year);
    res.json(filteredData);
  } else {
    res.json(data);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
