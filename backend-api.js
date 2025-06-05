
const express = require('express');
const { Client } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/db', async (req, res) => {
  const { query, params, config } = req.body;
  
  const client = new Client(config);
  
  try {
    await client.connect();
    const result = await client.query(query, params);
    await client.end();
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Database error:', error);
    await client.end();
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
