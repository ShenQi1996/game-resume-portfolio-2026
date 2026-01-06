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
      <div className="touch-controls__actions">
        <button
          className="touch-controls__button touch-controls__button--jump"
          onTouchStart={() => onTouchStart('jump')}
          onTouchEnd={() => onTouchEnd('jump')}
          onMouseDown={() => onTouchStart('jump')}
          onMouseUp={() => onTouchEnd('jump')}
          onMouseLeave={() => onTouchEnd('jump')}
          aria-label="Jump"
        >
          ↑
        </button>
        <button
          className="touch-controls__button touch-controls__button--interact"
          onTouchStart={() => onTouchStart('interact')}
          onTouchEnd={() => onTouchEnd('interact')}
          onMouseDown={() => onTouchStart('interact')}
          onMouseUp={() => onTouchEnd('interact')}
          onMouseLeave={() => onTouchEnd('interact')}
          aria-label="Interact"
        >
          E
        </button>
      </div>
    </div>
  )
}

