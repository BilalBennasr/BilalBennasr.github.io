const axios = require('axios');

exports.handler = async (event) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', 
      JSON.parse(event.body), 
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify(error.response?.data || 'Error')
    };
  }
};