const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = 5000;

app.use(express.json());

app.post('/track', async (req, res) => {
  const ip = req.body.ip;
  
  try {
    // Get the location data from ipapi
    const response = await axios.get(`http://ipapi.co/${ip}/json/`);
    const locationData = response.data;

    // Log the location data to a file
    fs.appendFile('visitor_logs.txt', JSON.stringify(locationData) + '\n', (err) => {
      if (err) throw err;
      console.log('Visitor location logged:', locationData);
    });

    res.status(200).send('Location logged');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging location');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
