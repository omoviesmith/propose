const express = require('express');
const robot = require('robotjs');
const app = express();
const { Configuration, OpenAIApi } = require('openai');

app.use(express.json());

// Set headers to allow cross-origin resource sharing (CORS)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.post('/bidform', (req, res) => {
  const { x, y } = req.body;
  const randomX = getRandomOffset(x);
  const randomY = getRandomOffset(y);

  const delayBeforeMove = getRandomDelay();
  const delayBeforeClick = getRandomDelay();

  setTimeout(() => {
    //robot.moveMouseSmooth(randomX, randomY);
    robot.moveMouseSmooth(x, y);
    setTimeout(() => {
      robot.mouseClick();
      res.json({ message: 'Button clicked successfully' });
    }, delayBeforeClick);
  }, delayBeforeMove);
});

app.post('/typeProposal', async(req, res) => {
  const { x, y, cleanedResponseText } = req.body;
  const randomX = getRandomOffset(x);
  const randomY = getRandomOffset(y);

  const delayBeforeMove = getRandomDelay();

  setTimeout(() => {
    robot.moveMouseSmooth(randomX, randomY);
    robot.mouseClick();
    robot.typeString(cleanedResponseText);
    setTimeout(() => {
    }, 30000);
    res.json({ message: 'Done typing proposal successfully' });
  }, delayBeforeMove);
});

// Define the /proposal endpoint
app.post('/proposal', async (req, res) => {
  const { prompt } = req.body;

  // Call OpenAI API with prompt to get the responseText
  const configuration = new Configuration({
    apiKey: "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",
  });
  const openai = new OpenAIApi(configuration);
  
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.5,
      max_tokens: 500,
    });
    const responseText = completion.data.choices[0].text.trim().replace(/\n/g, "<br>");
    const cleanedResponseText = responseText.replace(/.*Dear Sir\s*(?:\n\S.*)*/s, "Dear Sir").replace(/<br>/g, "\n");

    res.json({ responseText: cleanedResponseText });
    console.log("Bid created successfully");
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({ error: "Failed to retrieve response from OpenAI API" });
  }
});

function getRandomOffset(value) {
  const maxOffset = 10;
  const randomOffset = Math.floor(Math.random() * (2 * maxOffset + 1)) - maxOffset;
  return value + randomOffset;
}

function getRandomDelay() {
  const minDelay = 200;
  const maxDelay = 500;
  return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
}

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
