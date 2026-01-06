import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { portfolioData } from '../data/portfolioData'
import './Panel.scss'

export default function Panel({ section, onClose }) {
  const panelRef = useRef(null)
  
  useEffect(() => {
    if (section && panelRef.current) {
      panelRef.current.focus()
    }
  }, [section])
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && section) {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [section, onClose])
  
  const renderContent = () => {
    if (!section) return null
    
    switch (section.id) {
      case 'beginning':
        return (
          <div className="panel__content">
            <h2 className="panel__title">Beginning</h2>
            <p className="panel__text">Welcome to my portfolio! Use arrow keys left and right, or scroll up and down to move, and Space bar to kill the dragon.</p>
          </div>
        )
      
      case 'intro':
        return (
          <div className="panel__content">
            <h1 className="panel__title">{portfolioData.hero.name}</h1>
            <h2 className="panel__subtitle">{portfolioData.hero.title}</h2>
            <p className="panel__tagline">{portfolioData.hero.tagline}</p>
          </div>
        )
      
      case 'about':
        return (
          <div className="panel__content">
            <h2 className="panel__title">About</h2>
            <p className="panel__text">{portfolioData.about.text}</p>
          </div>
        )
      
      case 'skills':
        return (
          <div className="panel__content">
            <h2 className="panel__title">Skills</h2>
            {portfolioData.skills.categories.map((category, index) => (
              <div key={index} className="panel__skill-category">
                <h3 className="panel__skill-category-name">{category.name}</h3>
                <div className="panel__skill-items">
                  {category.items.map((skill, skillIndex) => (
                    <span key={skillIndex} className="panel__skill-item">{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      
      case 'experience':
        return (
          <div className="panel__content">
            <h2 className="panel__title">Experience</h2>
            {portfolioData.experience.map((exp, index) => (
              <div key={index} className="panel__experience-item">
                <h3 className="panel__experience-role">{exp.role}</h3>
                <p className="panel__experience-company">{exp.company}</p>
                <p className="panel__experience-period">{exp.period}</p>
                <p className="panel__text">{exp.description}</p>
                {exp.achievements && (
                  <ul className="panel__list">
                    {exp.achievements.map((achievement, achIndex) => (
                      <li key={achIndex}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )
      
      case 'projects':
        return (
          <div className="panel__content">
            <h2 className="panel__title">Projects</h2>
            {portfolioData.projects.map((project, index) => (
              <div key={index} className="panel__project-item">
                <h3 className="panel__project-title">{project.title}</h3>
                <p className="panel__text">{project.description}</p>
                <div className="panel__project-tech">
                  {project.tech.map((tech, techIndex) => (
                    <span key={techIndex} className="panel__tech-tag">{tech}</span>
                  ))}
                </div>
                <div className="panel__project-links">
                  {project.links.live && (
                    <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="panel__link">
                      Live Demo
                    </a>
                  )}
                  {project.links.github && (
                    <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="panel__link">
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      
      case 'education':
        return (
          <div className="panel__content">
            <h2 className="panel__title">Education</h2>
            {portfolioData.education.map((edu, index) => (
              <div key={index} className="panel__education-item">
                <h3 className="panel__education-degree">{edu.degree}</h3>
                <p className="panel__education-institution">{edu.institution}</p>
                <p className="panel__education-period">{edu.period}</p>
                <p className="panel__text">{edu.description}</p>
              </div>
            ))}
          </div>
        )
      
      case 'contact':
        return (
          <div className="panel__content">
            <h2 className="panel__title">Contact</h2>
            <p className="panel__text">
              <a href={`mailto:${portfolioData.contact.email}`} className="panel__link">
                {portfolioData.contact.email}
              </a>
            </p>
            <div className="panel__socials">
              {Object.entries(portfolioData.contact.socials).map(([platform, url]) => (
                <a 
                  key={platform}
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="panel__link"
                >
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </a>
              ))}
            </div>
          </div>
        )
      
      default:
        return null
    }
  }
  
  return (
    <AnimatePresence>
      {section && (
        <>
          <motion.div
            className="panel__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            className="panel"
            tabIndex={-1}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <button 
              className="panel__close"
              onClick={onClose}
              aria-label="Close panel"
            >
              ×
            </button>
            {renderContent()}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

