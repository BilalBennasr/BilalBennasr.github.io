const axios = require('axios');
const { TextDecoder } = require('util');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': 'https://bilalbennasr.github.io',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': 'https://bilalbennasr.github.io',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: 'Method Not Allowed',
    };
  }

  try {
    const body = JSON.parse(event.body);
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://bilalbennasr.github.io',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'No API Key has been set!' }),
      };
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: body.model || "gpt-4o-mini",
        messages: body.messages,
        max_tokens: body.maxTokens || 150,
        temperature: body.temperature || 1,
        top_p: body.topP || 1,
        n: body.n || 1,
        stop: body.stop || null,
        presence_penalty: body.presencePenalty || 0,
        frequency_penalty: body.frequencyPenalty || 0,
        logit_bias: body.logitBias || {},
        user: body.user || '',
        stream: true,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        responseType: 'stream',
      }
    );

    const decoder = new TextDecoder("utf-8");
    let responseText = '';

    for await (const chunk of response.data) {
      const decodedChunk = decoder.decode(chunk);
      responseText += decodedChunk;
      // Envoyer des morceaux de données à intervalles réguliers
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simuler un délai
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://bilalbennasr.github.io',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ response: responseText }),
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: error.response?.status || 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://bilalbennasr.github.io',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: error.message || 'Internal Server Error' }),
    };
  }
};
