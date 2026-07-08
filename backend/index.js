const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

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
  "matchingSkills": [<list of skills found in both>],
  "missingSkills": [<list of skills in JD but not resume>],
  "weakBullets": [{"original": "<vague bullet>", "suggestion": "<why it's weak>"}]
}`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    const data = await response.json()
    let text = data.candidates[0].content.parts[0].text
    text = text.replace(/```json|```/g, '').trim()

    const parsed = JSON.parse(text)
    res.json(parsed)
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.listen(5000, () => {
  console.log('Server running on port 5000')
})