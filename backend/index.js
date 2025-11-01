// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 4000;

// Middleware
app.use(cors()); // Allow your React app to talk to this server
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() }); // Store file in memory

// Setup Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Using Flash for speed and large context

// Function to extract text from PDF
async function getTextFromPDF(buffer) {
  const data = await pdf(buffer);
  return data.text;
}

// --- Your First Button's API ---
app.post('/api/explain', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const docText = await getTextFromPDF(req.file.buffer);

    const prompt = `
      You are a helpful study assistant. A student has uploaded a document. 
      Please do the following based on this text:
      1. Provide a concise, one-paragraph summary of the entire document.
      2. Provide a simple set of bullet-point notes covering the main topics.

      Document Text:
      """
      ${docText}
      """
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ explanation: response.text() });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing document.');
  }
});

// --- Your Second Button's API ---
app.post('/api/explain-more', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const docText = await getTextFromPDF(req.file.buffer);

    const prompt = `
      You are an expert tutor. A student has uploaded a document and needs a detailed breakdown.
      Please provide a deep, step-by-step explanation of the content.
      - If there are calculations, explain the math and the steps.
      - If there is programming code, explain the logic line-by-line.
      - If it's a concept, explain it with examples or analogies.

      Document Text:
      """
      ${docText}
      """
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ detailedExplanation: response.text() });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing document.');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});