exports.handler = async (event) => {
  const params = JSON.parse(event.body);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      ...params,
      stream: true
    })
  });

  return {
    statusCode: 200,
    body: await response.text()
  };
};