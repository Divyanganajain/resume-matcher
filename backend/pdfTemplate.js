const React = require('react')
const { Document, Page, Text, View, StyleSheet } = require('@react-pdf/renderer')

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Times-Roman',
    color: '#1a1a1a',
  },
  header: {
    textAlign: 'center',
    marginBottom: 14,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Times-Bold',
    marginBottom: 2,
  },
  title: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    marginBottom: 4,
  },
  contactLine: {
    fontSize: 9,
    color: '#333333',
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
    borderBottom: '1pt solid #333333',
    paddingBottom: 2,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 9.5,
    lineHeight: 1.4,
  },
  entry: {
    marginBottom: 7,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  entryTitle: {
    fontSize: 9.5,
    fontFamily: 'Times-Bold',
  },
  entrySubtitle: {
    fontSize: 9,
    color: '#444444',
    marginBottom: 2,
  },
  dates: {
    fontSize: 9,
    color: '#444444',
  },
  bullet: {
    fontSize: 9.5,
    lineHeight: 1.4,
    marginLeft: 4,
    marginBottom: 1,
  },
  skillsRow: {
    flexDirection: 'row',
  },
  skillsCol: {
    flex: 1,
  },
  skillItem: {
    fontSize: 9.5,
    marginBottom: 2,
  },
  techStack: {
    fontSize: 8.5,
    color: '#555555',
    marginTop: 1,
  },
  strengthTitle: {
    fontSize: 9.5,
    fontFamily: 'Times-Bold',
  },
})

function buildResumeDocument(resumeData) {
  const {
    contactInfo = {}, title, summary,
    experience = [], skills = {}, education = [],
    projects = [], strengths = [], certificates = [],
  } = resumeData

  const contactParts = [contactInfo.email, contactInfo.phone, contactInfo.location, contactInfo.linkedin].filter(Boolean)

  return React.createElement(Document, null,
    React.createElement(Page, { size: 'A4', style: styles.page },

      React.createElement(View, { style: styles.header },
        React.createElement(Text, { style: styles.name }, contactInfo.name || ''),
        title && React.createElement(Text, { style: styles.title }, title),
        contactParts.length > 0 && React.createElement(Text, { style: styles.contactLine }, contactParts.join('   |   '))
      ),

      summary && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Summary'),
        React.createElement(Text, { style: styles.bodyText }, summary)
      ),

      experience.length > 0 && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Experience'),
        ...experience.map((exp, i) =>
          React.createElement(View, { key: i, style: styles.entry },
            React.createElement(View, { style: styles.rowBetween },
              React.createElement(Text, { style: styles.entryTitle }, exp.role || ''),
              React.createElement(Text, { style: styles.dates }, exp.dates || '')
            ),
            React.createElement(Text, { style: styles.entrySubtitle }, [exp.company, exp.location].filter(Boolean).join(' · ')),
            ...(exp.bullets || []).map((b, j) => React.createElement(Text, { key: j, style: styles.bullet }, `•  ${b}`))
          )
        )
      ),

      (skills.column1?.length || skills.column2?.length || skills.column3?.length) && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Skills'),
        React.createElement(View, { style: styles.skillsRow },
          React.createElement(View, { style: styles.skillsCol },
            ...(skills.column1 || []).map((s, i) => React.createElement(Text, { key: i, style: styles.skillItem }, `• ${s}`))
          ),
          React.createElement(View, { style: styles.skillsCol },
            ...(skills.column2 || []).map((s, i) => React.createElement(Text, { key: i, style: styles.skillItem }, `• ${s}`))
          ),
          React.createElement(View, { style: styles.skillsCol },
            ...(skills.column3 || []).map((s, i) => React.createElement(Text, { key: i, style: styles.skillItem }, `• ${s}`))
          )
        )
      ),

      education.length > 0 && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Education'),
        ...education.map((e, i) =>
          React.createElement(View, { key: i, style: styles.entry },
            React.createElement(View, { style: styles.rowBetween },
              React.createElement(Text, { style: styles.entryTitle }, e.degree || ''),
              React.createElement(Text, { style: styles.dates }, e.dates || '')
            ),
            React.createElement(Text, { style: styles.entrySubtitle }, [e.institution, e.location].filter(Boolean).join(' · '))
          )
        )
      ),

      projects.length > 0 && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Projects'),
        ...projects.map((p, i) =>
          React.createElement(View, { key: i, style: styles.entry },
            React.createElement(View, { style: styles.rowBetween },
              React.createElement(Text, { style: styles.entryTitle }, [p.name, p.role].filter(Boolean).join(' — ')),
              React.createElement(Text, { style: styles.dates }, p.dates || '')
            ),
            p.description && React.createElement(Text, { style: styles.entrySubtitle }, p.description),
            p.techStack?.length > 0 && React.createElement(Text, { style: styles.techStack }, p.techStack.join(' · '))
          )
        )
      ),

      strengths.length > 0 && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Strengths'),
        ...strengths.map((s, i) =>
          React.createElement(View, { key: i, style: { marginBottom: 4 } },
            React.createElement(Text, { style: styles.strengthTitle }, s.title),
            React.createElement(Text, { style: styles.bodyText }, s.description)
          )
        )
      ),

      certificates.length > 0 && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Certificates'),
        ...certificates.map((c, i) =>
          React.createElement(View, { key: i, style: { marginBottom: 3 } },
            React.createElement(Text, { style: styles.entryTitle }, c.title),
            React.createElement(Text, { style: styles.entrySubtitle }, c.issuer)
          )
        )
      )
    )
  )
}

module.exports = { buildResumeDocument }