import './TouchControls.scss'

export default function TouchControls({ onTouchStart, onTouchEnd }) {
  return (
    <div className="touch-controls">
      <div className="touch-controls__movement">
        <button
          className="touch-controls__button touch-controls__button--left"
          onTouchStart={() => onTouchStart('left')}
          onTouchEnd={() => onTouchEnd('left')}
          onMouseDown={() => onTouchStart('left')}
          onMouseUp={() => onTouchEnd('left')}
          onMouseLeave={() => onTouchEnd('left')}
          aria-label="Move left"
        >
          ←
        </button>
        <button
          className="touch-controls__button touch-controls__button--right"
          onTouchStart={() => onTouchStart('right')}
          onTouchEnd={() => onTouchEnd('right')}
          onMouseDown={() => onTouchStart('right')}
          onMouseUp={() => onTouchEnd('right')}
          onMouseLeave={() => onTouchEnd('right')}
          aria-label="Move right"
        >
          →
        </button>
      </div>
    </div>
  )
}

