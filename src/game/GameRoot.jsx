import { useEffect, useRef, useState, useCallback } from 'react'
import { Stage, Container, Graphics, Text, Sprite } from '@pixi/react'
import * as PIXI from 'pixi.js'
import { Physics } from './systems/Physics'
import { Camera } from './systems/Camera'
import { SectionZones } from './systems/SectionZones'
import { createPlayer } from './entities/Player'
import { createPlatform } from './entities/Platform'
import { createSign } from './entities/Sign'
import { portfolioData } from '../data/portfolioData'
import { 
  getGroundLevel, 
  getPlayerYOnGround,
  LEVEL_WIDTH,
  KILL_DRAGON_START,
  KILL_DRAGON_END,
  STOP_CHECKPOINT,
  CASTLE_POSITION
} from './constants'
import { calculateBackgroundColor } from './utils/backgroundUtils'
import { getSectionContent } from './utils/sectionContent'

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function GameRoot({ 
  onSectionDetected, 
  keyboardInput,
  scrollInput,
  touchControls,
  viewportWidth,
  viewportHeight,
  onPixiError,
  onProgressUpdate,
  onGameReady,
  onQuestCompleteSpacePress
}) {
  const [player, setPlayer] = useState(null)
  const [platforms, setPlatforms] = useState([])
  const [signs, setSigns] = useState([])
  const [forestTrees, setForestTrees] = useState([])
  const [houses, setHouses] = useState([])
  const [castles, setCastles] = useState([])
  const [princesses, setPrincesses] = useState([])
  const [clouds, setClouds] = useState([])
  const [birds, setBirds] = useState([])
  const [currentSection, setCurrentSection] = useState(null)
  const [pixiReady, setPixiReady] = useState(false)
  const [bgColor, setBgColor] = useState(0x1A1A2E) // Default background color
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [questComplete, setQuestComplete] = useState(false)
  const [fireworks, setFireworks] = useState([])
  const [dragonBreathingFire, setDragonBreathingFire] = useState(false)
  const [showClickCastleMessage, setShowClickCastleMessage] = useState(false)
  const [isDragonKilled, setIsDragonKilled] = useState(false)
  const [superheroTextures, setSuperheroTextures] = useState({}) // Store loaded textures
  const [selectedSuperhero, setSelectedSuperhero] = useState(null) // Selected superhero config
  const [houseTextures, setHouseTextures] = useState({}) // Store loaded house textures
  const [selectedHouse, setSelectedHouse] = useState(null) // Selected house config
  const [treeTextures, setTreeTextures] = useState({}) // Store loaded tree textures
  const [selectedTree, setSelectedTree] = useState(null) // Selected tree config
  const [birdTextures, setBirdTextures] = useState({}) // Store loaded bird textures
  const [imageBirds, setImageBirds] = useState([]) // Image-based birds (separate from programmatic birds)
  const [castleTextures, setCastleTextures] = useState({}) // Store loaded castle textures
  const [selectedCastle, setSelectedCastle] = useState(null) // Selected castle config
  const [dragonTextures, setDragonTextures] = useState({}) // Store loaded dragon textures
  const [selectedDragon, setSelectedDragon] = useState(null) // Selected dragon config
  const [fireTextures, setFireTextures] = useState({}) // Store loaded fire textures
  const [selectedFire, setSelectedFire] = useState(null) // Selected fire config
  const [princessTextures, setPrincessTextures] = useState({}) // Store loaded princess textures
  const [selectedPrincess, setSelectedPrincess] = useState(null) // Selected princess config
  
  // ============================================================================
  // REFS
  // ============================================================================
  const startWallXRef = useRef(null)
  const hasTouchedLeftWallRef = useRef(false)
  const questCompleteTriggeredRef = useRef(false)
  const playerPositionAtCastleRef = useRef(null)
  const fireTimeoutRef = useRef(null)
  const lastPushBackFrameRef = useRef(0)
  const spaceForDragonRef = useRef(false)
  const spacePressedForScrollRef = useRef(false)
  const previousSpacePressedRef = useRef(false)
  const cameraRef = useRef(new Camera())
  const physicsRef = useRef(null)
  const sectionZonesRef = useRef(new SectionZones(portfolioData.sections))
  const animationFrameRef = useRef(null)
  const lastTimeRef = useRef(performance.now())
  const canJumpRef = useRef(true)
  const rightClickPressedRef = useRef(false)
  const jumpPressedRef = useRef(false)
  const stageRef = useRef(null)
  const superheroRotationRef = useRef(0) // Smooth rotation interpolation
  const superheroFacingLeftRef = useRef(false) // Smooth facing direction
  
  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  
  // Wrapper for calculateBackgroundColor to use with useCallback
  const calculateBgColor = useCallback((playerX) => {
    return calculateBackgroundColor(playerX, portfolioData.sections)
  }, [])
  
  // Initialize physics with viewport height
  useEffect(() => {
    if (!physicsRef.current) {
      physicsRef.current = new Physics(viewportHeight)
    }
  }, [viewportHeight])
  
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  // Initialize game entities (only once)
  useEffect(() => {
    // Prevent re-initialization if player already exists
    if (player) return

    try {
      // Use actual viewport height (may be different after reload)
      const actualViewportHeight = window.innerHeight || viewportHeight
      
      // Wait a frame to ensure viewport is fully measured after reload, then create player
      requestAnimationFrame(() => {
        // Recalculate in case viewport changed
        const currentViewportHeight = window.innerHeight || viewportHeight
        const currentGroundLevel = getGroundLevel(currentViewportHeight)
        
        // Create player and position on ground
        const playerObj = createPlayer()
        playerObj.y = Math.round(getPlayerYOnGround(currentViewportHeight, playerObj.height))
        playerObj.velocityY = 0
        playerObj.onGround = true
        
        setPlayer(playerObj)
        
        // Create platforms (use the currentGroundLevel)
        const platformList = []
        const sections = portfolioData.sections
        
        // Ground platform only - full width
        const lastSection = sections[sections.length - 1]
        const firstSection = sections[0] // Introduction section
        // End buffer for space after last section
        const levelEnd = lastSection ? lastSection.x + 400 : LEVEL_WIDTH
        
        // Calculate level bounds for progress (1% to 100% for progress bar, but player can start at -1%)
        // Level starts at introduction section (1% position)
        const levelStartX = firstSection ? firstSection.x : 50 // Introduction section (1% position)
        const levelEndX = levelEnd // End position (100%)
        const levelWidth = levelEndX - levelStartX
        
        // Calculate wall positions
        // Start wall is positioned at -1% (onePercentDistance before 1%)
        const WALL_WIDTH = 50
        const onePercentDistance = levelWidth / 99 // Distance for 1% of progress
        const minusOnePercentX = levelStartX - onePercentDistance // -1% position
        const startWallX = minusOnePercentX - WALL_WIDTH // Wall before -1%
        
        // Store wall positions
        startWallXRef.current = startWallX
        
        // Player starts at -1% position, moved to the right
        playerObj.x = minusOnePercentX + 500
        
        // Extend ground platform to cover the full range including walls and beyond 100%
        // Make sure ground extends to at least 100% (levelEndX) plus some buffer
        const groundEndX = levelEndX + onePercentDistance * 2 // Extend to 100% + buffer
        platformList.push(createPlatform(startWallX, currentGroundLevel, groundEndX - startWallX, 50, 0x4A7C59))
        
        // Section platforms removed - only ground remains
        
        
        
        setPlatforms(platformList)
        
        // Create signs at sections - sign starts at section.x (left edge)
        const signList = sections.map(section => 
          createSign(section.x, currentGroundLevel, section.name.charAt(0))
        )
        setSigns(signList)
        
        // Create forest trees - random trees in each section
        const treeList = []
        sections.forEach((section, index) => {
          // Determine section boundaries
          const sectionStart = section.x
          const sectionEnd = index < sections.length - 1 
            ? sections[index + 1].x 
            : section.x + 400 // Last section gets 400px
          
          // Random number of trees per section (1-3 trees) - reduced
          const numTrees = Math.floor(Math.random() * 3) + 1
          
          for (let i = 0; i < numTrees; i++) {
            // Random X position within section (avoid the checkpoint tree)
            const sectionWidth = sectionEnd - sectionStart
            const minDistance = 80 // Minimum distance from checkpoint tree
            let treeX
            
            if (Math.random() < 0.5) {
              // Place tree before checkpoint
              treeX = sectionStart + Math.random() * (sectionWidth * 0.4)
            } else {
              // Place tree after checkpoint
              treeX = sectionStart + minDistance + (sectionWidth * 0.4) + Math.random() * (sectionWidth * 0.6 - minDistance)
            }
            
            // Ensure tree is within section bounds
            treeX = Math.max(sectionStart + 20, Math.min(sectionEnd - 20, treeX))
            
            // Random tree size variation (0.8 to 1.2 scale)
            const treeScale = 0.8 + Math.random() * 0.4
            
            treeList.push({
              x: treeX,
              y: currentGroundLevel - 80, // Same Y as signs
              scale: treeScale,
              width: 60,
              height: 80
            })
          }
        })
        setForestTrees(treeList)
        
        // Create houses - random houses in each section
        const houseList = []
        const MIN_HOUSE_DISTANCE = 200 // Minimum distance between houses (increased from 120)
        const MAX_HOUSE_POSITION = 0.85 // No houses beyond 85% of level
        const maxHouseX = levelStartX + (levelWidth * MAX_HOUSE_POSITION) // 85% position
        
        sections.forEach((section, index) => {
          // Determine section boundaries
          const sectionStart = section.x
          const sectionEnd = index < sections.length - 1 
            ? sections[index + 1].x 
            : section.x + 400 // Last section gets 400px
          
          // Skip this section if it's beyond 85%
          if (sectionStart >= maxHouseX) {
            return // Skip placing houses in sections beyond 85%
          }
          
          // Random number of houses per section (1-2 houses, reduced from 1-3)
          const numHouses = Math.floor(Math.random() * 2) + 1
          const sectionHouses = []
          
          for (let i = 0; i < numHouses; i++) {
            // Random X position within section
            const sectionWidth = sectionEnd - sectionStart
            const treeBuffer = 100 // Distance from checkpoint tree
            let houseX
            let attempts = 0
            const maxAttempts = 50 // Prevent infinite loops
            
            // Try to find a position that's not too close to other houses
            do {
            if (Math.random() < 0.5) {
              // Place house before checkpoint
              houseX = sectionStart + 30 + Math.random() * (sectionWidth * 0.4 - 30)
            } else {
              // Place house after checkpoint
              houseX = sectionStart + treeBuffer + (sectionWidth * 0.4) + Math.random() * (sectionWidth * 0.6 - treeBuffer)
            }
            
            // Ensure house is within section bounds
            houseX = Math.max(sectionStart + 30, Math.min(sectionEnd - 30, houseX))
            
              // Ensure house doesn't go beyond 85%
              houseX = Math.min(houseX, maxHouseX - 30)
              
              attempts++
            } while (
              attempts < maxAttempts && 
              (sectionHouses.some(existingHouse => Math.abs(existingHouse.x - houseX) < MIN_HOUSE_DISTANCE) ||
               houseList.some(existingHouse => Math.abs(existingHouse.x - houseX) < MIN_HOUSE_DISTANCE))
            )
            
            // Only add house if we found a valid position and it's before 85%
            if (attempts < maxAttempts && houseX < maxHouseX) {
            // Random house size variation
            const houseScale = 0.9 + Math.random() * 0.2
            
            // Randomly select a house image for this house
            const houseImages = portfolioData.houseImages || []
            let houseImageId = null
            if (houseImages.length > 0) {
              const randomHouseImage = houseImages[Math.floor(Math.random() * houseImages.length)]
              houseImageId = randomHouseImage.id
            }
            
              const newHouse = {
              x: houseX,
              y: currentGroundLevel,
              scale: houseScale,
              width: 50,
              height: 60,
              houseImageId: houseImageId // Store which house image to use
              }
              
              sectionHouses.push(newHouse)
              houseList.push(newHouse)
            }
          }
        })
        setHouses(houseList)
        
        // Create big castle near the end of the world
        const castleList = []
        const castleX = levelStartX + (levelWidth * CASTLE_POSITION)
        const castleY = currentGroundLevel
        
        castleList.push({
          x: castleX,
          y: castleY,
          width: 200, // Big castle
          height: 250,
          scale: 1.0
        })
        setCastles(castleList)
        
        // Create princess at the end (after the castle, saved from the dragon)
        const princessList = []
        const princessX = castleX + 250 // Position princess well after the castle (castle width is 200)
        const princessY = castleY
        
        princessList.push({
          x: princessX,
          y: princessY,
          scale: 1.0
        })
        setPrincesses(princessList)
        
        // Create clouds in the sky
        const cloudList = []
        const cloudLevelStart = sections[0]?.x || 50
        const cloudLevelEnd = sections.length > 0 ? sections[sections.length - 1].x + 400 : 3500
        const cloudLevelWidth = cloudLevelEnd - cloudLevelStart
        
        // Generate clouds across the entire level
        const numClouds = Math.floor(cloudLevelWidth / 200) // One cloud every ~200px
        
        for (let i = 0; i < numClouds; i++) {
          // Random X position across the level
          const cloudX = cloudLevelStart + Math.random() * cloudLevelWidth
          
          // Random Y position in the sky (above ground, below top of screen)
          const skyTop = 50 // Top of sky area
          const skyBottom = currentGroundLevel - 150 // Above ground level
          const cloudY = skyTop + Math.random() * (skyBottom - skyTop)
          
          // Random cloud size
          const cloudScale = 0.6 + Math.random() * 0.8 // 0.6x to 1.4x
          
          // Random cloud speed for parallax (slower than ground)
          const cloudSpeed = 0.1 + Math.random() * 0.2 // 0.1 to 0.3
          
          cloudList.push({
            x: cloudX,
            y: cloudY,
            scale: cloudScale,
            speed: cloudSpeed
          })
        }
        setClouds(cloudList)
        
        // Create birds flying around the world (programmatic birds)
        const birdList = []
        const birdLevelStart = sections[0]?.x || 50
        const birdLevelEnd = sections.length > 0 ? sections[sections.length - 1].x + 400 : 3500
        const birdLevelWidth = birdLevelEnd - birdLevelStart
        
        // Create programmatic birds at various heights and positions
        const numBirds = Math.floor(birdLevelWidth / 300) // One bird every 300px
        const skyHeight = currentGroundLevel - 200 // Birds fly in the sky
        
        for (let i = 0; i < numBirds; i++) {
          const birdX = birdLevelStart + (i * 300) + Math.random() * 200
          const birdY = skyHeight - Math.random() * 300 // Vary height in sky
          const birdSize = 0.8 + Math.random() * 0.4 // Vary size
          
          birdList.push({
            x: birdX,
            y: birdY,
            width: 20 * birdSize,
            height: 15 * birdSize,
            scale: birdSize,
            animationOffset: Math.random() * Math.PI * 2, // Random animation phase
            speed: 0.5 + Math.random() * 0.5, // Random flying speed
            isImage: false // Mark as programmatic bird
          })
        }
        setBirds(birdList)
        
        // Create image-based birds (if bird images are configured)
        const birdImages = portfolioData.birdImages || []
        if (birdImages.length > 0) {
          const imageBirdList = []
          const numImageBirds = Math.floor(birdLevelWidth / 400) // One image bird every 400px (fewer than programmatic)
          
          for (let i = 0; i < numImageBirds; i++) {
            const birdX = birdLevelStart + (i * 400) + Math.random() * 200
            const birdY = skyHeight - Math.random() * 300 // Vary height in sky
            
            // Randomly select a bird image
            const randomBirdImage = birdImages[Math.floor(Math.random() * birdImages.length)]
            
            imageBirdList.push({
              x: birdX,
              y: birdY,
              birdImageId: randomBirdImage.id,
              scale: randomBirdImage.scale || 0.2,
              animationOffset: Math.random() * Math.PI * 2, // Random animation phase
              speed: 0.5 + Math.random() * 0.5, // Random flying speed
              isImage: true // Mark as image bird
            })
          }
          setImageBirds(imageBirdList)
        }
        
        setPixiReady(true)
      })
    } catch (error) {
      console.error('Pixi initialization error:', error)
      if (onPixiError) onPixiError()
    }
  }, [viewportHeight, onPixiError, player])
  
  // Notify parent when game is ready
  useEffect(() => {
    if (pixiReady && onGameReady) {
      onGameReady()
    }
  }, [pixiReady, onGameReady])
  
  // Load superhero images
  useEffect(() => {
    const loadSuperheroTextures = async () => {
      const superheroImages = portfolioData.superheroImages || []
      if (superheroImages.length === 0) {
        console.log('No superhero images configured')
        return
      }
      
      console.log('Loading superhero images:', superheroImages.map(img => img.imagePath))
      
      const textures = {}
      const loadPromises = superheroImages.map(async (config) => {
        try {
          // Try using Assets.load first
          let texture = await PIXI.Assets.load(config.imagePath)
          
          // If that doesn't work, try Texture.from as fallback
          if (!texture) {
            console.log(`Trying fallback method for: ${config.imagePath}`)
            texture = PIXI.Texture.from(config.imagePath)
          }
          
          if (texture && texture.valid !== false) {
            textures[config.id] = texture
            console.log(`Successfully loaded: ${config.imagePath}`)
          } else {
            console.warn(`Texture is invalid for: ${config.imagePath}`)
          }
        } catch (error) {
          console.error(`Failed to load superhero image: ${config.imagePath}`, error)
          console.log('Make sure the image file exists at:', config.imagePath)
          console.log('Full path should be:', window.location.origin + config.imagePath)
        }
      })
      
      await Promise.all(loadPromises)
      setSuperheroTextures(textures)
      console.log('Loaded textures:', Object.keys(textures))
      
      // Randomly select a superhero if not already selected
      if (!selectedSuperhero && superheroImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * superheroImages.length)
        const selected = superheroImages[randomIndex]
        setSelectedSuperhero(selected)
        console.log('Selected superhero:', selected.id, 'at path:', selected.imagePath)
      }
    }
    
    if (pixiReady) {
      loadSuperheroTextures()
    }
  }, [pixiReady])
  
  // Load house images
  useEffect(() => {
    const loadHouseTextures = async () => {
      const houseImages = portfolioData.houseImages || []
      if (houseImages.length === 0) {
        console.log('No house images configured')
        return
      }
      
      console.log('Loading house images:', houseImages.map(img => img.imagePath))
      
      const textures = {}
      const loadPromises = houseImages.map(async (config) => {
        try {
          let texture = await PIXI.Assets.load(config.imagePath)
          
          if (!texture) {
            console.log(`Trying fallback method for: ${config.imagePath}`)
            texture = PIXI.Texture.from(config.imagePath)
          }
          
          if (texture && texture.valid !== false) {
            textures[config.id] = texture
            console.log(`Successfully loaded house: ${config.imagePath}`)
          } else {
            console.warn(`House texture is invalid for: ${config.imagePath}`)
          }
        } catch (error) {
          console.error(`Failed to load house image: ${config.imagePath}`, error)
          console.log('Make sure the house image file exists at:', config.imagePath)
        }
      })
      
      await Promise.all(loadPromises)
      setHouseTextures(textures)
      console.log('Loaded house textures:', Object.keys(textures))
      
      // Randomly select a house if available (when user first loads)
      if (!selectedHouse && houseImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * houseImages.length)
        const selected = houseImages[randomIndex]
        setSelectedHouse(selected)
        console.log('Randomly selected house:', selected.id, 'at path:', selected.imagePath)
      }
    }
    
    if (pixiReady) {
      loadHouseTextures()
    }
  }, [pixiReady, selectedHouse])
  
  // Load tree images
  useEffect(() => {
    const loadTreeTextures = async () => {
      const treeImages = portfolioData.treeImages || []
      if (treeImages.length === 0) {
        console.log('No tree images configured')
        return
      }
      
      console.log('Loading tree images:', treeImages.map(img => img.imagePath))
      
      const textures = {}
      const loadPromises = treeImages.map(async (config) => {
        try {
          let texture = await PIXI.Assets.load(config.imagePath)
          
          if (!texture) {
            console.log(`Trying fallback method for: ${config.imagePath}`)
            texture = PIXI.Texture.from(config.imagePath)
          }
          
          if (texture && texture.valid !== false) {
            textures[config.id] = texture
            console.log(`Successfully loaded tree: ${config.imagePath}`)
          } else {
            console.warn(`Tree texture is invalid for: ${config.imagePath}`)
          }
        } catch (error) {
          console.error(`Failed to load tree image: ${config.imagePath}`, error)
          console.log('Make sure the tree image file exists at:', config.imagePath)
        }
      })
      
      await Promise.all(loadPromises)
      setTreeTextures(textures)
      console.log('Loaded tree textures:', Object.keys(textures))
      
      // Randomly select a tree if available (when user first loads)
      if (!selectedTree && treeImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * treeImages.length)
        const selected = treeImages[randomIndex]
        setSelectedTree(selected)
        console.log('Randomly selected tree:', selected.id, 'at path:', selected.imagePath)
      }
    }
    
    if (pixiReady) {
      loadTreeTextures()
    }
  }, [pixiReady, selectedTree])
  
  // Load bird images
  useEffect(() => {
    const loadBirdTextures = async () => {
      const birdImages = portfolioData.birdImages || []
      if (birdImages.length === 0) {
        console.log('No bird images configured')
        return
      }
      
      console.log('Loading bird images:', birdImages.map(img => img.imagePath))
      
      const textures = {}
      const loadPromises = birdImages.map(async (config) => {
        try {
          let texture = await PIXI.Assets.load(config.imagePath)
          
          if (!texture) {
            console.log(`Trying fallback method for: ${config.imagePath}`)
            texture = PIXI.Texture.from(config.imagePath)
          }
          
          if (texture && texture.valid !== false) {
            textures[config.id] = texture
            console.log(`Successfully loaded bird: ${config.imagePath}`)
          } else {
            console.warn(`Bird texture is invalid for: ${config.imagePath}`)
          }
        } catch (error) {
          console.error(`Failed to load bird image: ${config.imagePath}`, error)
          console.log('Make sure the bird image file exists at:', config.imagePath)
        }
      })
      
      await Promise.all(loadPromises)
      setBirdTextures(textures)
      console.log('Loaded bird textures:', Object.keys(textures))
    }
    
    if (pixiReady) {
      loadBirdTextures()
    }
  }, [pixiReady])
  
  // Load castle images
  useEffect(() => {
    const loadCastleTextures = async () => {
      const castleImages = portfolioData.castleImages || []
      if (castleImages.length === 0) {
        console.log('No castle images configured')
        return
      }
      
      console.log('Loading castle images:', castleImages.map(img => img.imagePath))
      
      const textures = {}
      const loadPromises = castleImages.map(async (config) => {
        try {
          let texture = await PIXI.Assets.load(config.imagePath)
          
          if (!texture) {
            console.log(`Trying fallback method for: ${config.imagePath}`)
            texture = PIXI.Texture.from(config.imagePath)
          }
          
          if (texture && texture.valid !== false) {
            textures[config.id] = texture
            console.log(`Successfully loaded castle: ${config.imagePath}`)
          } else {
            console.warn(`Castle texture is invalid for: ${config.imagePath}`)
          }
        } catch (error) {
          console.error(`Failed to load castle image: ${config.imagePath}`, error)
          console.log('Make sure the castle image file exists at:', config.imagePath)
        }
      })
      
      await Promise.all(loadPromises)
      setCastleTextures(textures)
      console.log('Loaded castle textures:', Object.keys(textures))
      
      // Select first castle if available
      if (!selectedCastle && castleImages.length > 0) {
        setSelectedCastle(castleImages[0])
        console.log('Selected castle:', castleImages[0].id, 'at path:', castleImages[0].imagePath)
      }
    }
    
    if (pixiReady) {
      loadCastleTextures()
    }
  }, [pixiReady, selectedCastle])
  
  // Load dragon images
  useEffect(() => {
    const loadDragonTextures = async () => {
      const dragonImages = portfolioData.dragonImages || []
      if (dragonImages.length === 0) {
        console.log('No dragon images configured')
        return
      }
      
      console.log('Loading dragon images:', dragonImages.map(img => img.imagePath))
      
      const textures = {}
      const loadPromises = dragonImages.map(async (config) => {
        try {
          let texture = await PIXI.Assets.load(config.imagePath)
          
          if (!texture) {
            console.log(`Trying fallback method for: ${config.imagePath}`)
            texture = PIXI.Texture.from(config.imagePath)
          }
          
          if (texture && texture.valid !== false) {
            textures[config.id] = texture
            console.log(`Successfully loaded dragon: ${config.imagePath}`)
          } else {
            console.warn(`Dragon texture is invalid for: ${config.imagePath}`)
          }
        } catch (error) {
          console.error(`Failed to load dragon image: ${config.imagePath}`, error)
          console.log('Make sure the dragon image file exists at:', config.imagePath)
        }
      })
      
      await Promise.all(loadPromises)
      setDragonTextures(textures)
      console.log('Loaded dragon textures:', Object.keys(textures))
      
      // Select first dragon if available
      if (!selectedDragon && dragonImages.length > 0) {
        setSelectedDragon(dragonImages[0])
        console.log('Selected dragon:', dragonImages[0].id, 'at path:', dragonImages[0].imagePath)
      }
    }
    
    if (pixiReady) {
      loadDragonTextures()
    }
  }, [pixiReady, selectedDragon])
  
  // Load fire images
  useEffect(() => {
    const loadFireTextures = async () => {
      const fireImages = portfolioData.fireImages || []
      if (fireImages.length === 0) {
        console.log('No fire images configured')
        return
      }
      
      console.log('Loading fire images:', fireImages.map(img => img.imagePath))
      
      const textures = {}
      const loadPromises = fireImages.map(async (config) => {
        try {
          let texture = await PIXI.Assets.load(config.imagePath)
          
          if (!texture) {
            console.log(`Trying fallback method for: ${config.imagePath}`)
            texture = PIXI.Texture.from(config.imagePath)
          }
          
          if (texture && texture.valid !== false) {
            textures[config.id] = texture
            console.log(`Successfully loaded fire: ${config.imagePath}`)
          } else {
            console.warn(`Fire texture is invalid for: ${config.imagePath}`)
          }
        } catch (error) {
          console.error(`Failed to load fire image: ${config.imagePath}`, error)
          console.log('Make sure the fire image file exists at:', config.imagePath)
        }
      })
      
      await Promise.all(loadPromises)
      setFireTextures(textures)
      console.log('Loaded fire textures:', Object.keys(textures))
      
      // Select first fire if available
      if (!selectedFire && fireImages.length > 0) {
        setSelectedFire(fireImages[0])
        console.log('Selected fire:', fireImages[0].id, 'at path:', fireImages[0].imagePath)
      }
    }
    
    if (pixiReady) {
      loadFireTextures()
    }
  }, [pixiReady, selectedFire])
  
  // Load princess images
  useEffect(() => {
    const loadPrincessTextures = async () => {
      const princessImages = portfolioData.princessImages || []
      if (princessImages.length === 0) {
        console.log('No princess images configured')
        return
      }
      
      console.log('Loading princess images:', princessImages.map(img => img.imagePath))
      
      const textures = {}
      const loadPromises = princessImages.map(async (config) => {
        try {
          let texture = await PIXI.Assets.load(config.imagePath)
          
          if (!texture) {
            console.log(`Trying fallback method for: ${config.imagePath}`)
            texture = PIXI.Texture.from(config.imagePath)
          }
          
          if (texture && texture.valid !== false) {
            textures[config.id] = texture
            console.log(`Successfully loaded princess: ${config.imagePath}`)
          } else {
            console.warn(`Princess texture is invalid for: ${config.imagePath}`)
          }
        } catch (error) {
          console.error(`Failed to load princess image: ${config.imagePath}`, error)
          console.log('Make sure the princess image file exists at:', config.imagePath)
        }
      })
      
      await Promise.all(loadPromises)
      setPrincessTextures(textures)
      console.log('Loaded princess textures:', Object.keys(textures))
      
      // Select first princess if available
      if (!selectedPrincess && princessImages.length > 0) {
        setSelectedPrincess(princessImages[0])
        console.log('Selected princess:', princessImages[0].id, 'at path:', princessImages[0].imagePath)
      }
    }
    
    if (pixiReady) {
      loadPrincessTextures()
    }
  }, [pixiReady, selectedPrincess])
  
  // Fix player position after initialization or viewport changes
  useEffect(() => {
    if (!player || !pixiReady) return
    
    const expectedY = getPlayerYOnGround(viewportHeight, player.height)
    
    if (Math.abs(player.y - expectedY) > 1) {
      player.y = expectedY
      player.velocityY = 0
      player.onGround = true
      setPlayer({ ...player })
    }
  }, [player, pixiReady, viewportHeight])
  
  // Mouse click handlers (only for right-click jump)
  useEffect(() => {
    const handleMouseDown = (e) => {
      // Right mouse button (button 2) - jump
      if (e.button === 2) {
        e.preventDefault()
        rightClickPressedRef.current = true
      }
    }
    
    const handleMouseUp = (e) => {
      // Reset right click on mouse up
      if (e.button === 2) {
        e.preventDefault()
        rightClickPressedRef.current = false
      }
    }
    
    // Prevent context menu on right click
    const handleContextMenu = (e) => {
      e.preventDefault()
    }
    
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('contextmenu', handleContextMenu)
    
    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])
  
  // Game loop
  useEffect(() => {
    if (!player || !pixiReady) return
    
    const gameLoop = (currentTime) => {
      const rawDelta = currentTime - lastTimeRef.current
      const deltaTime = Math.min(rawDelta / 16.67, 2) // Normalize to 60fps
      lastTimeRef.current = currentTime
      const currentFrame = Math.floor(currentTime / 16.67) // Frame number
      
      // Skip if delta is too large (tab was inactive)
      if (deltaTime > 2) return
      
      // Calculate kill dragon zone bounds
      const boundsForKillZone = sectionZonesRef.current.getLevelBounds()
      const killDragonStart = boundsForKillZone.start + (boundsForKillZone.end - boundsForKillZone.start) * KILL_DRAGON_START
      const killDragonEnd = boundsForKillZone.start + (boundsForKillZone.end - boundsForKillZone.start) * KILL_DRAGON_END
      const isInKillDragonZone = player.x >= killDragonStart && player.x <= killDragonEnd
      
      // Disable player controls if quest is complete
      if (!questComplete) {
        // Handle input - Scroll is primary control (replaces arrow keys)
        let isMoving = false
        
        if (scrollInput && scrollInput.isScrolling()) {
          // Scroll input takes priority
          const scrollVel = scrollInput.getScrollVelocity()
          if (scrollVel > 0) {
            // Positive velocity - move forward (right)
            physicsRef.current.move(player, 'right')
            isMoving = true
          } else if (scrollVel < 0) {
            // Negative velocity - move backward (left)
            physicsRef.current.move(player, 'left')
            isMoving = true
          }
        } else if (keyboardInput) {
          // Keyboard input (A/D keys still work as alternative)
          if (keyboardInput.isPressed('a') || keyboardInput.isPressed('arrowleft')) {
            physicsRef.current.move(player, 'left')
            isMoving = true
          } else if (keyboardInput.isPressed('d') || keyboardInput.isPressed('arrowright')) {
            physicsRef.current.move(player, 'right')
            isMoving = true
          }
        }
        
        // Stop movement if no input
        if (!isMoving) {
          physicsRef.current.stopHorizontal(player)
        }
        
        // Jump with right mouse click (only once per click)
        if (rightClickPressedRef.current && !jumpPressedRef.current && canJumpRef.current && player.onGround) {
          physicsRef.current.jump(player)
          canJumpRef.current = false
          jumpPressedRef.current = true // Mark as handled
          rightClickPressedRef.current = false // Reset right click after handling
        }
        
        // Reset jump flag when right click is released
        if (!rightClickPressedRef.current) {
          jumpPressedRef.current = false
        }
        
        // Check if player pressed space to defeat the dragon (BEFORE jump check)
        // Can kill dragon between KILL_DRAGON_START and KILL_DRAGON_END when message is showing
        // Note: isInKillDragonZone is already calculated at the start of gameLoop
        if (keyboardInput && keyboardInput.isPressed(' ') && !isDragonKilled && showClickCastleMessage && isInKillDragonZone) {
          // Player pressed space to defeat the dragon
          setIsDragonKilled(true)
          setShowClickCastleMessage(false)
          setDragonBreathingFire(false)
          playerPositionAtCastleRef.current = null // Clear position to allow pass-through
          spaceForDragonRef.current = true // Mark that space was used for dragon
          if (fireTimeoutRef.current) {
            clearTimeout(fireTimeoutRef.current)
            fireTimeoutRef.current = null
          }
        }
        
        // Reset space for dragon flag when space is released
        if (keyboardInput && !keyboardInput.isPressed(' ')) {
          spaceForDragonRef.current = false
        }
        
        // Spacebar jump (keyboard alternative - only if not defeating dragon)
        // Only jump if space wasn't used to defeat dragon and message is not showing
        if (keyboardInput && keyboardInput.isPressed(' ') && !jumpPressedRef.current && canJumpRef.current && player.onGround && !spaceForDragonRef.current && !showClickCastleMessage) {
          physicsRef.current.jump(player)
          canJumpRef.current = false
          jumpPressedRef.current = true
        }
        if (keyboardInput && !keyboardInput.isPressed(' ')) {
          jumpPressedRef.current = false
          canJumpRef.current = true
        }
        
        
        // Click to open functionality removed - information shows automatically
        
        // Touch controls
        if (touchControls) {
          if (touchControls.left) {
            physicsRef.current.move(player, 'left')
          } else if (touchControls.right) {
            physicsRef.current.move(player, 'right')
          } else {
            physicsRef.current.stopHorizontal(player)
          }
          
          if (touchControls.jump && canJumpRef.current && player.onGround) {
            physicsRef.current.jump(player)
            canJumpRef.current = false
          }
          if (!touchControls.jump) {
            canJumpRef.current = true
          }
          
          // Touch interact uses the same logic as mouse click
          // Touch interact removed - information shows automatically
        }
      } else {
        // Quest complete - stop all player movement
        physicsRef.current.stopHorizontal(player)
        player.velocityX = 0
        player.velocityY = 0
        
        // Check for space key press to switch to scroll view (only on keydown, not while held)
        const isSpacePressed = keyboardInput && keyboardInput.isPressed(' ')
        if (isSpacePressed && !previousSpacePressedRef.current && onQuestCompleteSpacePress) {
          // Space was just pressed (transition from not pressed to pressed)
          onQuestCompleteSpacePress()
        }
        previousSpacePressedRef.current = isSpacePressed
      }
      
      // Update physics
      physicsRef.current.update(player, platforms, deltaTime)
      
      // Check if player touches the left wall - switch superhero
      if (startWallXRef.current !== null) {
        const leftWallX = startWallXRef.current
        const WALL_WIDTH = 50
        
        // Check if player is touching the left wall
        if (player.x <= leftWallX + WALL_WIDTH && player.x >= leftWallX - 50 && !hasTouchedLeftWallRef.current) {
          hasTouchedLeftWallRef.current = true
          
          // Cycle through available superhero images
          const superheroImages = portfolioData.superheroImages || []
          if (superheroImages.length > 0) {
            // Find current superhero index
            let currentIndex = 0
            if (selectedSuperhero) {
              currentIndex = superheroImages.findIndex(img => img.id === selectedSuperhero.id)
              if (currentIndex === -1) currentIndex = 0
            }
            
            // Move to next superhero (cycle back to first if at end)
            const nextIndex = (currentIndex + 1) % superheroImages.length
            const nextSuperhero = superheroImages[nextIndex]
            
            // Only switch if the texture is loaded
            if (superheroTextures[nextSuperhero.id]) {
              setSelectedSuperhero(nextSuperhero)
              console.log(`Switched to superhero: ${nextSuperhero.id}`)
          } else {
              console.log(`Superhero ${nextSuperhero.id} texture not loaded yet`)
            }
          }
        }
        
        // Reset touch flag when player moves away from left wall
        if (hasTouchedLeftWallRef.current && player.x > leftWallX + WALL_WIDTH + 50) {
          hasTouchedLeftWallRef.current = false
        }
      }
      
      // Ensure player is on ground after physics update
      const GROUND_LEVEL = getGroundLevel(viewportHeight)
      const expectedY = getPlayerYOnGround(viewportHeight, player.height)
      
      // Fix player position if on ground or should be on ground
      if ((player.onGround || player.velocityY >= 0) && player.y + player.height >= GROUND_LEVEL - 1) {
        if (Math.abs(player.y - expectedY) > 0.5) {
          player.y = expectedY
          player.velocityY = 0
          player.onGround = true
        }
      }
      
      // Check if player reached castle and stop checkpoint
      const bounds = sectionZonesRef.current.getLevelBounds()
      const castlePosition = bounds.start + (bounds.end - bounds.start) * CASTLE_POSITION
      const stopCheckpoint = bounds.start + (bounds.end - bounds.start) * STOP_CHECKPOINT
      const castleTolerance = 50 // Distance tolerance for being "at" the castle
      
      // Check if player is at the stop checkpoint (95%) - this is where blocking happens
      const isAtStopCheckpoint = Math.abs(player.x - stopCheckpoint) <= castleTolerance
      
      // SIMPLIFIED LOGIC: Only ONE block - playerPositionAtCastleRef
      // If dragon is killed, ALWAYS clear the block (no matter where player is)
      if (isDragonKilled) {
        playerPositionAtCastleRef.current = null // Clear the ONLY block
        setDragonBreathingFire(false) // Stop fire
        setShowClickCastleMessage(false) // Hide message - player can move freely
        if (fireTimeoutRef.current) {
          clearTimeout(fireTimeoutRef.current)
          fireTimeoutRef.current = null
        }
      } else if (isInKillDragonZone) {
        // Player is in kill dragon zone - show message to kill dragon (only if dragon not killed)
        setShowClickCastleMessage(true)
      } else if (isAtStopCheckpoint) {
        // Dragon NOT killed - set up the block at 95% stop checkpoint
        // Store player position when they first reach the stop checkpoint (this is the ONLY block)
        if (playerPositionAtCastleRef.current === null) {
          playerPositionAtCastleRef.current = player.x
        }
        
        // If block exists, prevent player from going past it
        if (playerPositionAtCastleRef.current !== null && player.x > playerPositionAtCastleRef.current) {
          // Push player back to the blocked position
          player.x = playerPositionAtCastleRef.current
          player.velocityX = 0
          // Trigger dragon fire breath when player is pushed back
          if (!dragonBreathingFire) {
            setDragonBreathingFire(true)
          }
          // Show message to press space
          setShowClickCastleMessage(true)
          // Clear any existing timeout
          if (fireTimeoutRef.current) {
            clearTimeout(fireTimeoutRef.current)
          }
          // Fire disappears quickly after push back
          fireTimeoutRef.current = setTimeout(() => {
            setDragonBreathingFire(false)
            fireTimeoutRef.current = null
          }, 300) // Fire lasts 0.3 seconds
        } else {
          // Player is at or before the blocked position - no fire
          if (fireTimeoutRef.current) {
            clearTimeout(fireTimeoutRef.current)
            fireTimeoutRef.current = null
          }
          if (dragonBreathingFire) {
            setDragonBreathingFire(false)
          }
        }
      } else {
        // Player has moved away from kill zone and stop checkpoint - stop fire and hide message
        if (fireTimeoutRef.current) {
          clearTimeout(fireTimeoutRef.current)
          fireTimeoutRef.current = null
        }
        setDragonBreathingFire(false)
        setShowClickCastleMessage(false)
        // Only reset block if player moves far away from stop checkpoint (not just slightly)
        if (Math.abs(player.x - stopCheckpoint) > castleTolerance * 2) {
          playerPositionAtCastleRef.current = null
        }
      }
      
      // Boundary checks - prevent player from going below -1% or above 100%
      // Only clamp when player is actually past the boundary AND trying to move further in that direction
      // Allow free movement when at or above the start boundary (-1%)
      if (player.x < bounds.start) {
        // Player is below -1% boundary
        if (player.velocityX < 0) {
          // Trying to move left (backward) - stop and clamp
          player.x = bounds.start
          player.velocityX = 0
        }
        // If moving right (forward), allow movement - don't clamp position
        // This lets player move forward from the start position
      }
      if (player.x > bounds.end) {
        // Player is above 100% boundary
        if (player.velocityX > 0) {
          // Trying to move right (forward) - stop and clamp at 100%
          player.x = bounds.end
          player.velocityX = 0
        }
        // If moving left (backward), allow movement - don't clamp position
      }
      
      // Check if player reached 100% - trigger quest completion
      if (player.x >= bounds.end && !questCompleteTriggeredRef.current) {
        questCompleteTriggeredRef.current = true
        setQuestComplete(true)
        
        // Create fireworks
        const newFireworks = []
        const fireworkCount = 15 // Number of firework bursts
        for (let i = 0; i < fireworkCount; i++) {
          // Random position across the screen
          const x = Math.random() * viewportWidth
          const y = Math.random() * viewportHeight * 0.6 // Upper 60% of screen
          const delay = Math.random() * 2000 // Stagger fireworks over 2 seconds
          
          // Create particles for this firework
          const particleCount = 30
          const colors = [
            [0xFF, 0x00, 0x00], // Red
            [0x00, 0xFF, 0x00], // Green
            [0x00, 0x00, 0xFF], // Blue
            [0xFF, 0xFF, 0x00], // Yellow
            [0xFF, 0x00, 0xFF], // Magenta
            [0x00, 0xFF, 0xFF], // Cyan
            [0xFF, 0xA5, 0x00], // Orange
          ]
          const color = colors[Math.floor(Math.random() * colors.length)]
          
          for (let j = 0; j < particleCount; j++) {
            const angle = (Math.PI * 2 * j) / particleCount
            const speed = 2 + Math.random() * 3
            newFireworks.push({
              x,
              y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1.0,
              decay: 0.01 + Math.random() * 0.02,
              color,
              size: 3 + Math.random() * 4,
              delay,
              startTime: null
            })
          }
        }
        setFireworks(newFireworks)
      }
      
      // Update fireworks particles
      if (fireworks.length > 0) {
        const currentTime = performance.now()
        const updatedFireworks = fireworks.map(firework => {
          if (firework.startTime === null) {
            firework.startTime = currentTime + firework.delay
          }
          
          if (currentTime < firework.startTime) {
            return firework // Not started yet
          }
          
          const elapsed = (currentTime - firework.startTime) / 1000 // Convert to seconds
          if (firework.life <= 0) {
            return null // Particle is dead
          }
          
          // Update position
          const newX = firework.x + firework.vx * elapsed * 60
          const newY = firework.y + firework.vy * elapsed * 60 + 0.5 * 9.8 * elapsed * elapsed * 60 // Gravity
          
          // Update life
          const newLife = firework.life - firework.decay * elapsed * 60
          
          return {
            ...firework,
            x: newX,
            y: newY,
            life: newLife
          }
        }).filter(f => f !== null && f.life > 0)
        
        setFireworks(updatedFireworks)
      }
      
      // Update camera
      cameraRef.current.update(player.x, player.y, viewportWidth, viewportHeight)
      
      // Check sections - update current section based on player position
      const section = sectionZonesRef.current.checkSection(player.x)
      if (section && section.id !== currentSection?.id) {
        setCurrentSection(section)
        onSectionDetected?.(section)
      } else if (!section && currentSection) {
        // If no section detected, determine which section to show based on position
        const bounds = sectionZonesRef.current.getLevelBounds()
        const targetSection = player.x < bounds.levelStartX 
          ? portfolioData.sections[0] 
          : portfolioData.sections[portfolioData.sections.length - 1]
        
        if (targetSection && targetSection.id !== currentSection?.id) {
          setCurrentSection(targetSection)
          onSectionDetected?.(targetSection)
        }
      }
      
      // Smoothly interpolate background color based on player position
      const newBgColor = calculateBgColor(player.x)
      if (newBgColor !== bgColor) {
        setBgColor(newBgColor)
      }
      
      // Update progress based on player position
      if (onProgressUpdate) {
        const bounds = sectionZonesRef.current.getLevelBounds()
        // Use levelStartX (1% position) for progress calculation, not start (-1% position)
        const progress = sectionZonesRef.current.getProgress(player.x, bounds.levelStartX || bounds.start, bounds.end)
        onProgressUpdate(progress)
      }
      
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
    
    animationFrameRef.current = requestAnimationFrame(gameLoop)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [player, platforms, keyboardInput, touchControls, currentSection, viewportWidth, viewportHeight, pixiReady, onSectionDetected, scrollInput, calculateBgColor, bgColor, onProgressUpdate, fireworks, selectedSuperhero, superheroTextures])
  
  // ============================================================================
  // RENDERING FUNCTIONS
  // ============================================================================
  const drawPlatform = useCallback((g, platform) => {
    if (!platform) return
    // Skip rendering if platform is marked as invisible (like the end wall replaced by sword/dragon)
    if (platform.visible === false) return
    
    // Don't render the ground platform (green floor) - make it invisible
    // Platform still exists for physics/collision, just not visible
    return
  }, [])
  
  const drawSign = useCallback((g, sign) => {
    if (!sign) return
    g.clear()
    const screenX = sign.x - (cameraRef.current?.x || 0)
    const screenY = sign.y - (cameraRef.current?.y || 0)
    
    // Draw tree trunk (paper cutout)
    const trunkWidth = 12
    const trunkHeight = 30
    const trunkX = screenX + (sign.width / 2) - (trunkWidth / 2)
    const trunkY = screenY + sign.height - trunkHeight
    
    // Trunk shadow
    g.beginFill(0x000000, 0.25)
    g.drawRect(trunkX + 2, trunkY + 2, trunkWidth, trunkHeight)
    g.endFill()
    
    // Trunk (paper-like brown)
    g.beginFill(0xA67C52) // Warmer, softer brown
    g.drawRect(trunkX, trunkY, trunkWidth, trunkHeight)
    g.endFill()
    
    // Trunk outline
    g.lineStyle(1.5, 0x8B5A3A, 0.8)
    g.drawRect(trunkX, trunkY, trunkWidth, trunkHeight)
    g.lineStyle(0)
    
    // Draw tree leaves/crown (paper layers)
    const crownSize = 40
    const crownX = screenX + (sign.width / 2)
    const crownY = screenY + sign.height - trunkHeight - 10
    
    // Crown shadow
    g.beginFill(0x000000, 0.2)
    g.drawCircle(crownX + 2, crownY + 2, crownSize / 2)
    g.endFill()
    
    // Main crown (paper green)
    g.beginFill(0x5A9A5A) // Softer, warmer green
    g.drawCircle(crownX, crownY, crownSize / 2)
    g.endFill()
    
    // Crown outline
    g.lineStyle(2, 0x4A7A4A, 0.9)
    g.drawCircle(crownX, crownY, crownSize / 2)
    g.lineStyle(0)
    
    // Paper texture layers (lighter green circles)
    g.beginFill(0x7ABA7A, 0.6) // Softer lighter green
    g.drawCircle(crownX - 8, crownY - 5, 8)
    g.drawCircle(crownX + 8, crownY - 5, 8)
    g.drawCircle(crownX, crownY + 5, 8)
    g.endFill()
  }, [])
  
  // Draw bird (paper cutout style)
  const drawBird = useCallback((g, bird, time) => {
    if (!bird) return
    g.clear()
    const cameraX = cameraRef.current?.x || 0
    const cameraY = cameraRef.current?.y || 0
    
    // Birds have parallax movement (fly slower than camera for depth effect)
    const parallaxOffset = cameraX * 0.3 // Birds move slower than camera
    const screenX = bird.x - parallaxOffset
    const screenY = bird.y - cameraY
    
    // Animate bird with bobbing motion
    const bobAmount = Math.sin(time * bird.speed + bird.animationOffset) * 5
    const animatedY = screenY + bobAmount
    
    // Only draw if visible on screen
    if (screenX + bird.width < -50 || screenX > viewportWidth + 50) return
    if (animatedY + bird.height < -50 || animatedY > viewportHeight + 50) return
    
    const scale = bird.scale || 1
    const birdWidth = bird.width * scale
    const birdHeight = bird.height * scale
    
    // Bird shadow
    g.beginFill(0x000000, 0.2)
    g.drawEllipse(screenX + 2, animatedY + 2, birdWidth / 2, birdHeight / 2)
    g.endFill()
    
    // Bird body (paper cutout - simple teardrop shape)
    g.beginFill(0x8B6A4A) // Brown bird
    g.drawEllipse(screenX, animatedY, birdWidth / 2, birdHeight / 2)
    g.endFill()
    
    // Bird wing (animated - flapping)
    const wingFlap = Math.sin(time * bird.speed * 3 + bird.animationOffset) * 0.3
    g.beginFill(0x6B4A2A, 0.8) // Slightly darker for wing
    g.drawEllipse(screenX - birdWidth * 0.2, animatedY - birdHeight * 0.1, birdWidth * 0.3, birdHeight * 0.4 + wingFlap * birdHeight)
    g.endFill()
    
    // Bird beak (small triangle)
    g.beginFill(0xFF8C00) // Orange beak
    g.drawPolygon([
      screenX + birdWidth / 2, animatedY,
      screenX + birdWidth / 2 + 3, animatedY - 2,
      screenX + birdWidth / 2 + 3, animatedY + 2
    ])
    g.endFill()
    
    // Bird eye
    g.beginFill(0x000000)
    g.drawCircle(screenX + birdWidth * 0.2, animatedY - birdHeight * 0.1, 2)
    g.endFill()
    
    // Paper outline
    g.lineStyle(1.5, 0x6B4A2A, 0.8)
    g.drawEllipse(screenX, animatedY, birdWidth / 2, birdHeight / 2)
    g.lineStyle(0)
  }, [viewportWidth, viewportHeight])
  
  // Draw cloud (paper cutout style)
  const drawCloud = useCallback((g, cloud) => {
    if (!cloud) return
    g.clear()
    const scale = cloud.scale || 1
    
    // Calculate screen position with parallax effect
    const parallaxOffset = (cameraRef.current?.x || 0) * cloud.speed
    const screenX = cloud.x - parallaxOffset
    const screenY = cloud.y - (cameraRef.current?.y || 0)
    
    // Only draw if cloud is visible on screen
    if (screenX < -100 || screenX > viewportWidth + 100) return
    
    // Paper cloud shadow
    g.beginFill(0x000000, 0.15)
    const size1 = 20 * scale
    const size2 = 25 * scale
    const size3 = 18 * scale
    g.drawCircle(screenX + 2, screenY + 2, size1)
    g.drawCircle(screenX + 15 * scale + 2, screenY + 2, size2)
    g.drawCircle(screenX + 30 * scale + 2, screenY + 2, size3)
    g.drawCircle(screenX + 10 * scale + 2, screenY - 10 * scale + 2, size1)
    g.drawCircle(screenX + 25 * scale + 2, screenY - 8 * scale + 2, size2)
    g.endFill()
    
    // Draw cloud using multiple circles (paper white)
    g.beginFill(0xF5F5F0, 0.95) // Paper-like off-white
    
    // Main cloud body (3 overlapping circles)
    g.drawCircle(screenX, screenY, size1)
    g.drawCircle(screenX + 15 * scale, screenY, size2)
    g.drawCircle(screenX + 30 * scale, screenY, size3)
    g.drawCircle(screenX + 10 * scale, screenY - 10 * scale, size1)
    g.drawCircle(screenX + 25 * scale, screenY - 8 * scale, size2)
    
    g.endFill()
    
    // Paper outline
    g.lineStyle(1.5, 0xE0E0D0, 0.6)
    g.drawCircle(screenX, screenY, size1)
    g.drawCircle(screenX + 15 * scale, screenY, size2)
    g.drawCircle(screenX + 30 * scale, screenY, size3)
    g.lineStyle(0)
  }, [viewportWidth])
  
  // Draw house (paper cutout style)
  const drawHouse = useCallback((g, house) => {
    if (!house) return
    g.clear()
    const screenX = house.x - (cameraRef.current?.x || 0)
    const screenY = house.y - (cameraRef.current?.y || 0)
    const scale = house.scale || 1
    
    const houseWidth = house.width * scale
    const houseHeight = house.height * scale
    const baseY = screenY - houseHeight
    
    // Paper shadow
    g.beginFill(0x000000, 0.25)
    g.drawRect(screenX + 3, baseY + 3, houseWidth, houseHeight)
    g.drawPolygon([
      screenX - 5 * scale + 3, baseY + 3,
      screenX + houseWidth / 2, baseY - 20 * scale + 3,
      screenX + houseWidth + 5 * scale + 3, baseY + 3
    ])
    g.endFill()
    
    // Draw house base (paper-like warm brown)
    g.beginFill(0xE8A87C) // Warmer, softer brown
    g.drawRect(screenX, baseY, houseWidth, houseHeight)
    g.endFill()
    
    // House outline
    g.lineStyle(2, 0xC8966A, 0.9)
    g.drawRect(screenX, baseY, houseWidth, houseHeight)
    g.lineStyle(0)
    
    // Draw roof (paper layer)
    g.beginFill(0xB8865A) // Softer dark brown
    g.drawPolygon([
      screenX - 5 * scale, baseY,
      screenX + houseWidth / 2, baseY - 20 * scale,
      screenX + houseWidth + 5 * scale, baseY
    ])
    g.endFill()
    
    // Roof outline
    g.lineStyle(2, 0x9A6A4A, 0.9)
    g.moveTo(screenX - 5 * scale, baseY)
    g.lineTo(screenX + houseWidth / 2, baseY - 20 * scale)
    g.lineTo(screenX + houseWidth + 5 * scale, baseY)
    g.lineStyle(0)
    
    // Draw door (paper detail)
    const doorWidth = 12 * scale
    const doorHeight = 20 * scale
    const doorX = screenX + (houseWidth / 2) - (doorWidth / 2)
    const doorY = baseY + houseHeight - doorHeight
    
    g.beginFill(0x8B6A4A) // Softer door color
    g.drawRect(doorX, doorY, doorWidth, doorHeight)
    g.endFill()
    
    // Door outline
    g.lineStyle(1.5, 0x6B4A2A, 0.8)
    g.drawRect(doorX, doorY, doorWidth, doorHeight)
    g.lineStyle(0)
    
    // Draw window (paper detail)
    const windowSize = 10 * scale
    const windowX = screenX + (houseWidth / 4)
    const windowY = baseY + houseHeight * 0.3
    
    g.beginFill(0xB8D4E8) // Softer paper-like blue
    g.drawRect(windowX, windowY, windowSize, windowSize)
    g.endFill()
    
    // Window outline and cross
    g.lineStyle(1.5, 0x6B8A9A, 0.9)
    g.drawRect(windowX, windowY, windowSize, windowSize)
    g.moveTo(windowX + windowSize / 2, windowY)
    g.lineTo(windowX + windowSize / 2, windowY + windowSize)
    g.moveTo(windowX, windowY + windowSize / 2)
    g.lineTo(windowX + windowSize, windowY + windowSize / 2)
    g.lineStyle(0)
  }, [])
  
  // Draw castle (paper cutout style - big and impressive)
  const drawCastle = useCallback((g, castle) => {
    if (!castle) return
    g.clear()
    const screenX = castle.x - (cameraRef.current?.x || 0)
    const screenY = castle.y - (cameraRef.current?.y || 0)
    const scale = castle.scale || 1
    
    const castleWidth = castle.width * scale
    const castleHeight = castle.height * scale
    const baseY = screenY - castleHeight
    
    // Paper shadow
    g.beginFill(0x000000, 0.3)
    g.drawRect(screenX + 4, baseY + 4, castleWidth, castleHeight)
    // Shadow for towers
    g.drawRect(screenX - 20 * scale + 4, baseY - 40 * scale + 4, 40 * scale, 60 * scale)
    g.drawRect(screenX + castleWidth - 20 * scale + 4, baseY - 40 * scale + 4, 40 * scale, 60 * scale)
    g.drawRect(screenX + castleWidth / 2 - 30 * scale + 4, baseY - 60 * scale + 4, 60 * scale, 80 * scale)
    g.endFill()
    
    // Main castle body (paper-like stone gray)
    g.beginFill(0xB8B8A8) // Stone gray
    g.drawRect(screenX, baseY, castleWidth, castleHeight)
    g.endFill()
    
    // Castle outline
    g.lineStyle(3, 0x9A9A8A, 0.9)
    g.drawRect(screenX, baseY, castleWidth, castleHeight)
    g.lineStyle(0)
    
    // Left tower
    g.beginFill(0xB8B8A8)
    g.drawRect(screenX - 20 * scale, baseY - 40 * scale, 40 * scale, 60 * scale)
    g.endFill()
    g.lineStyle(3, 0x9A9A8A, 0.9)
    g.drawRect(screenX - 20 * scale, baseY - 40 * scale, 40 * scale, 60 * scale)
    g.lineStyle(0)
    
    // Right tower
    g.beginFill(0xB8B8A8)
    g.drawRect(screenX + castleWidth - 20 * scale, baseY - 40 * scale, 40 * scale, 60 * scale)
    g.endFill()
    g.lineStyle(3, 0x9A9A8A, 0.9)
    g.drawRect(screenX + castleWidth - 20 * scale, baseY - 40 * scale, 40 * scale, 60 * scale)
    g.lineStyle(0)
    
    // Center tower (tallest)
    g.beginFill(0xB8B8A8)
    g.drawRect(screenX + castleWidth / 2 - 30 * scale, baseY - 60 * scale, 60 * scale, 80 * scale)
    g.endFill()
    g.lineStyle(3, 0x9A9A8A, 0.9)
    g.drawRect(screenX + castleWidth / 2 - 30 * scale, baseY - 60 * scale, 60 * scale, 80 * scale)
    g.lineStyle(0)
    
    // Tower tops (battlements) - left tower
    g.beginFill(0x9A9A8A)
    for (let i = 0; i < 4; i++) {
      const battlementX = screenX - 20 * scale + (i * 10 * scale)
      g.drawRect(battlementX, baseY - 40 * scale, 8 * scale, 8 * scale)
    }
    g.endFill()
    
    // Tower tops - right tower
    g.beginFill(0x9A9A8A)
    for (let i = 0; i < 4; i++) {
      const battlementX = screenX + castleWidth - 20 * scale + (i * 10 * scale)
      g.drawRect(battlementX, baseY - 40 * scale, 8 * scale, 8 * scale)
    }
    g.endFill()
    
    // Tower top - center tower (bigger)
    g.beginFill(0x9A9A8A)
    for (let i = 0; i < 6; i++) {
      const battlementX = screenX + castleWidth / 2 - 30 * scale + (i * 10 * scale)
      g.drawRect(battlementX, baseY - 60 * scale, 8 * scale, 10 * scale)
    }
    g.endFill()
    
    // Main castle battlements (top edge)
    g.beginFill(0x9A9A8A)
    for (let i = 0; i < 10; i++) {
      const battlementX = screenX + (i * 20 * scale)
      if (battlementX < screenX + castleWidth) {
        g.drawRect(battlementX, baseY, 15 * scale, 10 * scale)
      }
    }
    g.endFill()
    
    // Castle door (big entrance)
    const doorWidth = 40 * scale
    const doorHeight = 60 * scale
    const doorX = screenX + (castleWidth / 2) - (doorWidth / 2)
    const doorY = baseY + castleHeight - doorHeight
    
    g.beginFill(0x6B4A2A) // Dark brown door
    g.drawRect(doorX, doorY, doorWidth, doorHeight)
    g.endFill()
    
    // Door outline
    g.lineStyle(2, 0x4A2A1A, 0.9)
    g.drawRect(doorX, doorY, doorWidth, doorHeight)
    g.lineStyle(0)
    
    // Door details (wood planks)
    g.lineStyle(1.5, 0x4A2A1A, 0.7)
    for (let i = 1; i < 4; i++) {
      g.moveTo(doorX + (doorWidth / 4) * i, doorY)
      g.lineTo(doorX + (doorWidth / 4) * i, doorY + doorHeight)
    }
    g.lineStyle(0)
    
    // Windows on towers
    const windowSize = 8 * scale
    // Left tower window
    g.beginFill(0x4A7A9A) // Paper-like blue
    g.drawRect(screenX - 20 * scale + 16 * scale, baseY - 20 * scale, windowSize, windowSize)
    g.endFill()
    g.lineStyle(1.5, 0x3A6A8A, 0.9)
    g.drawRect(screenX - 20 * scale + 16 * scale, baseY - 20 * scale, windowSize, windowSize)
    g.lineStyle(0)
    
    // Right tower window
    g.beginFill(0x4A7A9A)
    g.drawRect(screenX + castleWidth - 20 * scale + 16 * scale, baseY - 20 * scale, windowSize, windowSize)
    g.endFill()
    g.lineStyle(1.5, 0x3A6A8A, 0.9)
    g.drawRect(screenX + castleWidth - 20 * scale + 16 * scale, baseY - 20 * scale, windowSize, windowSize)
    g.lineStyle(0)
    
    // Center tower windows (two windows)
    g.beginFill(0x4A7A9A)
    g.drawRect(screenX + castleWidth / 2 - 30 * scale + 10 * scale, baseY - 40 * scale, windowSize, windowSize)
    g.drawRect(screenX + castleWidth / 2 - 30 * scale + 42 * scale, baseY - 40 * scale, windowSize, windowSize)
    g.endFill()
    g.lineStyle(1.5, 0x3A6A8A, 0.9)
    g.drawRect(screenX + castleWidth / 2 - 30 * scale + 10 * scale, baseY - 40 * scale, windowSize, windowSize)
    g.drawRect(screenX + castleWidth / 2 - 30 * scale + 42 * scale, baseY - 40 * scale, windowSize, windowSize)
    g.lineStyle(0)
    
    // Paper texture details (lighter layers)
    g.beginFill(0xC8C8B8, 0.4)
    g.drawRect(screenX + 10 * scale, baseY + 20 * scale, castleWidth - 20 * scale, 30 * scale)
    g.endFill()
  }, [])
  
  // Draw dragon on top of castle (paper cutout style)
  const drawDragon = useCallback((g, castle, time) => {
    if (!castle || isDragonKilled) {
      g.clear()
      return
    }
    g.clear()
    const screenX = castle.x - (cameraRef.current?.x || 0)
    const screenY = castle.y - (cameraRef.current?.y || 0)
    const scale = castle.scale || 1
    
    const castleWidth = castle.width * scale
    const castleHeight = castle.height * scale
    const baseY = screenY - castleHeight
    
    // Dragon position - on top of center tower (tallest tower)
    const centerTowerTop = baseY - 60 * scale // Top of center tower
    const dragonX = screenX + castleWidth / 2 // Center of castle
    const dragonY = centerTowerTop - 30 * scale // Above the center tower
    
    // Dragon animation - gentle bobbing
    const dragonBob = Math.sin(time * 1.5) * 3 // Gentle up/down movement
    const finalDragonY = dragonY + dragonBob
    
    // Dragon shadow
    g.beginFill(0x000000, 0.25)
    g.drawEllipse(dragonX + 3, finalDragonY + 3, 50 * scale, 30 * scale)
    g.endFill()
    
    // Dragon body (paper cutout - green dragon)
    const dragonBodyWidth = 50 * scale
    const dragonBodyHeight = 30 * scale
    
    // Dragon body (oval)
    g.beginFill(0x4A9A5A) // Green dragon
    g.drawEllipse(dragonX, finalDragonY, dragonBodyWidth / 2, dragonBodyHeight / 2)
    g.endFill()
    
    // Dragon head
    const headSize = 20 * scale
    g.beginFill(0x4A9A5A)
    g.drawCircle(dragonX, finalDragonY - headSize / 2, headSize / 2)
    g.endFill()
    
    // Dragon wings (animated - flapping)
    const wingFlap = Math.sin(time * 3) * 0.2
    const wingSize = 25 * scale
    
    // Left wing
    g.beginFill(0x3A8A4A, 0.9) // Slightly darker green
    g.drawEllipse(dragonX - dragonBodyWidth * 0.3, finalDragonY - 5 * scale, wingSize, wingSize * (0.6 + wingFlap))
    g.endFill()
    
    // Right wing
    g.beginFill(0x3A8A4A, 0.9)
    g.drawEllipse(dragonX + dragonBodyWidth * 0.3, finalDragonY - 5 * scale, wingSize, wingSize * (0.6 + wingFlap))
    g.endFill()
    
    // Dragon tail (curved)
    g.beginFill(0x4A9A5A)
    g.drawEllipse(dragonX + dragonBodyWidth * 0.4, finalDragonY + dragonBodyHeight * 0.3, 15 * scale, 25 * scale)
    g.endFill()
    
    // Dragon legs/claws (perched on tower)
    g.beginFill(0x3A8A4A)
    // Left leg
    g.drawRect(dragonX - 10 * scale, finalDragonY + dragonBodyHeight * 0.2, 6 * scale, 12 * scale)
    // Right leg
    g.drawRect(dragonX + 4 * scale, finalDragonY + dragonBodyHeight * 0.2, 6 * scale, 12 * scale)
    g.endFill()
    
    // Dragon claws
    g.beginFill(0x2A7A3A)
    // Left claws
    for (let i = 0; i < 3; i++) {
      g.drawPolygon([
        dragonX - 10 * scale + (i * 3 * scale), finalDragonY + dragonBodyHeight * 0.2 + 12 * scale,
        dragonX - 12 * scale + (i * 3 * scale), finalDragonY + dragonBodyHeight * 0.2 + 18 * scale,
        dragonX - 8 * scale + (i * 3 * scale), finalDragonY + dragonBodyHeight * 0.2 + 18 * scale
      ])
    }
    // Right claws
    for (let i = 0; i < 3; i++) {
      g.drawPolygon([
        dragonX + 4 * scale + (i * 3 * scale), finalDragonY + dragonBodyHeight * 0.2 + 12 * scale,
        dragonX + 2 * scale + (i * 3 * scale), finalDragonY + dragonBodyHeight * 0.2 + 18 * scale,
        dragonX + 6 * scale + (i * 3 * scale), finalDragonY + dragonBodyHeight * 0.2 + 18 * scale
      ])
    }
    g.endFill()
    
    // Dragon eyes
    g.beginFill(0xFF0000) // Red eyes
    g.drawCircle(dragonX - 5 * scale, finalDragonY - headSize / 2 - 3 * scale, 3 * scale)
    g.drawCircle(dragonX + 5 * scale, finalDragonY - headSize / 2 - 3 * scale, 3 * scale)
    g.endFill()
    
    // Eye highlights
    g.beginFill(0xFFFFFF)
    g.drawCircle(dragonX - 5 * scale - 1, finalDragonY - headSize / 2 - 3 * scale - 1, 1.5 * scale)
    g.drawCircle(dragonX + 5 * scale - 1, finalDragonY - headSize / 2 - 3 * scale - 1, 1.5 * scale)
    g.endFill()
    
    // Dragon snout/mouth
    g.beginFill(0x3A8A4A)
    g.drawEllipse(dragonX, finalDragonY - headSize / 2 + 5 * scale, 8 * scale, 4 * scale)
    g.endFill()
    
    // Dragon nostrils
    g.beginFill(0x000000)
    g.drawCircle(dragonX - 2 * scale, finalDragonY - headSize / 2 + 4 * scale, 1.5 * scale)
    g.drawCircle(dragonX + 2 * scale, finalDragonY - headSize / 2 + 4 * scale, 1.5 * scale)
    g.endFill()
    
    // Dragon horns/spikes on head
    g.beginFill(0x2A7A3A)
    // Left horn
    g.drawPolygon([
      dragonX - 8 * scale, finalDragonY - headSize / 2 - 5 * scale,
      dragonX - 10 * scale, finalDragonY - headSize / 2 - 12 * scale,
      dragonX - 6 * scale, finalDragonY - headSize / 2 - 10 * scale
    ])
    // Right horn
    g.drawPolygon([
      dragonX + 8 * scale, finalDragonY - headSize / 2 - 5 * scale,
      dragonX + 10 * scale, finalDragonY - headSize / 2 - 12 * scale,
      dragonX + 6 * scale, finalDragonY - headSize / 2 - 10 * scale
    ])
    g.endFill()
    
    // Dragon spikes along back
    g.beginFill(0x2A7A3A)
    for (let i = 0; i < 5; i++) {
      const spikeX = dragonX - dragonBodyWidth * 0.2 + (i * dragonBodyWidth * 0.1)
      const spikeY = finalDragonY - dragonBodyHeight * 0.1
      g.drawPolygon([
        spikeX, spikeY,
        spikeX - 2 * scale, spikeY - 6 * scale,
        spikeX + 2 * scale, spikeY - 6 * scale
      ])
    }
    g.endFill()
    
    // Dragon outline (paper style)
    g.lineStyle(2, 0x3A8A4A, 0.9)
    g.drawEllipse(dragonX, finalDragonY, dragonBodyWidth / 2, dragonBodyHeight / 2)
    g.drawCircle(dragonX, finalDragonY - headSize / 2, headSize / 2)
    g.lineStyle(0)
  }, [isDragonKilled])
  
  // Draw dragon fire breath (paper cutout style)
  const drawDragonFire = useCallback((g, castle, time) => {
    // Only draw if fire is active - clear immediately if not
    if (!castle || !dragonBreathingFire || isDragonKilled) {
      g.clear()
      return
    }
    g.clear()
    const screenX = castle.x - (cameraRef.current?.x || 0)
    const screenY = castle.y - (cameraRef.current?.y || 0)
    const scale = castle.scale || 1
    
    const castleWidth = castle.width * scale
    const castleHeight = castle.height * scale
    const baseY = screenY - castleHeight
    
    // Fire position - coming from dragon's mouth (center tower top) - FIXED at castle position
    const centerTowerTop = baseY - 60 * scale // Top of center tower
    const dragonX = screenX + castleWidth / 2 // Center of castle - FIXED position (doesn't move with player)
    const dragonY = centerTowerTop - 30 * scale // Above the center tower - FIXED position
    
    // Fire starts from dragon's mouth and goes downward toward ground level (not player position)
    const fireStartX = dragonX // Fixed at dragon position on castle
    const fireStartY = dragonY + 10 * scale // Slightly below dragon's head - FIXED
    // Fire ends at ground level (fixed, not relative to player)
    const groundLevel = getGroundLevel(viewportHeight)
    const groundScreenY = groundLevel - (cameraRef.current?.y || 0)
    const fireEndY = groundScreenY // Fire reaches toward ground level (fixed)
    
    // Fire animation - pulsing and flickering
    const firePulse = Math.sin(time * 10) * 0.2 // Fast flickering
    const fireLength = Math.abs(fireEndY - fireStartY) + firePulse * 20 // Fire length varies
    const fireWidth = 50 + firePulse * 15 // Fire width varies (wider at bottom)
    
    // Fire cone shape (wider at bottom) - using multiple ellipses
    const fireCenterY = fireStartY + fireLength / 2
    
    // Outer fire (bright orange/red) - wider at bottom
    g.beginFill(0xFF4500, 0.9) // Orange-red
    g.drawEllipse(fireStartX, fireCenterY, (fireWidth * 0.3) / 2, fireLength / 2) // Narrow at top
    g.drawEllipse(fireStartX, fireCenterY + fireLength * 0.3, fireWidth / 2, fireLength * 0.4) // Wider at bottom
    g.endFill()
    
    // Middle fire (yellow/orange)
    g.beginFill(0xFF8C00, 0.8) // Orange
    g.drawEllipse(fireStartX, fireCenterY, (fireWidth * 0.2) / 2, fireLength * 0.8 / 2)
    g.drawEllipse(fireStartX, fireCenterY + fireLength * 0.3, (fireWidth * 0.7) / 2, fireLength * 0.3)
    g.endFill()
    
    // Inner fire (bright yellow)
    g.beginFill(0xFFD700, 0.9) // Gold/yellow
    g.drawEllipse(fireStartX, fireCenterY, (fireWidth * 0.1) / 2, fireLength * 0.6 / 2)
    g.drawEllipse(fireStartX, fireCenterY + fireLength * 0.3, (fireWidth * 0.4) / 2, fireLength * 0.2)
    g.endFill()
    
    // Fire sparks/particles (flying out from fire)
    const sparkCount = 12
    for (let i = 0; i < sparkCount; i++) {
      const sparkProgress = (i / sparkCount) * 0.8 // Sparks along the fire length
      const sparkY = fireStartY + sparkProgress * fireLength
      const sparkAngle = (Math.PI * 2 * i) / sparkCount + (time * 3) // Rotating sparks
      const sparkDistance = 15 + Math.sin(time * 6 + i) * 8
      const sparkX = fireStartX + Math.cos(sparkAngle) * sparkDistance
      const sparkSize = 2 + Math.sin(time * 10 + i) * 2
      
      g.beginFill(0xFFD700, 0.9) // Yellow sparks
      g.drawCircle(sparkX, sparkY, sparkSize)
      g.endFill()
    }
    
    // Fire outline (paper style)
    g.lineStyle(2, 0xFF4500, 0.7)
    g.drawEllipse(fireStartX, fireCenterY, (fireWidth * 0.3) / 2, fireLength / 2)
    g.drawEllipse(fireStartX, fireCenterY + fireLength * 0.3, fireWidth / 2, fireLength * 0.4)
    g.lineStyle(0)
  }, [dragonBreathingFire, isDragonKilled])
  
  // Draw princess (paper cutout style - saved from the dragon)
  const drawPrincess = useCallback((g, princess, time) => {
    if (!princess) return
    g.clear()
    const screenX = princess.x - (cameraRef.current?.x || 0)
    const screenY = princess.y - (cameraRef.current?.y || 0)
    const scale = princess.scale || 1
    
    const currentGroundLevel = getGroundLevel(window.innerHeight)
    const groundY = currentGroundLevel
    const princessBaseY = screenY - 60 * scale // Princess height
    
    // Gentle animation - slight bobbing (happy to be saved)
    const princessBob = Math.sin(time * 2) * 2
    const finalPrincessY = princessBaseY + princessBob
    
    // Princess shadow
    g.beginFill(0x000000, 0.25)
    g.drawEllipse(screenX + 2, groundY + 2, 20 * scale, 8 * scale)
    g.endFill()
    
    // Princess dress (paper cutout - pink/rose color)
    const dressWidth = 30 * scale
    const dressHeight = 40 * scale
    const dressY = finalPrincessY + 20 * scale
    
    g.beginFill(0xFFB6C1) // Light pink dress
    g.drawEllipse(screenX, dressY, dressWidth / 2, dressHeight / 2)
    g.endFill()
    
    // Dress outline
    g.lineStyle(2, 0xFF9AB8, 0.9)
    g.drawEllipse(screenX, dressY, dressWidth / 2, dressHeight / 2)
    g.lineStyle(0)
    
    // Dress details (frills/layers)
    g.beginFill(0xFFC0CB, 0.7) // Lighter pink layer
    g.drawRect(screenX - dressWidth / 2, dressY - 5 * scale, dressWidth, 10 * scale)
    g.endFill()
    
    // Princess body/torso
    g.beginFill(0xF5DEB3) // Skin tone
    g.drawRect(screenX - 8 * scale, finalPrincessY + 10 * scale, 16 * scale, 20 * scale)
    g.endFill()
    
    // Princess head
    const headSize = 18 * scale
    g.beginFill(0xF5DEB3) // Skin tone
    g.drawCircle(screenX, finalPrincessY, headSize / 2)
    g.endFill()
    
    // Princess hair (long flowing hair)
    g.beginFill(0xFFD700) // Golden hair
    g.drawEllipse(screenX, finalPrincessY - 5 * scale, 22 * scale, 25 * scale)
    g.endFill()
    
    // Hair outline
    g.lineStyle(2, 0xE6C700, 0.9)
    g.drawEllipse(screenX, finalPrincessY - 5 * scale, 22 * scale, 25 * scale)
    g.lineStyle(0)
    
    // Princess crown (small crown on head)
    g.beginFill(0xFFD700) // Gold crown
    g.drawPolygon([
      screenX - 8 * scale, finalPrincessY - 8 * scale,
      screenX, finalPrincessY - 15 * scale,
      screenX + 8 * scale, finalPrincessY - 8 * scale
    ])
    g.endFill()
    
    // Crown jewels
    g.beginFill(0xFF1493) // Pink jewel
    g.drawCircle(screenX, finalPrincessY - 12 * scale, 3 * scale)
    g.endFill()
    
    // Princess eyes
    g.beginFill(0x000000)
    g.drawCircle(screenX - 4 * scale, finalPrincessY - 2 * scale, 2 * scale)
    g.drawCircle(screenX + 4 * scale, finalPrincessY - 2 * scale, 2 * scale)
    g.endFill()
    
    // Eye highlights
    g.beginFill(0xFFFFFF)
    g.drawCircle(screenX - 4 * scale - 0.5, finalPrincessY - 2 * scale - 0.5, 1 * scale)
    g.drawCircle(screenX + 4 * scale - 0.5, finalPrincessY - 2 * scale - 0.5, 1 * scale)
    g.endFill()
    
    // Princess smile (happy to be saved!)
    g.lineStyle(2, 0x000000, 0.8)
    g.moveTo(screenX - 4 * scale, finalPrincessY + 3 * scale)
    g.quadraticCurveTo(screenX, finalPrincessY + 6 * scale, screenX + 4 * scale, finalPrincessY + 3 * scale)
    g.lineStyle(0)
    
    // Princess arms (waving/celebrating)
    const armBob = Math.sin(time * 3) * 0.3
    // Left arm
    g.beginFill(0xF5DEB3)
    g.drawEllipse(screenX - 12 * scale, finalPrincessY + 12 * scale + armBob * 5, 6 * scale, 12 * scale)
    g.endFill()
    // Right arm (waving)
    g.beginFill(0xF5DEB3)
    g.drawEllipse(screenX + 12 * scale, finalPrincessY + 8 * scale + armBob * 5, 6 * scale, 12 * scale)
    g.endFill()
    
    // Princess outline (paper style)
    g.lineStyle(2, 0xE0C0B0, 0.9)
    g.drawCircle(screenX, finalPrincessY, headSize / 2)
    g.drawRect(screenX - 8 * scale, finalPrincessY + 10 * scale, 16 * scale, 20 * scale)
    g.lineStyle(0)
  }, [])
  
  // Draw forest tree (paper cutout style)
  const drawForestTree = useCallback((g, tree) => {
    if (!tree) return
    g.clear()
    const screenX = tree.x - (cameraRef.current?.x || 0)
    const screenY = tree.y - (cameraRef.current?.y || 0)
    const scale = tree.scale || 1
    
    // Draw tree trunk (paper cutout)
    const trunkWidth = 12 * scale
    const trunkHeight = 30 * scale
    const trunkX = screenX + (tree.width / 2) - (trunkWidth / 2)
    const trunkY = screenY + tree.height - trunkHeight
    
    // Trunk shadow
    g.beginFill(0x000000, 0.25)
    g.drawRect(trunkX + 2, trunkY + 2, trunkWidth, trunkHeight)
    g.endFill()
    
    // Trunk (paper-like brown)
    g.beginFill(0xA67C52) // Warmer, softer brown
    g.drawRect(trunkX, trunkY, trunkWidth, trunkHeight)
    g.endFill()
    
    // Trunk outline
    g.lineStyle(1.5, 0x8B5A3A, 0.8)
    g.drawRect(trunkX, trunkY, trunkWidth, trunkHeight)
    g.lineStyle(0)
    
    // Draw tree leaves/crown (paper layers)
    const crownSize = 40 * scale
    const crownX = screenX + (tree.width / 2)
    const crownY = screenY + tree.height - trunkHeight - 10
    
    // Crown shadow
    g.beginFill(0x000000, 0.2)
    g.drawCircle(crownX + 2, crownY + 2, crownSize / 2)
    g.endFill()
    
    // Main crown (paper green)
    g.beginFill(0x5A9A5A) // Softer, warmer green
    g.drawCircle(crownX, crownY, crownSize / 2)
    g.endFill()
    
    // Crown outline
    g.lineStyle(2, 0x4A7A4A, 0.9)
    g.drawCircle(crownX, crownY, crownSize / 2)
    g.lineStyle(0)
    
    // Paper texture layers (lighter green circles)
    g.beginFill(0x7ABA7A, 0.6) // Softer lighter green
    g.drawCircle(crownX - 8 * scale, crownY - 5 * scale, 8 * scale)
    g.drawCircle(crownX + 8 * scale, crownY - 5 * scale, 8 * scale)
    g.drawCircle(crownX, crownY + 5 * scale, 8 * scale)
    g.endFill()
  }, [])
  // ============================================================================
  // SUPERHERO SPRITE RENDERING
  // ============================================================================
  
  // Calculate superhero position (replaces the old drawing functions)
  const getSuperheroPosition = useCallback((time) => {
    if (!player || !selectedSuperhero) return null
    
    const cameraX = cameraRef.current?.x || 0
    const cameraY = cameraRef.current?.y || 0
    const playerScreenX = Math.round(player.x - cameraX)
    
    // Calculate position
    const GROUND_LEVEL = getGroundLevel(viewportHeight)
    const groundScreenY = GROUND_LEVEL - cameraY
    const heroOffsetX = Math.sin(time * selectedSuperhero.offsetXSpeed) * 8
    const heroOffsetY = Math.cos(time * selectedSuperhero.offsetYSpeed) * 6
    
    // Add extra vertical offset when user is scrolling (move higher)
    let scrollHeightBoost = 0
    if (scrollInput && scrollInput.isScrolling()) {
      const scrollVel = scrollInput.getScrollVelocity()
      // Move higher based on scroll velocity (more scroll = higher up)
      // Cap the boost to a reasonable maximum
      scrollHeightBoost = Math.min(Math.abs(scrollVel) * 2, 80)
      }
    
    const heroX = playerScreenX + heroOffsetX
    const heroY = groundScreenY - selectedSuperhero.heightAboveGround + heroOffsetY - scrollHeightBoost
    
    return { x: heroX, y: heroY }
  }, [player, selectedSuperhero, viewportHeight, scrollInput])
  
  // Draw fireworks
  const drawFireworks = useCallback((g) => {
    if (fireworks.length === 0) return
    g.clear()
    
    fireworks.forEach(firework => {
      if (firework.life <= 0) return
      
      const alpha = firework.life
      const [r, gb, b] = firework.color
      const color = (r << 16) | (gb << 8) | b
      
      // Draw particle
      g.beginFill(color, alpha)
      g.drawCircle(firework.x, firework.y, firework.size)
      g.endFill()
      
      // Add glow effect
      g.beginFill(color, alpha * 0.3)
      g.drawCircle(firework.x, firework.y, firework.size * 2)
      g.endFill()
    })
  }, [fireworks])
  
  // Draw section container (paper-like borders)
  const drawSectionContainer = useCallback((g, section, sectionIndex) => {
    if (!section) return
    g.clear()
    
    const sections = portfolioData.sections
    const sectionWidth = sectionIndex < sections.length - 1
      ? sections[sectionIndex + 1].x - section.x
      : 400 // Last section gets 400px width
    
    const GROUND_LEVEL = getGroundLevel(viewportHeight)
    const containerHeight = viewportHeight // Full viewport height
    
    const worldX = section.x
    const worldY = GROUND_LEVEL - containerHeight
    const screenX = worldX - (cameraRef.current?.x || 0)
    const screenY = worldY - (cameraRef.current?.y || 0)
    
    // Only draw if visible on screen
    if (screenX + sectionWidth < 0 || screenX > viewportWidth) return
    
    // Draw container with paper-like style
    const containerColor = section.bgColor || 0xFFFFFF
    const fillAlpha = 0.12 // Very subtle fill
    const borderAlpha = 0.4 // Softer border
    
    // Paper shadow
    g.beginFill(0x000000, 0.1)
    g.drawRect(screenX + 3, screenY + 3, sectionWidth, containerHeight)
    g.endFill()
    
    // Fill (paper-like)
    g.beginFill(containerColor, fillAlpha)
    g.drawRect(screenX, screenY, sectionWidth, containerHeight)
    g.endFill()
    
    // Border (paper cutout style - dashed effect)
    g.lineStyle(2, containerColor, borderAlpha)
    g.drawRect(screenX, screenY, sectionWidth, containerHeight)
    g.lineStyle(0)
  }, [viewportHeight])
  
  // Draw roads on the ground (pencil-drawn style)
  const drawRoads = useCallback((g) => {
    g.clear()
    
    const cameraX = cameraRef.current?.x || 0
    const cameraY = cameraRef.current?.y || 0
    const GROUND_LEVEL = getGroundLevel(viewportHeight)
    const groundScreenY = GROUND_LEVEL - cameraY
    
    // Pencil road properties
    const pencilColor = 0x8B7355 // Brown pencil color (matches mountain)
    const pencilAlpha = 0.6 // Pencil opacity
    const roadWidth = 100 // Width of the road
    const roadHeight = 6 // Height/thickness of the road
    
    // Road spans the entire level
    const roadStartX = -1000
    const roadEndX = LEVEL_WIDTH + 1000
    
    // Use seeded random for consistent road drawing
    let worldSeed = localStorage.getItem('game-world-seed');
    if (!worldSeed) {
      worldSeed = Math.random().toString();
      localStorage.setItem('game-world-seed', worldSeed);
    }
    const seededRandom = (seed) => {
      const x = Math.sin(parseFloat(worldSeed) * 10000 + seed) * 10000;
      return x - Math.floor(x);
    };
    
    // Draw top road edge (hand-drawn, wobbly line)
    g.lineStyle(2.5, pencilColor, pencilAlpha)
    const topEdgeY = groundScreenY - roadHeight / 2
    let prevX = roadStartX - cameraX
    let prevY = topEdgeY
    
    // Create wobbly, hand-drawn top edge
    for (let worldX = roadStartX; worldX <= roadEndX; worldX += 10) {
      const screenX = worldX - cameraX
      if (screenX < -200 || screenX > viewportWidth + 200) continue
      
      // Add slight wobble for hand-drawn effect
      const wobble = (seededRandom(worldX * 0.5) - 0.5) * 3 // Small vertical variation
      const currentY = topEdgeY + wobble
      
      if (worldX === roadStartX) {
        g.moveTo(screenX, currentY)
      } else {
        g.lineTo(screenX, currentY)
      }
      prevX = screenX
      prevY = currentY
    }
    g.lineStyle(0)
    
    // Draw bottom road edge (hand-drawn, wobbly line)
    g.lineStyle(2.5, pencilColor, pencilAlpha)
    const bottomEdgeY = groundScreenY + roadHeight / 2
    prevX = roadStartX - cameraX
    prevY = bottomEdgeY
    
    // Create wobbly, hand-drawn bottom edge
    for (let worldX = roadStartX; worldX <= roadEndX; worldX += 10) {
      const screenX = worldX - cameraX
      if (screenX < -200 || screenX > viewportWidth + 200) continue
      
      // Add slight wobble for hand-drawn effect
      const wobble = (seededRandom(worldX * 0.5 + 1000) - 0.5) * 3 // Different seed for variation
      const currentY = bottomEdgeY + wobble
      
      if (worldX === roadStartX) {
        g.moveTo(screenX, currentY)
      } else {
        g.lineTo(screenX, currentY)
      }
      prevX = screenX
      prevY = currentY
    }
    g.lineStyle(0)
    
    // Draw center dashed line (hand-drawn style)
    g.lineStyle(2, pencilColor, pencilAlpha * 0.8)
    const centerY = groundScreenY
    const dashLength = 25
    const dashGap = 20
    
    for (let worldX = roadStartX; worldX <= roadEndX; worldX += dashLength + dashGap) {
      const screenX = worldX - cameraX
      if (screenX < -200 || screenX > viewportWidth + 200) continue
      
      const dashEndX = Math.min(worldX + dashLength, roadEndX) - cameraX
      const wobble = (seededRandom(worldX * 0.3) - 0.5) * 2 // Small wobble for each dash
      
      g.moveTo(screenX, centerY + wobble)
      g.lineTo(dashEndX, centerY + wobble)
    }
    g.lineStyle(0)
    
    // Add detailed pencil texture/scribbles inside the road (like shading)
    // Multiple layers of detail for richer appearance
    g.lineStyle(1, pencilColor, pencilAlpha * 0.3)
    const textureSpacing = 40 // More frequent texture
    for (let worldX = roadStartX; worldX <= roadEndX; worldX += textureSpacing) {
      const screenX = worldX - cameraX
      if (screenX < -200 || screenX > viewportWidth + 200) continue
      
      // Random short lines for texture (more variety)
      const numLines = Math.floor(seededRandom(worldX * 0.7) * 4) + 2 // 2-5 lines
      for (let i = 0; i < numLines; i++) {
        const lineY = groundScreenY - roadHeight / 2 + seededRandom(worldX * 0.7 + i) * roadHeight
        const lineLength = 8 + seededRandom(worldX * 0.7 + i + 100) * 15
        g.moveTo(screenX, lineY)
        g.lineTo(screenX + lineLength, lineY + (seededRandom(worldX * 0.7 + i + 200) - 0.5) * 3)
      }
    }
    g.lineStyle(0)
    
    // Add cross-hatching for depth (pencil shading technique)
    g.lineStyle(0.8, pencilColor, pencilAlpha * 0.25)
    const hatchSpacing = 80
    for (let worldX = roadStartX; worldX <= roadEndX; worldX += hatchSpacing) {
      const screenX = worldX - cameraX
      if (screenX < -200 || screenX > viewportWidth + 200) continue
      
      // Diagonal hatching lines
      const hatchY = groundScreenY - roadHeight / 2 + seededRandom(worldX * 0.9) * roadHeight
      const hatchLength = 20 + seededRandom(worldX * 0.9 + 50) * 15
      g.moveTo(screenX, hatchY)
      g.lineTo(screenX + hatchLength, hatchY + roadHeight * 0.6)
    }
    g.lineStyle(0)
    
    // Add small details like cracks, marks, and imperfections
    g.lineStyle(0.5, pencilColor, pencilAlpha * 0.4)
    const detailSpacing = 120
    for (let worldX = roadStartX; worldX <= roadEndX; worldX += detailSpacing) {
      const screenX = worldX - cameraX
      if (screenX < -200 || screenX > viewportWidth + 200) continue
      
      const detailType = Math.floor(seededRandom(worldX * 1.1) * 4)
      const detailY = groundScreenY - roadHeight / 2 + seededRandom(worldX * 1.1 + 10) * roadHeight
      
      if (detailType === 0) {
        // Small crack
        g.moveTo(screenX, detailY)
        g.lineTo(screenX + 3, detailY + 2)
        g.lineTo(screenX + 6, detailY)
      } else if (detailType === 1) {
        // Small dot/spot
        g.drawCircle(screenX, detailY, 1.5)
      } else if (detailType === 2) {
        // Small zigzag
        g.moveTo(screenX, detailY)
        g.lineTo(screenX + 2, detailY + 1)
        g.lineTo(screenX + 4, detailY - 1)
        g.lineTo(screenX + 6, detailY)
      } else {
        // Small curved mark
        g.moveTo(screenX, detailY)
        for (let j = 0; j < 5; j++) {
          const x = screenX + j * 1.5
          const y = detailY + Math.sin(j * 0.5) * 1.5
          g.lineTo(x, y)
        }
      }
    }
    g.lineStyle(0)
  }, [viewportHeight])
  
  // Draw background function that uses current bgColor with notebook lines
  const drawBackground = useCallback((g) => {
    g.clear()
    
    // Draw background color (paper-like off-white/cream)
    const paperColor = 0xF5F5DC // Cream/off-white paper color
    g.beginFill(paperColor)
    // Draw a rectangle covering the entire viewport
    // Make it very large to cover all camera positions
    g.drawRect(-10000, -10000, 30000, 30000)
    g.endFill()
    
    // Draw notebook-style horizontal lines (blue lines)
    const cameraX = cameraRef.current?.x || 0
    const cameraY = cameraRef.current?.y || 0
    
    // Calculate visible area
    const startY = -cameraY - 1000 // Start above viewport
    const endY = -cameraY + viewportHeight + 1000 // End below viewport
    const lineSpacing = 20 // Spacing between lines (notebook line spacing)
    const lineColor = 0x4169E1 // Blue color for notebook lines
    const lineAlpha = 0.3 // Subtle transparency
    
    // Draw horizontal lines
    g.lineStyle(1, lineColor, lineAlpha)
    for (let y = Math.floor(startY / lineSpacing) * lineSpacing; y <= endY; y += lineSpacing) {
      g.moveTo(-10000, y)
      g.lineTo(20000, y)
    }
    g.lineStyle(0)
    
    // Draw red margin line on the left (like notebook paper)
    const marginX = -cameraX + 50 // Margin position (50px from left edge)
    const marginColor = 0xDC143C // Red color for margin
    g.lineStyle(2, marginColor, 0.5)
    g.moveTo(marginX, -10000)
    g.lineTo(marginX, 20000)
    g.lineStyle(0)
    
    // Draw pen/pencil marks (doodles, scribbles, random marks) - fixed in world space
    const penColor = 0x2C2C2C // Dark gray/black for pen marks
    const pencilColor = 0x8B7355 // Brown for pencil marks
    
    // Fixed world area for generating marks (covers entire level)
    const fixedWorldStartX = -1000
    const fixedWorldEndX = LEVEL_WIDTH + 1000
    const fixedWorldStartY = -2000
    const fixedWorldEndY = viewportHeight + 2000
    
    // World coordinates for visible area (for culling)
    const worldStartX = cameraX - 2000
    const worldEndX = cameraX + viewportWidth + 2000
    const worldStartY = -cameraY - 1000
    const worldEndY = -cameraY + viewportHeight + 1000
    
    // Create a seeded random function for consistent marks
    const seededRandom = (seed) => {
      const x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }
    
    // Draw fewer marks in random positions - use fixed world coordinates
    const fixedWorldArea = (fixedWorldEndX - fixedWorldStartX) * (fixedWorldEndY - fixedWorldStartY)
    const markDensity = 0.00001 // Very low density - adjust this to control how many marks
    const numMarks = Math.floor(fixedWorldArea * markDensity)
    
    for (let i = 0; i < numMarks; i++) {
      // Fixed world position (doesn't depend on camera)
      const worldX = fixedWorldStartX + seededRandom(i * 137.5) * (fixedWorldEndX - fixedWorldStartX)
      const worldY = fixedWorldStartY + seededRandom(i * 237.3) * (fixedWorldEndY - fixedWorldStartY)
      
      // Skip if not in visible area
      if (worldX < worldStartX || worldX > worldEndX || worldY < worldStartY || worldY > worldEndY) {
        continue
      }
      
      // Convert to screen coordinates for drawing
      const screenX = worldX - cameraX
      const screenY = worldY - cameraY
      
      const baseX = screenX
      const baseY = screenY
      const markSeed = Math.floor(worldX / 50) + Math.floor(worldY / 50) + i * 1000
      
      // Randomly choose pen or pencil
      const usePencil = seededRandom(markSeed) > 0.5
      const markColor = usePencil ? pencilColor : penColor
      const markAlpha = usePencil ? 0.15 + seededRandom(markSeed + 1) * 0.2 : 0.2 + seededRandom(markSeed + 2) * 0.3
      const lineWidth = usePencil ? 1 + seededRandom(markSeed + 3) * 1.5 : 1.5 + seededRandom(markSeed + 4) * 1.5
      
      g.lineStyle(lineWidth, markColor, markAlpha)
      
      // Different types of marks (more detailed and varied)
      const markType = Math.floor(seededRandom(markSeed + 5) * 8) // Increased from 5 to 8 types
      
      switch (markType) {
        case 0: // Scribble/zigzag (more detailed)
          g.moveTo(baseX, baseY)
          for (let j = 0; j < 12; j++) { // More points
            const x = baseX + (j * 12) + (seededRandom(markSeed + j) * 25 - 12.5)
            const y = baseY + (seededRandom(markSeed + j + 10) * 35 - 17.5)
            g.lineTo(x, y)
          }
          break
          
        case 1: // Small circle/doodle (with inner details)
          const radius = 10 + seededRandom(markSeed + 20) * 15
          const centerX = baseX + (seededRandom(markSeed + 30) * 40 - 20)
          const centerY = baseY + (seededRandom(markSeed + 40) * 30 - 15)
          g.drawCircle(centerX, centerY, radius)
          // Add inner circle or cross for detail
          if (seededRandom(markSeed + 45) > 0.5) {
            g.drawCircle(centerX, centerY, radius * 0.6)
          } else {
            g.moveTo(centerX - radius * 0.7, centerY - radius * 0.7)
            g.lineTo(centerX + radius * 0.7, centerY + radius * 0.7)
            g.moveTo(centerX + radius * 0.7, centerY - radius * 0.7)
            g.lineTo(centerX - radius * 0.7, centerY + radius * 0.7)
          }
          break
          
        case 2: // Random lines (more lines)
          for (let j = 0; j < 5; j++) { // Increased from 3 to 5
            const x1 = baseX + (seededRandom(markSeed + j * 10) * 50 - 25)
            const y1 = baseY + (seededRandom(markSeed + j * 10 + 1) * 40 - 20)
            const x2 = baseX + (seededRandom(markSeed + j * 10 + 2) * 50 - 25)
            const y2 = baseY + (seededRandom(markSeed + j * 10 + 3) * 40 - 20)
            g.moveTo(x1, y1)
            g.lineTo(x2, y2)
          }
          break
          
        case 3: // Small star/asterisk (more points)
          const starX = baseX + (seededRandom(markSeed + 50) * 40 - 20)
          const starY = baseY + (seededRandom(markSeed + 60) * 30 - 15)
          const starSize = 8 + seededRandom(markSeed + 70) * 8
          const starPoints = 8 // Increased from 6 to 8
          for (let j = 0; j < starPoints; j++) {
            const angle = (j / starPoints) * Math.PI * 2
            const x = starX + Math.cos(angle) * starSize
            const y = starY + Math.sin(angle) * starSize
            if (j === 0) {
              g.moveTo(x, y)
            } else {
              g.lineTo(starX, starY)
              g.lineTo(x, y)
            }
          }
          break
          
        case 4: // Wavy line (more detailed)
          g.moveTo(baseX, baseY)
          for (let j = 0; j < 16; j++) { // More points
            const x = baseX + (j * 7)
            const y = baseY + Math.sin(j * 0.7) * 18 + (seededRandom(markSeed + j * 5) * 12 - 6)
            g.lineTo(x, y)
          }
          break
          
        case 5: // Spiral/doodle
          const spiralX = baseX + (seededRandom(markSeed + 80) * 40 - 20)
          const spiralY = baseY + (seededRandom(markSeed + 90) * 30 - 15)
          const spiralTurns = 2 + seededRandom(markSeed + 100) * 2
          const spiralRadius = 5 + seededRandom(markSeed + 110) * 10
          for (let j = 0; j < 20; j++) {
            const angle = (j / 20) * Math.PI * 2 * spiralTurns
            const radius = (j / 20) * spiralRadius
            const x = spiralX + Math.cos(angle) * radius
            const y = spiralY + Math.sin(angle) * radius
            if (j === 0) {
              g.moveTo(x, y)
            } else {
              g.lineTo(x, y)
            }
          }
          break
          
        case 6: // Box with details
          const boxX = baseX + (seededRandom(markSeed + 120) * 40 - 20)
          const boxY = baseY + (seededRandom(markSeed + 130) * 30 - 15)
          const boxSize = 8 + seededRandom(markSeed + 140) * 12
          g.drawRect(boxX - boxSize / 2, boxY - boxSize / 2, boxSize, boxSize)
          // Add diagonal line or inner box
          if (seededRandom(markSeed + 150) > 0.5) {
            g.moveTo(boxX - boxSize / 2, boxY - boxSize / 2)
            g.lineTo(boxX + boxSize / 2, boxY + boxSize / 2)
          } else {
            g.drawRect(boxX - boxSize / 3, boxY - boxSize / 3, boxSize * 2 / 3, boxSize * 2 / 3)
          }
          break
          
        case 7: // Curved/loopy lines
          g.moveTo(baseX, baseY)
          for (let j = 0; j < 10; j++) {
            const x = baseX + (j * 6) + Math.sin(j * 0.5) * 8
            const y = baseY + Math.cos(j * 0.5) * 12 + (seededRandom(markSeed + j * 7) * 8 - 4)
            g.lineTo(x, y)
          }
          break
      }
      
      g.lineStyle(0)
    }
    
    // Add fewer margin doodles in random positions - fixed in world space
    const marginWorldX = 50 // Fixed world X position for margin
    const marginDoodleArea = (fixedWorldEndY - fixedWorldStartY) * 50 // Area near margin (50px wide)
    const marginDoodleDensity = 0.00005 // Very low density
    const numMarginDoodles = Math.floor(marginDoodleArea * marginDoodleDensity)
    
    for (let i = 0; i < numMarginDoodles; i++) {
      // Fixed world position (doesn't depend on camera)
      const worldDoodleY = fixedWorldStartY + seededRandom(i * 357.7) * (fixedWorldEndY - fixedWorldStartY)
      
      // Skip if not in visible area
      if (worldDoodleY < worldStartY || worldDoodleY > worldEndY) {
        continue
      }
      
      const doodleSeed = Math.floor(worldDoodleY / 50) + i * 2000
      
      // Convert to screen coordinates
      const screenDoodleX = marginWorldX - cameraX + (seededRandom(doodleSeed + 100) * 30 - 15)
      const screenDoodleY = worldDoodleY - cameraY
      
      const doodleColor = seededRandom(doodleSeed + 200) > 0.5 ? pencilColor : penColor
      const doodleAlpha = 0.1 + seededRandom(doodleSeed + 300) * 0.15
      
      g.lineStyle(1, doodleColor, doodleAlpha)
      
      // Small margin mark (like a checkmark or small line)
      const markType = Math.floor(seededRandom(doodleSeed + 400) * 3)
      if (markType === 0) {
        // Small checkmark
        g.moveTo(screenDoodleX - 5, screenDoodleY)
        g.lineTo(screenDoodleX, screenDoodleY + 5)
        g.lineTo(screenDoodleX + 5, screenDoodleY - 3)
      } else if (markType === 1) {
        // Small X
        g.moveTo(screenDoodleX - 4, screenDoodleY - 4)
        g.lineTo(screenDoodleX + 4, screenDoodleY + 4)
        g.moveTo(screenDoodleX + 4, screenDoodleY - 4)
        g.lineTo(screenDoodleX - 4, screenDoodleY + 4)
      } else {
        // Small dot
        g.drawCircle(screenDoodleX, screenDoodleY, 2)
      }
      
      g.lineStyle(0)
    }
    
    // Draw big pencil mountain range covering full length - fixed in world space
    const mountainColor = 0x8B7355 // Brown pencil color
    const mountainAlpha = 0.4 // Pencil opacity
    const mountainLineWidth = 2.5 // Pencil line width
    
    // Mountain spans the entire level
    const mountainStartX = -1000 // Start before level
    const mountainEndX = LEVEL_WIDTH + 1000 // End after level
    const mountainBaseY = -cameraY + viewportHeight * 0.6 // Position in middle-lower part of screen (sky area)
    
    // Only draw if visible
    const mountainScreenStartX = mountainStartX - cameraX
    const mountainScreenEndX = mountainEndX - cameraX
    
    if (mountainScreenEndX > 0 && mountainScreenStartX < viewportWidth) {
      g.lineStyle(mountainLineWidth, mountainColor, mountainAlpha)
      
      // Draw continuous mountain range with peaks and valleys
      const numPeaks = Math.ceil((mountainEndX - mountainStartX) / 200) // One peak every 200px
      let currentX = mountainStartX
      
      g.moveTo(mountainScreenStartX, mountainBaseY - cameraY)
      
      for (let i = 0; i < numPeaks; i++) {
        const peakX = currentX + 200
        const peakHeight = 80 + seededRandom(i * 500) * 120 // Vary peak heights (80-200px)
        const peakY = mountainBaseY - peakHeight
        
        // Convert to screen coordinates
        const screenPeakX = peakX - cameraX
        const screenPeakY = peakY - cameraY
        
        // Draw mountain slope up to peak with more variation
        const midX = currentX + 100
        const midY = mountainBaseY - (peakHeight * 0.3 + seededRandom(i * 500 + 10) * 20)
        const screenMidX = midX - cameraX
        const screenMidY = midY - cameraY
        
        g.lineTo(screenMidX, screenMidY)
        g.lineTo(screenPeakX, screenPeakY)
        
        // Draw peak with more jagged details
        const peakJag1X = screenPeakX + 8
        const peakJag1Y = screenPeakY + (seededRandom(i * 500 + 1) * 15 - 7)
        const peakJag2X = screenPeakX + 15
        const peakJag2Y = screenPeakY + (seededRandom(i * 500 + 2) * 18 - 9)
        const peakJag3X = screenPeakX + 22
        const peakJag3Y = screenPeakY + (seededRandom(i * 500 + 3) * 20 - 10)
        const peakJag4X = screenPeakX + 30
        const peakJag4Y = screenPeakY + (seededRandom(i * 500 + 4) * 25)
        
        g.lineTo(peakJag1X, peakJag1Y)
        g.lineTo(peakJag2X, peakJag2Y)
        g.lineTo(peakJag3X, peakJag3Y)
        g.lineTo(peakJag4X, peakJag4Y)
        
        currentX = peakX + 30
      }
      
      // Complete the mountain range to the end
      g.lineTo(mountainScreenEndX, mountainBaseY - cameraY)
      
      g.lineStyle(0)
      
      // Add detailed mountain texture and shading
      // Vertical shading lines (more detailed)
      g.lineStyle(1, mountainColor, mountainAlpha * 0.5)
      for (let i = 0; i < numPeaks; i++) {
        const detailX = mountainStartX + (i * 200) + 30
        const screenDetailX = detailX - cameraX
        
        if (screenDetailX > 0 && screenDetailX < viewportWidth) {
          const peakHeight = 80 + seededRandom(i * 500) * 120
          const detailStartY = mountainBaseY - cameraY - peakHeight
          const detailEndY = mountainBaseY - cameraY
          
          // More texture lines per peak with variation
          for (let j = 0; j < 8; j++) { // Increased from 5 to 8
            const offsetX = screenDetailX + (j * 20) + seededRandom(i * 500 + j) * 10 // Tighter spacing
            if (offsetX > -50 && offsetX < viewportWidth + 50) {
              // Vary line length for more natural look with curves
              const lineStartY = detailStartY + (seededRandom(i * 500 + j * 20) * 30)
              const midY = (lineStartY + detailEndY) / 2
              const wobble = (seededRandom(i * 500 + j * 30) - 0.5) * 4
              g.moveTo(offsetX, lineStartY)
              g.lineTo(offsetX + wobble * 0.5, midY) // Add slight curve
              g.lineTo(offsetX + wobble, detailEndY)
            }
          }
        }
      }
      g.lineStyle(0)
      
      // Add horizontal contour lines (elevation lines)
      g.lineStyle(1, mountainColor, mountainAlpha * 0.3)
      for (let i = 0; i < numPeaks; i++) {
        const contourLevels = 5 // Increased from 3 to 5
        for (let level = 1; level <= contourLevels; level++) {
          const contourY = mountainBaseY - cameraY - (level * 30) // Closer spacing
          const peakX = mountainStartX + (i * 200)
          const screenPeakX = peakX - cameraX
          
          if (screenPeakX > -200 && screenPeakX < viewportWidth + 200) {
            // Draw wavy contour line
            const contourStartX = Math.max(mountainScreenStartX, screenPeakX - 100)
            const contourEndX = Math.min(mountainScreenEndX, screenPeakX + 100)
            
            g.moveTo(contourStartX, contourY)
            for (let x = contourStartX; x <= contourEndX; x += 15) { // More frequent points
              const worldX = x + cameraX
              const waveY = contourY + Math.sin((x - contourStartX) * 0.1 + i) * 5 + (seededRandom(worldX * 0.1 + level * 100) - 0.5) * 3
              g.lineTo(x, waveY)
            }
          }
        }
      }
      g.lineStyle(0)
      
      // Add rock details and small features
      g.lineStyle(1.5, mountainColor, mountainAlpha * 0.6)
      for (let i = 0; i < numPeaks * 2; i++) {
        const rockX = mountainStartX + (i * 100) + seededRandom(i * 300) * 50
        const screenRockX = rockX - cameraX
        
        if (screenRockX > 0 && screenRockX < viewportWidth) {
          const rockY = mountainBaseY - cameraY - (40 + seededRandom(i * 400) * 100)
          
          // Draw small rock formations
          const rockSize = 3 + seededRandom(i * 500) * 4
          const rockType = Math.floor(seededRandom(i * 600) * 3)
          
          if (rockType === 0) {
            // Small circle rock
            g.drawCircle(screenRockX, rockY, rockSize)
          } else if (rockType === 1) {
            // Small jagged rock
            g.moveTo(screenRockX - rockSize, rockY)
            g.lineTo(screenRockX, rockY - rockSize)
            g.lineTo(screenRockX + rockSize, rockY)
            g.lineTo(screenRockX, rockY + rockSize)
            g.lineTo(screenRockX - rockSize, rockY)
          } else {
            // Small X mark
            g.moveTo(screenRockX - rockSize, rockY - rockSize)
            g.lineTo(screenRockX + rockSize, rockY + rockSize)
            g.moveTo(screenRockX + rockSize, rockY - rockSize)
            g.lineTo(screenRockX - rockSize, rockY + rockSize)
          }
        }
      }
      g.lineStyle(0)
      
      // Add cross-hatching for depth (pencil shading technique)
      g.lineStyle(0.8, mountainColor, mountainAlpha * 0.25)
      for (let i = 0; i < numPeaks; i++) {
        const hatchX = mountainStartX + (i * 200) + 60
        const screenHatchX = hatchX - cameraX
        
        if (screenHatchX > 0 && screenHatchX < viewportWidth) {
          const peakHeight = 80 + seededRandom(i * 500) * 120
          const hatchStartY = mountainBaseY - cameraY - peakHeight * 0.5
          const hatchEndY = mountainBaseY - cameraY - peakHeight * 0.2
          
          // Diagonal cross-hatch lines (more lines)
          for (let j = 0; j < 6; j++) { // Increased from 4 to 6
            const offsetX = screenHatchX + (j * 15) // Tighter spacing
            const offsetY1 = hatchStartY + (j * 8)
            const offsetY2 = hatchEndY + (j * 4)
            const wobble = (seededRandom(i * 500 + j * 100) - 0.5) * 3
            
            if (offsetX > 0 && offsetX < viewportWidth) {
              // Diagonal lines going down-right
              g.moveTo(offsetX - 15, offsetY1)
              g.lineTo(offsetX + 15, offsetY2)
            }
          }
        }
      }
      g.lineStyle(0)
    }
  }, [bgColor, viewportHeight])
  
  
  // Update Stage background color when bgColor changes
  useEffect(() => {
    if (stageRef.current && stageRef.current.app?.renderer) {
      stageRef.current.app.renderer.backgroundColor = bgColor
    }
  }, [bgColor])
  
  if (!pixiReady) {
    return <div className="game-root game-root--loading">Loading game...</div>
  }
  
  return (
    <div className="game-root">
      <Stage
        ref={stageRef}
        width={viewportWidth}
        height={viewportHeight}
        options={{
          backgroundColor: bgColor, // Use dynamic background color
          antialias: false,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
          roundPixels: true
        }}
      >
        <Container>
          {/* Full-screen background color - drawn first so it's behind everything */}
          <Graphics
            key={`bg-color-${bgColor}`}
            draw={drawBackground}
          />
          
          {/* Roads on the ground */}
          <Graphics
            key="roads"
            draw={drawRoads}
          />
          
          {/* Platforms */}
          {platforms.map((platform, index) => (
            <Graphics
              key={`platform-${index}`}
              draw={(g) => drawPlatform(g, platform)}
            />
          ))}
          
          {/* Checkpoint trees (no letters) */}
          {signs.map((sign, index) => {
            const time = performance.now() / 1000 // Time in seconds for animation
            const cameraX = cameraRef.current?.x || 0
            const cameraY = cameraRef.current?.y || 0
            const screenX = sign.x - cameraX
            
            // Calculate ground level position for proper placement
            const GROUND_LEVEL = getGroundLevel(viewportHeight)
            const groundScreenY = GROUND_LEVEL - cameraY
            
            // Use image sprite if available, otherwise fall back to drawn tree
            const treeTexture = selectedTree && treeTextures[selectedTree.id]
            
            // Gentle tree swaying animation (wind effect) - checkpoint trees sway too
            const swaySpeed = 0.7 + (index % 3) * 0.15 // Vary between 0.7 and 1.0
            const swayAmount = 0.025 // 2.5 degrees max sway (slightly less than forest trees)
            const treeRotation = Math.sin(time * swaySpeed + index * 0.4) * swayAmount
            
            if (treeTexture) {
              return (
                <Sprite
                  key={`sign-tree-${index}`}
                  texture={treeTexture}
                  x={screenX + sign.width / 2}
                  y={groundScreenY + 45} // Moved even lower to sit on ground
                  anchor={{ x: 0.5, y: 1 }} // Anchor at bottom center
                  scale={selectedTree.scale || 0.3}
                  rotation={treeRotation}
                />
              )
            } else {
              return (
            <Graphics
              key={`sign-${index}`}
              draw={(g) => drawSign(g, sign)}
            />
              )
            }
          })}
          
          {/* Forest trees */}
          {forestTrees.map((tree, index) => {
            const time = performance.now() / 1000 // Time in seconds for animation
            const cameraX = cameraRef.current?.x || 0
            const cameraY = cameraRef.current?.y || 0
            const screenX = tree.x - cameraX
            const scale = tree.scale || 1
            
            // Calculate ground level position for proper placement
            const GROUND_LEVEL = getGroundLevel(viewportHeight)
            const groundScreenY = GROUND_LEVEL - cameraY
            
            // Only render if visible on screen
            if (screenX + tree.width * scale < 0 || screenX > viewportWidth) return null
            
            // Use image sprite if available, otherwise fall back to drawn tree
            const treeTexture = selectedTree && treeTextures[selectedTree.id]
            
            // Gentle tree swaying animation (wind effect)
            // Each tree sways at slightly different speed based on its index
            const swaySpeed = 0.8 + (index % 3) * 0.2 // Vary between 0.8 and 1.2
            const swayAmount = 0.03 // 3 degrees max sway
            const treeRotation = Math.sin(time * swaySpeed + index * 0.5) * swayAmount
            
            if (treeTexture) {
              return (
                <Sprite
                  key={`forest-tree-${index}`}
                  texture={treeTexture}
                  x={screenX + (tree.width * scale) / 2}
                  y={groundScreenY + 45} // Moved even lower to sit on ground
                  anchor={{ x: 0.5, y: 1 }} // Anchor at bottom center
                  scale={(selectedTree.scale || 0.3) * scale}
                  rotation={treeRotation}
                />
              )
            } else {
              return (
            <Graphics
              key={`forest-tree-${index}`}
              draw={(g) => drawForestTree(g, tree)}
            />
              )
            }
          })}
          
          {/* Houses */}
          {houses.map((house, index) => {
            const time = performance.now() / 1000 // Time in seconds for animation
            const cameraX = cameraRef.current?.x || 0
            const cameraY = cameraRef.current?.y || 0
            const screenX = house.x - cameraX
            const scale = house.scale || 1
            
            // Calculate ground level position for proper placement
            const GROUND_LEVEL = getGroundLevel(viewportHeight)
            const groundScreenY = GROUND_LEVEL - cameraY
            
            // Only render if visible on screen
            if (screenX + house.width * scale < 0 || screenX > viewportWidth) return null
            
            // Use the house's assigned image ID, or fall back to selectedHouse
            const houseImageId = house.houseImageId
            const houseImages = portfolioData.houseImages || []
            const houseConfig = houseImageId 
              ? houseImages.find(img => img.id === houseImageId) 
              : selectedHouse
            
            // Use image sprite if available, otherwise fall back to drawn house
            const houseTexture = houseConfig && houseTextures[houseConfig.id]
            
            // Very subtle house animation - gentle breathing effect (like it's alive in the paper world)
            const housePulse = Math.sin(time * 0.5 + index * 0.3) * 0.01 // 1% scale variation, very slow
            const baseHouseScale = (houseConfig?.scale || 0.2) * scale
            const houseScale = baseHouseScale * (1 + housePulse)
            
            // Very subtle vertical bob
            const houseBob = Math.sin(time * 0.8 + index * 0.2) * 0.5 // Very small vertical movement
            
            if (houseTexture) {
              return (
                <Sprite
                  key={`house-${index}`}
                  texture={houseTexture}
                  x={screenX + (house.width * scale) / 2}
                  y={groundScreenY + 20 + houseBob} // Position lower on the ground with subtle bob
                  anchor={{ x: 0.5, y: 1 }} // Anchor at bottom center so house sits on ground
                  scale={houseScale}
                />
              )
            } else {
              // Fallback to drawn house if texture not loaded
              return (
            <Graphics
              key={`house-${index}`}
              draw={(g) => drawHouse(g, house)}
            />
              )
            }
          })}
          
          {/* Castles */}
          {castles.map((castle, index) => {
            const time = performance.now() / 1000 // Time in seconds for animation
            const cameraX = cameraRef.current?.x || 0
            const cameraY = cameraRef.current?.y || 0
            const screenX = castle.x - cameraX
            const screenY = castle.y - cameraY
            const scale = castle.scale || 1
            
            // Calculate ground level position for proper placement
            const GROUND_LEVEL = getGroundLevel(viewportHeight)
            const groundScreenY = GROUND_LEVEL - cameraY
            
            // Only render if visible on screen
            if (screenX + castle.width * scale < 0 || screenX > viewportWidth) return null
            
            // Use image sprite if available, otherwise fall back to drawn castle
            const castleTexture = selectedCastle && castleTextures[selectedCastle.id]
            
            return (
              <>
                {castleTexture ? (
                  <Sprite
                    key={`castle-${index}`}
                    texture={castleTexture}
                    x={screenX + (castle.width * scale) / 2 + 50} // Moved to the right
                    y={groundScreenY + 50 + Math.sin(time * 0.3) * 1} // Very subtle vertical movement
                    anchor={{ x: 0.5, y: 1 }} // Anchor at bottom center so castle sits on ground
                    scale={(selectedCastle.scale || 0.3) * scale * (1 + Math.sin(time * 0.4) * 0.005)} // Very subtle scale pulse
                  />
                ) : (
                <Graphics key={`castle-${index}`} draw={(g) => drawCastle(g, castle)} />
                )}
                {/* Only show dragon and fire if dragon is not killed */}
                {!isDragonKilled && (
                  <>
                    {(() => {
                      // Use image sprite if available, otherwise fall back to drawn dragon
                      const dragonTexture = selectedDragon && dragonTextures[selectedDragon.id]
                      const castleWidth = castle.width * scale
                      const castleHeight = castle.height * scale
                      const baseY = screenY - castleHeight
                      
                      // Dragon position - on top of center tower (same as drawn dragon)
                      const centerTowerTop = baseY - 60 * scale
                      const dragonX = screenX + castleWidth / 2 + 50 // Match castle offset
                      const dragonY = centerTowerTop - 30 * scale
                      
                      // Final Boss Dragon Animation - Menacing and Powerful (Slower, More Subtle)
                      // Dramatic breathing effect - expands when "charging" fire, contracts when breathing
                      // When breathing fire, dragon leans forward and expands more
                      const isBreathingFire = dragonBreathingFire
                      
                      // Breathing/pulsing effect - slower, deeper breathing cycle (like a powerful creature)
                      const breathingCycle = Math.sin(time * 0.4) // Much slower breathing (was 0.8)
                      // Base scale pulse (normal breathing)
                      const baseScalePulse = 1 + breathingCycle * 0.12 // 12% variation
                      // Enhanced pulse when breathing fire (more dramatic but slower)
                      const fireChargePulse = isBreathingFire ? 1 + Math.sin(time * 1.5) * 0.08 : 0 // Slower fire pulse (was 3)
                      const dragonScalePulse = baseScalePulse + fireChargePulse
                      
                      // Vertical bobbing - slower and more subtle
                      const baseBob = Math.sin(time * 0.6) * 3 // Slower (was 1.2)
                      const fireBob = isBreathingFire ? Math.sin(time * 2) * 2 : 0 // Slower fire bob (was 4)
                      const dragonBob = baseBob + fireBob
                      
                      // Horizontal sway - slower, more deliberate movement
                      const dragonSway = Math.sin(time * 0.3) * 4 // Much slower (was 0.6)
                      
                      // Rotation - slower head movement, leans forward when breathing fire
                      const baseRotation = Math.sin(time * 0.5) * 0.06 // Slower (was 0.9)
                      const fireLean = isBreathingFire ? 0.12 : 0 // Lean forward ~7 degrees when breathing fire
                      const dragonRotation = baseRotation + fireLean
                      
                      const finalDragonX = dragonX + dragonSway
                      const finalDragonY = dragonY + dragonBob
                      
                      if (dragonTexture) {
                        return (
                          <Sprite
                            key={`dragon-${index}`}
                            texture={dragonTexture}
                            x={finalDragonX}
                            y={finalDragonY}
                            anchor={{ x: 0.5, y: 0.5 }}
                            scale={(selectedDragon.scale || 0.3) * scale * dragonScalePulse}
                            rotation={dragonRotation}
                          />
                        )
                      } else {
                        return (
                    <Graphics key={`dragon-${index}`} draw={(g) => drawDragon(g, castle, time)} />
                        )
                      }
                    })()}
                    {(() => {
                      // Use image sprite if available, otherwise fall back to drawn fire
                      const fireTexture = selectedFire && fireTextures[selectedFire.id]
                      
                      if (!dragonBreathingFire || isDragonKilled) {
                        return null
                      }
                      
                      const castleWidth = castle.width * scale
                      const castleHeight = castle.height * scale
                      const baseY = screenY - castleHeight
                      
                      // Fire position - coming from dragon's mouth (center tower top)
                      const centerTowerTop = baseY - 60 * scale
                      const dragonX = screenX + castleWidth / 2 + 50 // Match castle offset
                      const dragonY = centerTowerTop - 30 * scale
                      
                      // Fire starts from dragon's mouth and goes downward toward ground level
                      const fireStartX = dragonX - 150 * scale // Moved to the left even more
                      const fireStartY = dragonY + 150 * scale // Much lower position (moved down a lot)
                      const GROUND_LEVEL = getGroundLevel(viewportHeight)
                      const groundScreenY = GROUND_LEVEL - cameraY
                      const fireEndY = groundScreenY
                      
                      // Fire animation - pulsing
                      const firePulse = Math.sin(time * 10) * 0.2
                      const fireLength = Math.abs(fireEndY - fireStartY) + firePulse * 20
                      const fireCenterY = fireStartY + fireLength / 2
                      
                      if (fireTexture) {
                        // Calculate scale to stretch fire to reach ground
                        const baseFireScale = selectedFire.scale || 0.5
                        const fireTextureHeight = fireTexture.height || 400 // Default height if not available
                        const verticalScale = fireLength / fireTextureHeight // Scale to match fire length
                        
                        // Rotate fire back 30 degrees (convert to radians: 30 * PI / 180)
                        const fireRotation = -30 * (Math.PI / 180)
                        
                        return (
                          <Sprite
                            key={`dragon-fire-${index}`}
                            texture={fireTexture}
                            x={fireStartX}
                            y={fireStartY}
                            anchor={{ x: 0.5, y: 0 }} // Anchor at top center
                            scale={{ x: baseFireScale * scale, y: verticalScale * baseFireScale * scale }}
                            rotation={fireRotation} // Rotate back 30 degrees
                          />
                        )
                      } else {
                        return (
                    <Graphics key={`dragon-fire-${index}`} draw={(g) => drawDragonFire(g, castle, time)} />
                        )
                      }
                    })()}
                  </>
                )}
              </>
            )
          })}
          
          {/* Princesses (saved from the dragon) */}
          {princesses.map((princess, index) => {
            const time = performance.now() / 1000 // Time in seconds for animation
            const cameraX = cameraRef.current?.x || 0
            const cameraY = cameraRef.current?.y || 0
            const screenX = princess.x - cameraX
            const scale = princess.scale || 1
            
            // Calculate ground level position for proper placement
            const GROUND_LEVEL = getGroundLevel(viewportHeight)
            const groundScreenY = GROUND_LEVEL - cameraY
            
            // Only render if visible on screen
            if (screenX < -100 || screenX > viewportWidth + 100) return null
            
            // Use image sprite if available, otherwise fall back to drawn princess
            const princessTexture = selectedPrincess && princessTextures[selectedPrincess.id]
            
            // Enhanced princess animation - happy, expressive movement
            // Vertical bobbing (happy bounce)
            const princessBob = Math.sin(time * 2.5) * 3
            // Horizontal sway (dancing/swaying)
            const princessSway = Math.sin(time * 1.8) * 2
            // Rotation (gentle tilt, like dancing)
            const princessRotation = Math.sin(time * 2) * 0.05 // ~3 degrees max
            // Scale pulse (excited breathing)
            const princessScalePulse = 1 + Math.sin(time * 3) * 0.03 // 3% scale variation
            
            if (princessTexture) {
              return (
                <Sprite
                  key={`princess-${index}`}
                  texture={princessTexture}
                  x={screenX + princessSway}
                  y={groundScreenY + princessBob} // Position at ground level with bobbing animation
                  anchor={{ x: 0.5, y: 1 }} // Anchor at bottom center so princess sits on ground
                  scale={(selectedPrincess.scale || 0.3) * scale * princessScalePulse}
                  rotation={princessRotation}
                />
              )
            } else {
            return (
              <Graphics
                key={`princess-${index}`}
                draw={(g) => drawPrincess(g, princess, time)}
              />
            )
            }
          })}
          
          {/* Clouds in the sky */}
          {clouds.map((cloud, index) => (
            <Graphics
              key={`cloud-${index}`}
              draw={(g) => drawCloud(g, cloud)}
            />
          ))}
          
          {/* Programmatic birds flying around */}
          {birds.map((bird, index) => {
            const time = performance.now() / 1000 // Time in seconds for animation
            return (
              <Graphics
                key={`bird-${index}`}
                draw={(g) => drawBird(g, bird, time)}
              />
            )
          })}
          
          {/* Image-based birds flying around */}
          {imageBirds.map((bird, index) => {
            if (!bird.isImage || !birdTextures[bird.birdImageId]) return null
            
            const time = performance.now() / 1000 // Time in seconds for animation
            const cameraX = cameraRef.current?.x || 0
            const cameraY = cameraRef.current?.y || 0
            
            // Birds have parallax movement (fly slower than camera for depth effect)
            const parallaxOffset = cameraX * 0.3 // Birds move slower than camera
            const screenX = bird.x - parallaxOffset
            const screenY = bird.y - cameraY
            
            // Animate bird with bobbing motion
            const bobAmount = Math.sin(time * bird.speed + bird.animationOffset) * 5
            const animatedY = screenY + bobAmount
            
            // Only draw if visible on screen
            if (screenX < -100 || screenX > viewportWidth + 100) return null
            if (animatedY < -100 || animatedY > viewportHeight + 100) return null
            
            const texture = birdTextures[bird.birdImageId]
            if (!texture || !texture.valid) return null
            
            return (
              <Sprite
                key={`image-bird-${index}`}
                texture={texture}
                x={screenX}
                y={animatedY}
                scale={bird.scale}
                anchor={{ x: 0.5, y: 0.5 }}
              />
            )
          })}
          
          {/* Left Wall - Switch Superhero */}
          {startWallXRef.current !== null && (() => {
            const wallX = startWallXRef.current
            const WALL_WIDTH = 50
            const GROUND_LEVEL = getGroundLevel(viewportHeight)
            const cameraX = cameraRef.current?.x || 0
            const cameraY = cameraRef.current?.y || 0
            const screenX = wallX - cameraX
            const screenY = GROUND_LEVEL - cameraY
            const wallHeight = viewportHeight - (GROUND_LEVEL - cameraY)
            
            // Only render if visible on screen
            if (screenX + WALL_WIDTH < 0 || screenX > viewportWidth) return null
            
            return (
              <Graphics
                key="left-wall"
                draw={(g) => {
                  g.clear()
                  // Wall shadow
                  g.beginFill(0x000000, 0.2)
                  g.drawRect(screenX + 3, screenY + 3, WALL_WIDTH, wallHeight)
                  g.endFill()
                  
                  // Main wall (distinctive color to indicate it's interactive)
                  g.beginFill(0x8B6A4A) // Brown/tan color
                  g.drawRect(screenX, screenY, WALL_WIDTH, wallHeight)
                  g.endFill()
                  
                  // Wall outline
                  g.lineStyle(2, 0x6B4A2A, 0.9)
                  g.drawRect(screenX, screenY, WALL_WIDTH, wallHeight)
                  g.lineStyle(0)
                  
                  // Decorative pattern to indicate it's special
                  g.lineStyle(1, 0xD4A574, 0.6)
                  for (let i = 0; i < 5; i++) {
                    const y = screenY + (wallHeight / 6) * (i + 1)
                    g.moveTo(screenX + 5, y)
                    g.lineTo(screenX + WALL_WIDTH - 5, y)
                  }
                  g.lineStyle(0)
                }}
              />
            )
          })()}
          
          {/* Superhero Image Sprite */}
          {player && selectedSuperhero && (() => {
            const time = performance.now() / 1000 // Time in seconds for animation
            const position = getSuperheroPosition(time)
            
            if (!position) return null
            
            const texture = superheroTextures[selectedSuperhero.id]
            
            // Determine target facing direction and rotation based on scroll or player movement
            let targetFacingLeft = false
            let targetRotation = 0 // Rotation for up/down tilt
            
            if (scrollInput && scrollInput.isScrolling()) {
              const scrollVel = scrollInput.getScrollVelocity()
              // Negative velocity = scrolling left, positive = scrolling right
              targetFacingLeft = scrollVel < 0
              
              // Add rotation based on scroll velocity (tilt up/down)
              // Positive scroll (down/forward) = tilt down (positive rotation)
              // Negative scroll (up/backward) = tilt up (negative rotation)
              // Use a smaller tilt angle for subtle effect (15 degrees max)
              const maxTiltDegrees = 15
              const tiltAmount = scrollVel * maxTiltDegrees
              targetRotation = (tiltAmount * Math.PI) / 180 // Convert to radians
            } else if (player.velocityX !== 0) {
              // Fallback to player velocity if not scrolling
              targetFacingLeft = player.velocityX < 0
              targetRotation = 0
            } else {
              targetRotation = 0
            }
            
            // Smooth interpolation for rotation (lerp)
            const rotationLerpSpeed = 0.15 // How fast rotation changes (0-1, lower = smoother)
            const currentRotation = superheroRotationRef.current
            const rotationDiff = targetRotation - currentRotation
            superheroRotationRef.current = currentRotation + rotationDiff * rotationLerpSpeed
            
            // Smooth facing direction change (prevent instant flip)
            if (targetFacingLeft !== superheroFacingLeftRef.current) {
              // Only change facing direction if there's significant movement
              if (Math.abs(player.velocityX) > 0.1 || (scrollInput && scrollInput.isScrolling())) {
                superheroFacingLeftRef.current = targetFacingLeft
              }
            }
            
            const facingLeft = superheroFacingLeftRef.current
            const rotation = superheroRotationRef.current
            
            // Add subtle bobbing animation when moving
            const isMoving = (scrollInput && scrollInput.isScrolling()) || Math.abs(player.velocityX) > 0.1
            const bobAmount = isMoving ? Math.sin(time * 8) * 2 : 0 // Subtle vertical bob
            const bobY = position.y + bobAmount
            
            // Subtle scale variation when moving (slight squash and stretch effect)
            const baseScale = selectedSuperhero.scale || 0.5
            const scaleVariation = isMoving ? 1 + Math.sin(time * 12) * 0.03 : 1 // 3% variation
            const scaleX = (facingLeft ? -baseScale : baseScale) * scaleVariation
            const scaleY = baseScale * scaleVariation
            
            // If texture is loaded, render the sprite
            if (texture) {
            return (
              <>
                  {/* Shadow with rotation-aware positioning */}
                  <Graphics 
                    key="superhero-shadow"
                    draw={(g) => {
                      g.clear()
                      // Shadow position adjusts slightly based on rotation
                      const shadowOffsetX = Math.sin(rotation) * 3
                      const shadowOffsetY = Math.abs(Math.cos(rotation)) * 2
                      g.beginFill(0x000000, 0.2)
                      // Slightly elongated shadow when rotated
                      const shadowWidth = 18 + Math.abs(rotation) * 5
                      const shadowHeight = 12 - Math.abs(rotation) * 2
                      g.drawEllipse(position.x + 2 + shadowOffsetX, position.y + 2 + shadowOffsetY, shadowWidth, shadowHeight)
                      g.endFill()
                    }} 
                  />
                  {/* Superhero Sprite */}
                  <Sprite
                    key="superhero-sprite"
                    texture={texture}
                    x={position.x}
                    y={bobY}
                    anchor={0.5}
                    scale={{ x: scaleX, y: scaleY }}
                    rotation={rotation}
                  />
                </>
              )
            }
            
            // Show placeholder when texture is not loaded (for debugging)
            return (
              <Graphics 
                key="superhero-placeholder"
                draw={(g) => {
                  g.clear()
                  g.beginFill(0xFF0000, 0.7)
                  g.drawCircle(position.x, position.y, 25)
                  g.endFill()
                  g.beginFill(0xFFFFFF, 1)
                  g.drawCircle(position.x, position.y, 20)
                  g.endFill()
                  g.beginFill(0xFF0000, 1)
                  g.drawCircle(position.x, position.y, 15)
                  g.endFill()
                }} 
              />
            )
          })()}
          
          {/* Fireworks */}
          {questComplete && fireworks.length > 0 && (
            <Graphics
              key="fireworks"
              draw={drawFireworks}
            />
          )}
          
          {/* Section information text - positioned at center, only show current section (rendered first so it appears behind other messages) */}
          {currentSection && currentSection.id !== 'beginning' && !(questComplete && currentSection.id === 'contact') && (() => {
            const section = currentSection
            
            // Position at center of screen
            const hudWidth = 250 // Approximate HUD width including padding
            const hudPadding = 20
            // Center horizontally, but make panel narrower to avoid HUD overlap
            const panelWidth = Math.max(400, Math.min(viewportWidth * 0.65, 750)) // Narrower to avoid HUD
            const screenX = (viewportWidth - panelWidth) / 2 // Center the panel
            const screenY = Math.max(80, viewportHeight * 0.12) // Position from top
            
            const textPadding = Math.max(25, viewportWidth * 0.03) // Responsive padding for sides and top
            const textWidth = panelWidth - (textPadding * 2)
            
            // Responsive font sizes (smaller for more compact display)
            const titleFontSize = Math.max(18, Math.min(viewportWidth * 0.028, 28))
            const contentFontSize = Math.max(12, Math.min(viewportWidth * 0.016, 18))
            const titleHeight = titleFontSize + Math.max(8, viewportWidth * 0.012)
            const titleY = textPadding // Start after padding
            const spacing = Math.max(12, viewportHeight * 0.025) // Responsive spacing
            const contentY = titleY + titleHeight + spacing
            
            // Calculate content height for background panel (no extra spacing at bottom)
            const contentText = getSectionContent(section, portfolioData)
            const estimatedLines = contentText.split('\n').length + Math.ceil(contentText.length / (textWidth / (contentFontSize * 0.6)))
            const contentHeight = estimatedLines * (contentFontSize * 1.4) // Removed extra spacing
            const panelHeight = contentY + contentHeight // No bottom padding - fit exactly to content
            
            // Fixed position at center (UI element, not world element)
            return (
              <Container key={`section-text-${section.id}`} x={screenX} y={screenY}>
                {/* Background panel with notebook-style appearance */}
                <Graphics
                  draw={(g) => {
                    g.clear()
                    
                    // Paper shadow
                    g.beginFill(0x000000, 0.15)
                    g.drawRoundedRect(3, 3, panelWidth, panelHeight, 8)
                    g.endFill()
                    
                    // Cream/paper background
                    g.beginFill(0xFFF8E7, 0.92) // Cream color with slight transparency
                    g.drawRoundedRect(0, 0, panelWidth, panelHeight, 8)
                    g.endFill()
                    
                    // Notebook-style border (red margin line on left)
                    g.lineStyle(3, 0xDC143C, 0.8) // Red margin line
                    g.moveTo(0, 0)
                    g.lineTo(0, panelHeight)
                    g.lineStyle(0)
                    
                    // Blue notebook lines (subtle horizontal lines)
                    g.lineStyle(1, 0x4169E1, 0.3) // Blue lines
                    const lineSpacing = contentFontSize * 1.4
                    const linesEndY = contentY + contentHeight // Stop exactly at content end
                    for (let y = contentY; y < linesEndY; y += lineSpacing) {
                      g.moveTo(textPadding, y)
                      g.lineTo(panelWidth - textPadding, y)
                    }
                    g.lineStyle(0)
                    
                    // Border (notebook paper edge)
                    g.lineStyle(2, 0x8B7355, 0.6) // Brown paper edge
                    g.drawRoundedRect(0, 0, panelWidth, panelHeight, 8)
                    g.lineStyle(0)
                  }}
                />
                
                {/* Section title - positioned at the top, centered */}
                <Text
                  text={section.name}
                  x={panelWidth / 2}
                  y={titleY}
                  anchor={{ x: 0.5, y: 0 }}
                  style={{
                    fontFamily: 'Georgia, serif', // More elegant serif font
                    fontSize: titleFontSize,
                    fill: 0xDC143C, // Red color matching notebook margin
                    align: 'center',
                    fontWeight: 'bold',
                    stroke: 0xFFFFFF,
                    strokeThickness: Math.max(2, Math.floor(viewportWidth / 250)),
                    letterSpacing: 1,
                    dropShadow: true,
                    dropShadowColor: 0x000000,
                    dropShadowBlur: 2,
                    dropShadowAngle: Math.PI / 4,
                    dropShadowDistance: 1
                  }}
                />
                
                {/* Section content - positioned below the title with padding, left-aligned */}
                <Text
                  text={contentText}
                  x={textPadding}
                  y={contentY}
                  anchor={{ x: 0, y: 0 }}
                  style={{
                    fontFamily: 'Georgia, serif', // More elegant serif font
                    fontSize: contentFontSize,
                    fill: 0x2C2C2C, // Dark gray/black for readability
                    align: 'left',
                    wordWrap: true,
                    wordWrapWidth: textWidth,
                    lineHeight: contentFontSize * 1.4, // Better line spacing
                    letterSpacing: 0.3,
                    dropShadow: false // No shadow for body text, better readability
                  }}
                />
              </Container>
            )
          })()}
          
          {/* Quest Complete Message */}
          {questComplete && (
            <Container>
              {/* Background box for better visibility */}
              <Graphics
                draw={(g) => {
                  g.clear()
                  const boxWidth = Math.max(400, Math.min(viewportWidth * 0.7, 800))
                  const boxHeight = Math.max(150, Math.min(viewportHeight * 0.25, 250))
                  const boxX = (viewportWidth - boxWidth) / 2
                  const boxY = (viewportHeight - boxHeight) / 2
                  
                  // Draw semi-transparent dark background
                  g.beginFill(0x000000, 0.75)
                  g.drawRoundedRect(boxX, boxY, boxWidth, boxHeight, 15)
                  g.endFill()
                  
                  // Draw border
                  g.lineStyle(3, 0xFFD700, 1)
                  g.drawRoundedRect(boxX, boxY, boxWidth, boxHeight, 15)
                  g.lineStyle(0)
                }}
              />
              <Text
                text="QUEST COMPLETE!"
                style={{
                  fontFamily: 'Arial',
                  fontSize: Math.max(32, Math.min(viewportWidth * 0.06, 64)),
                  fill: 0xFFD700,
                  fontWeight: 'bold',
                  stroke: 0x000000,
                  strokeThickness: Math.max(2, Math.floor(viewportWidth / 200)),
                  align: 'center',
                  dropShadow: true,
                  dropShadowColor: 0x000000,
                  dropShadowBlur: Math.max(5, viewportWidth / 100),
                  dropShadowAngle: Math.PI / 4,
                  dropShadowDistance: Math.max(3, viewportWidth / 200),
                }}
                x={viewportWidth / 2}
                y={viewportHeight / 2 - Math.max(20, viewportHeight * 0.04)} // Centered with spacing
                anchor={{ x: 0.5, y: 0.5 }}
              />
              <Text
                text="Congratulations!"
                style={{
                  fontFamily: 'Arial',
                  fontSize: Math.max(20, Math.min(viewportWidth * 0.04, 48)),
                  fill: 0xFFFFFF,
                  fontWeight: 'bold',
                  stroke: 0x000000,
                  strokeThickness: Math.max(2, Math.floor(viewportWidth / 250)),
                  align: 'center',
                }}
                x={viewportWidth / 2}
                y={viewportHeight / 2 + Math.max(30, viewportHeight * 0.08)} // Centered with spacing
                anchor={{ x: 0.5, y: 0.5 }}
              />
              <Text
                text="Press SPACE to view portfolio"
                style={{
                  fontFamily: 'Arial',
                  fontSize: Math.max(16, Math.min(viewportWidth * 0.03, 32)),
                  fill: 0xFFD700,
                  fontWeight: 'bold',
                  stroke: 0x000000,
                  strokeThickness: Math.max(2, Math.floor(viewportWidth / 300)),
                  align: 'center',
                  dropShadow: true,
                  dropShadowColor: 0x000000,
                  dropShadowBlur: Math.max(3, viewportWidth / 200),
                  dropShadowAngle: Math.PI / 4,
                  dropShadowDistance: Math.max(2, viewportWidth / 300),
                }}
                x={viewportWidth / 2}
                y={viewportHeight / 2 + Math.max(70, viewportHeight * 0.15)} // Below congratulations
                anchor={{ x: 0.5, y: 0.5 }}
              />
            </Container>
          )}
          
          {/* Click Castle Message - shown after player is pushed back, but not if dragon is killed */}
          {showClickCastleMessage && player && !isDragonKilled && (
            <Container>
              {/* Background box for better visibility */}
              <Graphics
                draw={(g) => {
                  g.clear()
                  const boxWidth = Math.max(350, Math.min(viewportWidth * 0.6, 700))
                  const boxHeight = Math.max(120, Math.min(viewportHeight * 0.2, 200))
                  const boxX = (viewportWidth - boxWidth) / 2
                  const boxY = (viewportHeight - boxHeight) / 2
                  
                  // Draw semi-transparent dark background
                  g.beginFill(0x000000, 0.75)
                  g.drawRoundedRect(boxX, boxY, boxWidth, boxHeight, 15)
                  g.endFill()
                  
                  // Draw border
                  g.lineStyle(3, 0xFF6B6B, 1)
                  g.drawRoundedRect(boxX, boxY, boxWidth, boxHeight, 15)
                  g.lineStyle(0)
                }}
              />
              <Text
                text="Press SPACE"
                style={{
                  fontFamily: 'Arial',
                  fontSize: Math.max(24, Math.min(viewportWidth * 0.045, 54)),
                  fill: 0xFF6B6B,
                  fontWeight: 'bold',
                  stroke: 0x000000,
                  strokeThickness: Math.max(2, Math.floor(viewportWidth / 200)),
                  align: 'center',
                  dropShadow: true,
                  dropShadowColor: 0x000000,
                  dropShadowBlur: Math.max(4, viewportWidth / 150),
                  dropShadowAngle: Math.PI / 4,
                  dropShadowDistance: Math.max(2, viewportWidth / 250),
                }}
                x={viewportWidth / 2}
                y={viewportHeight / 2 - Math.max(15, viewportHeight * 0.03)} // Centered with spacing
                anchor={{ x: 0.5, y: 0.5 }}
              />
              <Text
                text="to defeat the dragon!"
                style={{
                  fontFamily: 'Arial',
                  fontSize: Math.max(16, Math.min(viewportWidth * 0.03, 36)),
                  fill: 0xFFFFFF,
                  fontWeight: 'bold',
                  stroke: 0x000000,
                  strokeThickness: Math.max(2, Math.floor(viewportWidth / 250)),
                  align: 'center',
                  dropShadow: true,
                  dropShadowColor: 0x000000,
                  dropShadowBlur: Math.max(3, viewportWidth / 200),
                  dropShadowAngle: Math.PI / 4,
                  dropShadowDistance: Math.max(2, viewportWidth / 300),
                }}
                x={viewportWidth / 2}
                y={viewportHeight / 2 + Math.max(25, viewportHeight * 0.06)} // Centered with spacing
                anchor={{ x: 0.5, y: 0.5 }}
              />
            </Container>
          )}
        </Container>
      </Stage>
    </div>
  )
}
