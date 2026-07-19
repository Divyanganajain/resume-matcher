const express = require('express')
const cors = require('cors')
require('dotenv').config()
const multer = require('multer')
const {PDFParse} = require('pdf-parse')
const { renderToStream } = require('@react-pdf/renderer')
const { buildResumeDocument } = require('./pdfTemplate')

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
  const { rawInfo, jdText, contactInfo } = req.body

  if (!rawInfo || !contactInfo?.name || !contactInfo?.email) {
    return res.status(400).json({ error: 'Missing required fields: name and email are required' })
  }

  const prompt = `You are an expert resume writer. Build a resume from the raw info below.

RAW INFO:
${rawInfo}

${jdText ? `TARGET JOB DESCRIPTION:\n${jdText}\n` : ''}

CONTACT INFO (use exactly as given, do not invent or modify):
Name: ${contactInfo.name}
Email: ${contactInfo.email}
Phone: ${contactInfo.phone || 'Not provided'}
LinkedIn: ${contactInfo.linkedin || 'Not provided'}
Location: ${contactInfo.location || 'Not provided'}

Return ONLY a valid JSON object, no markdown, no backticks, no extra text. Use this exact structure:
{
  "title": "<professional title/target role>",
  "summary": "<2-3 sentence professional summary>",
  "experience": [
    { "role": "<role>", "company": "<company>", "location": "<location or Remote>", "dates": "<dates, use 'Present' if current>", "bullets": ["<bullet>"] }
  ],
  "skills": {
    "column1": ["<skill>"],
    "column2": ["<skill>"],
    "column3": ["<skill>"]
  },
  "education": [
    { "degree": "<degree>", "institution": "<institution>", "location": "<location>", "dates": "<dates>" }
  ],
  "projects": [
    { "name": "<project name>", "role": "<e.g. Lead Developer, or blank if not applicable>", "dates": "<dates, or blank>", "description": "<one line description>", "techStack": ["<tech>"] }
  ],
  "strengths": [
    { "title": "<strength name>", "description": "<one line elaboration>" }
  ],
  "certificates": [
    { "title": "<certificate name>", "issuer": "<issuing organization>" }
  ]
}
IMPORTANT: Every skill listed must also appear in at least one experience or project bullet. If a section has no data (e.g. no experience yet, or no certificates), return an empty array for it — never invent content that isn't implied by the raw info.`

  try {
    const parsed = await callGeminiWithRetry(prompt)
    parsed.contactInfo = contactInfo
    res.json(parsed)
  } catch (err) {
    console.error('Build resume error:', err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})
app.post('/api/generate-pdf', async (req, res) => {
  try {
    const resumeData = req.body

    if (!resumeData?.contactInfo?.name) {
      return res.status(400).json({ error: 'Missing resume data' })
    }

    const doc = buildResumeDocument(resumeData)
    const stream = await renderToStream(doc)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${resumeData.contactInfo.name.replace(/\s+/g, '_')}_Resume.pdf"`)

    stream.pipe(res)
  } catch (err) {
    console.error('PDF generation error:', err)
    res.status(500).json({ error: 'Failed to generate PDF' })
  }
})
const GITHUB_API = 'https://api.github.com'

async function githubFetch(path) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'resume-matcher-github-analyzer',
    },
  })
  if (!response.ok) {
    if (response.status === 404) return null
    if (response.status === 403) throw new Error('GitHub rate limit hit. Try again in a bit.')
    throw new Error(`GitHub API error: ${response.status}`)
  }
  return response.json()
}

app.post('/api/github/analyze', async (req, res) => {
  try {
    const { username } = req.body
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'GitHub username is required.' })
    }

    const cleanUsername = username
      .replace(/^https?:\/\/(www\.)?github\.com\//, '')
      .replace(/\/$/, '')
      .trim()

    const profile = await githubFetch(`/users/${cleanUsername}`)
    if (!profile) {
      return res.status(404).json({ error: 'GitHub user not found.' })
    }

    const repos = await githubFetch(`/users/${cleanUsername}/repos?per_page=100&sort=pushed`)

    const profileReadme = await githubFetch(`/repos/${cleanUsername}/${cleanUsername}/readme`)

    const reposToCheck = (repos || []).filter(r => !r.fork).slice(0, 15)

    const repoDetails = await Promise.all(
      reposToCheck.map(async (r) => {
        const readme = await githubFetch(`/repos/${cleanUsername}/${r.name}/readme`)
        return {
          name: r.name,
          description: r.description,
          language: r.language,
          stars: r.stargazers_count,
          forks: r.forks_count,
          lastPushed: r.pushed_at,
          hasReadme: !!readme,
          readmeLength: readme ? Buffer.from(readme.content, 'base64').length : 0,
          isEmpty: !r.description && !readme,
        }
      })
    )

    res.json({
      profile: {
        username: profile.login,
        name: profile.name,
        bio: profile.bio,
        publicRepos: profile.public_repos,
        followers: profile.followers,
        following: profile.following,
        createdAt: profile.created_at,
        hasProfileReadme: !!profileReadme,
      },
      repos: repoDetails,
      totalReposAnalyzed: repoDetails.length,
      totalPublicRepos: profile.public_repos,
    })
  } catch (err) {
    console.error('GitHub analyzer error:', err.message)
    res.status(500).json({ error: err.message || 'Failed to analyze GitHub profile.' })
  }
})
app.listen(5000, () => {
  console.log('Server running on port 5000')
})