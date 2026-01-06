import { portfolioData } from '../data/portfolioData'
import './ScrollView.scss'

export default function ScrollView({ onDownloadResume }) {
  // Collect all images from portfolio data
  const allImages = [
    ...(portfolioData.superheroImages || []),
    ...(portfolioData.houseImages || []),
    ...(portfolioData.treeImages || []),
    ...(portfolioData.birdImages || []),
    ...(portfolioData.castleImages || []),
    ...(portfolioData.dragonImages || []),
    ...(portfolioData.fireImages || []),
    ...(portfolioData.princessImages || []),
    ...(portfolioData.otherImages || [])
  ]
  
  // Split images into left and right sides
  const leftImages = allImages.filter((_, index) => index % 2 === 0)
  const rightImages = allImages.filter((_, index) => index % 2 === 1)
  
  return (
    <div className="scroll-view">
      <div className="scroll-view__container">
        {/* Left side images */}
        <div className="scroll-view__images scroll-view__images--left">
          {leftImages.map((image, index) => (
            <img
              key={`left-${image.id || index}`}
              src={image.imagePath}
              alt={image.id || `Image ${index + 1}`}
              className="scroll-view__image"
              style={{
                animationDelay: `${index * 0.2}s`,
                animationName: index % 3 === 0 ? 'float' : index % 3 === 1 ? 'sway' : 'bob'
              }}
            />
          ))}
        </div>
        
        {/* Right side images */}
        <div className="scroll-view__images scroll-view__images--right">
          {rightImages.map((image, index) => (
            <img
              key={`right-${image.id || index}`}
              src={image.imagePath}
              alt={image.id || `Image ${index + 1}`}
              className="scroll-view__image"
              style={{
                animationDelay: `${index * 0.2}s`,
                animationName: index % 3 === 0 ? 'float' : index % 3 === 1 ? 'sway' : 'bob'
              }}
            />
          ))}
        </div>
        {/* Beginning */}
        <section className="scroll-view__section">
          <h2 className="scroll-view__section-title">Beginning</h2>
          <p className="scroll-view__text">Welcome to my portfolio! Use arrow keys left and right, or scroll up and down to move, and Space bar to kill the dragon.</p>
        </section>
        
        {/* Intro */}
        <section className="scroll-view__section">
          <h1 className="scroll-view__hero-name">{portfolioData.hero.name}</h1>
          <h2 className="scroll-view__hero-title">{portfolioData.hero.title}</h2>
          <p className="scroll-view__hero-tagline">{portfolioData.hero.tagline}</p>
        </section>
        
        {/* About */}
        <section className="scroll-view__section">
          <h2 className="scroll-view__section-title">About</h2>
          <p className="scroll-view__text">{portfolioData.about.text}</p>
        </section>
        
        {/* Skills */}
        <section className="scroll-view__section">
          <h2 className="scroll-view__section-title">Skills</h2>
          {portfolioData.skills.categories.map((category, index) => (
            <div key={index} className="scroll-view__skill-category">
              <h3 className="scroll-view__skill-category-name">{category.name}</h3>
              <div className="scroll-view__skill-items">
                {category.items.map((skill, skillIndex) => (
                  <span key={skillIndex} className="scroll-view__skill-item">{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </section>
        
        {/* Experience */}
        <section className="scroll-view__section">
          <h2 className="scroll-view__section-title">Experience</h2>
          {portfolioData.experience.map((exp, index) => (
            <div key={index} className="scroll-view__experience-item">
              <h3 className="scroll-view__experience-role">{exp.role}</h3>
              <p className="scroll-view__experience-company">{exp.company}</p>
              <p className="scroll-view__experience-period">{exp.period}</p>
              <p className="scroll-view__text">{exp.description}</p>
              {exp.achievements && (
                <ul className="scroll-view__list">
                  {exp.achievements.map((achievement, achIndex) => (
                    <li key={achIndex}>{achievement}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
        
        {/* Projects */}
        <section className="scroll-view__section">
          <h2 className="scroll-view__section-title">Projects</h2>
          {portfolioData.projects.map((project, index) => (
            <div key={index} className="scroll-view__project-item">
              <h3 className="scroll-view__project-title">{project.title}</h3>
              <p className="scroll-view__text">{project.description}</p>
              <div className="scroll-view__project-tech">
                {project.tech.map((tech, techIndex) => (
                  <span key={techIndex} className="scroll-view__tech-tag">{tech}</span>
                ))}
              </div>
              <div className="scroll-view__project-links">
                {project.links.live && (
                  <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="scroll-view__link">
                    Live Demo
                  </a>
                )}
                {project.links.github && (
                  <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="scroll-view__link">
                    GitHub
                  </a>
                )}
              </div>
            </div>
          ))}
        </section>
        
        {/* Education */}
        <section className="scroll-view__section">
          <h2 className="scroll-view__section-title">Education</h2>
          {portfolioData.education.map((edu, index) => (
            <div key={index} className="scroll-view__education-item">
              <h3 className="scroll-view__education-degree">{edu.degree}</h3>
              <p className="scroll-view__education-institution">{edu.institution}</p>
              <p className="scroll-view__education-period">{edu.period}</p>
              <p className="scroll-view__text">{edu.description}</p>
            </div>
          ))}
        </section>
        
        {/* Contact */}
        <section className="scroll-view__section">
          <h2 className="scroll-view__section-title">Contact</h2>
          <p className="scroll-view__text">
            <a href={`mailto:${portfolioData.contact.email}`} className="scroll-view__link">
              {portfolioData.contact.email}
            </a>
          </p>
          <div className="scroll-view__socials">
            {Object.entries(portfolioData.contact.socials).map(([platform, url]) => (
              <a 
                key={platform}
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="scroll-view__link"
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </a>
            ))}
          </div>
          <button 
            className="scroll-view__download-btn"
            onClick={onDownloadResume}
          >
            Download Resume PDF
          </button>
        </section>
      </div>
    </div>
  )
}

