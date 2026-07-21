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
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
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

app.post('/api/github/critique', async (req, res) => {
  const { githubData } = req.body

  if (!githubData) {
    return res.status(400).json({ error: 'GitHub data is required.' })
  }

  const prompt = `You are a technical recruiter who has screened thousands of GitHub profiles in 30 seconds each. You know the subtle signals candidates never think about — not just "add a README." Analyze this profile like you actually would on the job.

GITHUB PROFILE:
${JSON.stringify(githubData, null, 2)}

Think about signals beyond documentation:
- Staleness: how long since each repo was touched? A profile where everything went quiet 6 months ago reads differently than one with recent activity.
- Naming and framing: generic names like "test", "project1", "practice" vs specific names that signal real work.
- Depth vs breadth: is there one substantial "hero" project a recruiter would actually click into, or many shallow ones?
- Account age vs output: does the number/quality of repos match how long the account has existed? Too few after a long time, or a burst of new repos with no history, both read differently.
- Language consistency: does the stack tell a coherent story (e.g. "full-stack JS dev") or look scattered/unfocused?
- What a recruiter would click first, and what they'd see if they did.

Give scores (0-100) across these five dimensions, not just one overall number:
- documentation: README/description quality
- activity: recency and consistency of commits/pushes
- substance: depth of actual project work vs empty/trivial repos
- presentation: naming, descriptions, professional framing
- diversity: breadth of skills/tech shown without being scattered

Return ONLY a valid JSON object, no markdown, no backticks, no extra text. All fields marked as string arrays must contain plain strings only — never objects, never nested keys. Use this exact structure:
{
  "healthScore": <number 0-100, overall>,
  "scoreExplanation": "<1-2 sentence explanation mentioning specific strengths and specific gaps>",
  "dimensionScores": {
    "documentation": <0-100>,
    "activity": <0-100>,
    "substance": <0-100>,
    "presentation": <0-100>,
    "diversity": <0-100>
  },
  "recruiterVerdict": "<2-3 sentences, written as if a recruiter skimmed this profile for 20 seconds. Be direct and specific, mention actual repo names.>",
  "nonObviousInsight": "<one specific, surprising observation the candidate almost certainly hasn't thought about — e.g. about staleness patterns, naming, hero-project absence, or activity trends. Not about missing README.>",
  "weakPoints": [
    { "issue": "<specific problem, prioritize non-README issues where they exist>", "repo": "<repo name if applicable, else null>", "why": "<why this hurts them>" }
  ],
  "missing": [<array of plain strings only, e.g. "profile README", "pinned projects", "repo descriptions">],
  "strengths": [<array of plain strings only, each a full sentence referencing a real repo name>],
  "quickWins": [<array of plain strings only, 3-5 items, each one complete actionable sentence ranked by effort vs impact — vary these beyond README fixes>]
}`

  try {
    const parsed = await callGeminiWithRetry(prompt)
    res.json(parsed)
  } catch (err) {
    console.error('GitHub critique error:', err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})
app.post('/api/interview/evaluate-answer', async (req, res) => {
  const { question, userAnswer, resumeText, jdText } = req.body

  if (!question || !userAnswer) {
    return res.status(400).json({ error: 'Question and answer are required.' })
  }

  const prompt = `You are an experienced technical interviewer evaluating a candidate's spoken/typed answer to an interview question. Be honest and specific — do not be artificially encouraging if the answer is weak.

QUESTION:
${question}

CANDIDATE'S ANSWER:
${userAnswer}

${resumeText ? `CANDIDATE'S RESUME (for context, to check if the answer reflects real experience):\n${resumeText}\n` : ''}
${jdText ? `TARGET JOB DESCRIPTION (for context):\n${jdText}\n` : ''}

Evaluate the answer on: relevance to the question, specificity (concrete details vs vague generalities), structure (clear beginning/middle/end, e.g. STAR for behavioral questions), and whether it reflects real experience from the resume where applicable.

Return ONLY a valid JSON object, no markdown, no backticks, no extra text. All fields marked as string arrays must contain plain strings only — never objects. Use this exact structure:
{
  "score": <number 0-10>,
  "verdict": "<1-2 sentence honest assessment, direct and specific>",
  "strengths": [<array of plain strings, specific things done well>],
  "gaps": [<array of plain strings, specific things missing or weak>],
  "improvedAnswer": "<a stronger rewritten version of their actual answer, keeping their real content/experience, not a generic template>"
}`

  try {
    const parsed = await callGeminiWithRetry(prompt)
    res.json(parsed)
  } catch (err) {
    console.error('Answer evaluation error:', err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})
app.post('/api/recruiter-scan', async (req, res) => {
  const { resumeText, jdText } = req.body

  if (!resumeText) {
    return res.status(400).json({ error: 'Resume text is required.' })
  }

 const prompt = `You are a senior technical recruiter, 8+ years screening resumes, fast and blunt. You skim, you don't read. Judgments form in seconds from pattern-matching thousands of resumes.

RESUME:
${resumeText}

${jdText ? `TARGET JD:\n${jdText}\n` : ''}

Simulate your real 18-22 second skim of THIS resume. Ground every line in actual text from it — quote real titles, real numbers, real project names.

Return ONLY valid JSON, no markdown. Every string field must be SHORT — max 15 words per reaction, max 2 sentences for verdict, no hedging, no filler, talk like a fast tired human not an essay:
{
  "firstImpression": "<max 12 words, pure gut reaction>",
  "scanSequence": [
    { "second": <number>, "noticed": "<max 10 words, exact resume content>", "reaction": "<max 15 words, blunt snap judgment>" }
  ],
  "whatGotSkipped": [<plain strings, max 8 words each>],
  "verdict": "<max 2 sentences, blunt, specific>",
  "moveForwardLikelihood": <0-100>
}`
  try {
    const parsed = await callGeminiWithRetry(prompt)
    res.json(parsed)
  } catch (err) {
    console.error('Recruiter scan error:', err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})
app.listen(5000, () => {
  console.log('Server running on port 5000')
})