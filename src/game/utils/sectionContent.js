/**
 * Section content formatting utilities
 */

/**
 * Get formatted content text for a section
 * @param {Object} section - Section object with id property
 * @param {Object} portfolioData - Portfolio data object
 * @returns {string} Formatted section content text
 */
export const getSectionContent = (section, portfolioData) => {
  if (!section) return ''
  
  // Use story-driven texts if available, otherwise fall back to original format
  const sectionTexts = portfolioData.sectionTexts || {}
  
  switch (section.id) {
    case 'beginning':
      return 'Welcome to my portfolio! Use arrow keys left and right, or scroll up and down to move, and Space bar to kill the dragon.'
    
    case 'intro':
      return sectionTexts.intro || `${portfolioData.hero.name}\n${portfolioData.hero.title}\n${portfolioData.hero.tagline}`
    
    case 'about':
      return sectionTexts.about || portfolioData.about.text
    
    case 'skills':
      return sectionTexts.skills || portfolioData.skills.categories.map(cat => 
        `${cat.name}: ${cat.items.join(', ')}`
      ).join('\n\n')
    
    case 'experience':
      return sectionTexts.experience || portfolioData.experience.map(exp => 
        `${exp.role} at ${exp.company}\n${exp.period}\n${exp.description}`
      ).join('\n\n')
    
    case 'projects':
      return sectionTexts.projects || portfolioData.projects.map(proj => 
        `${proj.title}\n${proj.description}\nTech: ${proj.tech.join(', ')}`
      ).join('\n\n')
    
    case 'education':
      return sectionTexts.education || portfolioData.education.map(edu => 
        `${edu.degree} - ${edu.institution}\n${edu.period}`
      ).join('\n\n')
    
    case 'contact':
      return `Email: ${portfolioData.contact.email}\n${Object.entries(portfolioData.contact.socials).map(([platform, url]) => `${platform}: ${url}`).join('\n')}`
    
    default:
      return ''
  }
}

