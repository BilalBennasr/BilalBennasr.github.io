// const axios = require('axios');

// exports.handler = async (event) => {
//   if (event.httpMethod !== 'POST') {
//     return {
//       statusCode: 405,
//       body: 'Method Not Allowed'
//     };
//   }

//   try {
//     const body = JSON.parse(event.body);
    
//     const response = await axios.post(
//       'https://api.openai.com/v1/chat/completions',
//       {
//         model: "gpt-4o-mini",
//         messages: body.messages,
//         stream: false
//       },
//       {
//         headers: {
//           'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     return {
//       statusCode: 200,
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(response.data)
//     };
//   } catch (error) {
//     console.error('Error:', error);
//     return {
//       statusCode: error.response?.status || 500,
//       body: JSON.stringify({
//         error: error.response?.data || 'Internal Server Error'
//       })
//     };
//   }
// };

// proxy.mjs
import fetch from 'node-fetch';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    const body = JSON.parse(event.body);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: body.messages,
        stream: true
      })
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      },
      body: response.body
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};