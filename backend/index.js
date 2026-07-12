const express = require('express')
const cors = require('cors')
require('dotenv').config()
const multer = require('multer')
const {PDFParse} = require('pdf-parse')

const app = express()
app.use(cors())
app.use(express.json())
const upload = multer({ storage: multer.memoryStorage() })
async function callGeminiWithRetry(prompt, retries = 3) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`

  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    })

    const data = await response.json()

    if (data.candidates) {
      let text = data.candidates[0].content.parts[0].text
      text = text.replace(/```json|```/g, '').trim()
      return JSON.parse(text)
    }

    console.log(`Attempt ${i + 1} failed:`, data.error?.message || 'Unknown error')

    if (i < retries - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  throw new Error('Gemini API failed after multiple retries')
}
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    const parser = new PDFParse({ data: req.file.buffer })
    const result = await parser.getText()
    res.json({ text: result.text })
  } catch (err) {
    console.error('PDF parse error:', err)
    res.status(500).json({ error: 'Failed to read PDF' })
  }
})
app.post('/api/analyze', async (req, res) => {
  const { resumeText, jdText } = req.body

 const prompt = `You are a resume analysis tool. Compare the following resume against the job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}

Return ONLY a valid JSON object, no markdown, no backticks, no extra text. Use this exact structure:
{
  "atsScore": <number 0-100>,
  "scoreExplanation": "<1-2 sentence explanation of why this score was given, mentioning specific strengths and specific gaps>",
  "matchingSkills": [<list of skills found in both>],
  "missingSkills": [<list of skills in JD but not resume>],
  "weakBullets": [{"original": "<vague bullet>", "suggestion": "<why it's weak>"}]
}`

  try {
    const parsed = await callGeminiWithRetry(prompt)
    res.json(parsed)
  } catch (err) {
    console.error('Analyze error:', err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.post('/api/rewrite', async (req, res) => {
  const { bulletText } = req.body

  const prompt = `You are a resume writing expert. Rewrite the following resume bullet point to be more impactful. Use strong action verbs, add quantifiable metrics where reasonable (even if estimated), and keep it to one line.

Original bullet: "${bulletText}"

Return ONLY a valid JSON object, no markdown, no backticks. Use this structure:
{
  "rewritten": "<the improved bullet point>"
}`

  try {
    const parsed = await callGeminiWithRetry(prompt)
    res.json(parsed)
  } catch (err) {
    console.error('Rewrite error:', err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})
app.post('/api/interview-questions', async (req, res) => {
  const { resumeText, jdText } = req.body

  const prompt = `You are an experienced technical interviewer. Based on the following resume and job description, generate 8 likely interview questions the candidate should prepare for.

Include a mix of:
- Questions about specific projects/experience mentioned in the resume
- Technical questions relevant to the skills required in the job description
- 1-2 behavioral questions relevant to the role

RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}

Return ONLY a valid JSON object, no markdown, no backticks, no extra text. Use this exact structure:
{
  "questions": [
    { "question": "<the interview question>", "type": "<Technical, Project, or Behavioral>" }
  ]
}`

  try {
    const parsed = await callGeminiWithRetry(prompt)
    res.json(parsed)
  } catch (err) {
    console.error('Interview questions error:', err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})
app.post('/api/build-resume', async (req, res) => {
  const { rawInfo } = req.body

  const prompt = `You are a professional resume writer. The user will give you raw, unorganized information about their education, work experience, projects, and skills. Turn this into a clean, well-structured, professional resume in plain text format.

Use this structure, in this order:
- Education
- Projects (2-3 strong bullet points each, using powerful action verbs and quantifiable impact where reasonable)
- Skills

Keep the tone professional and concise, the way a real resume reads. Do not invent facts that are not implied by the raw info, but you may phrase things more professionally.

Raw info from user:
${rawInfo}

Return ONLY a valid JSON object, no markdown, no backticks, no extra text. Use this exact structure:
{
  "resume": "<the full formatted resume as plain text, using \\n for line breaks>"
}`

  try {
    const parsed = await callGeminiWithRetry(prompt)
    res.json(parsed)
  } catch (err) {
    console.error('Build resume error:', err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.listen(5000, () => {
  console.log('Server running on port 5000')
})