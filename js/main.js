// Array to store active audio elements
let activeAudios = [];

// Track which monsters have already played their sounds
const playedMonsters = new Set();

// Audio file mapping for each monster
const monsterSounds = {
    'monster-bowgart': 'Bowgart_1.MP3',
    'monster-tweedle': 'tweedle.mp3',
    'monster-congle': 'congle.mp3',
    'monster-viveine': 'viveine.mp3',
    'monster-deedge': 'deedge.mp3',
    'monster-xyster': 'xyster.mp3',
    'monster-dwumrohl': 'dwumrohl.mp3',
    'monster-entbrat': 'entbrat.mp3',
    'monster-maw': 'maw.mp3',
    'monster-thrumble': 'thrumble.mp3'
};

// Store original positions of monsters
const originalPositions = {};

// Initialize the drag and drop functionality with improved right-side handling
function initDragAndDrop() {
    const monsters = document.querySelectorAll('.monster-item');
    
    monsters.forEach(monster => {
        // Store original position
        originalPositions[monster.id] = {
            position: monster.style.position,
            left: monster.style.left,
            top: monster.style.top,
            zIndex: monster.style.zIndex
        };
        
        // Make each monster draggable
        monster.setAttribute('draggable', 'true');
        
        // Event listeners for drag operations
        monster.addEventListener('dragstart', handleDragStart);
        monster.addEventListener('dragend', handleDragEnd);
        
        // Make monster interact with mouse for non-standard dragging
        monster.addEventListener('mousedown', handleMouseDown);
    });
    
    // Add event listeners to the document for free-form dragging
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

// Variables to track dragging state
let isDragging = false;
let currentMonster = null;
let offsetX, offsetY;

// Handle the start of dragging a monster
function handleDragStart(e) {
    this.style.opacity = '0.7';
    this.setAttribute('data-dragging', 'true');
}

// Handle the end of standard dragging
function handleDragEnd(e) {
    this.style.opacity = '1';
    
    // Play sound when monster is repositioned (only on drop)
    if (this.getAttribute('data-dragging') === 'true') {
        playMonsterSound(this.id);
        this.removeAttribute('data-dragging');
    }
}

// Handle mouse down for improved drag handling
function handleMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    
    isDragging = true;
    currentMonster = e.target;
    
    // Mark that dragging has started
    currentMonster.setAttribute('data-dragging', 'true');
    
    // Calculate the mouse position relative to the viewport
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Get the current position and dimensions of the monster
    const rect = currentMonster.getBoundingClientRect();
    
    // Calculate offsets (where the mouse is relative to the monster)
    offsetX = mouseX - rect.left;
    offsetY = mouseY - rect.top;
    
    // Force the monster to use absolute positioning from the document body
    document.body.appendChild(currentMonster);
    currentMonster.style.position = 'absolute';
    currentMonster.style.zIndex = '9999';
    currentMonster.style.right = 'auto'; // Clear any 'right' positioning
    
    // Set initial position to maintain same visual location
    currentMonster.style.left = rect.left + 'px';
    currentMonster.style.top = rect.top + 'px';
}

// Handle mouse movement with improved tracking
function handleMouseMove(e) {
    if (!isDragging || !currentMonster) return;
    
    // Calculate new position based on mouse movement
    let newLeft = e.clientX - offsetX;
    let newTop = e.clientY - offsetY;
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Get current dimensions of the monster
    const width = currentMonster.offsetWidth;
    const height = currentMonster.offsetHeight;
    
    // Constrain to viewport
    if (newLeft < 0) newLeft = 0;
    if (newTop < 0) newTop = 0;
    if (newLeft + width > viewportWidth) newLeft = viewportWidth - width;
    if (newTop + height > viewportHeight) newTop = viewportHeight - height;
    
    // Move the monster
    currentMonster.style.left = newLeft + 'px';
    currentMonster.style.top = newTop + 'px';
}

// Improved handleMouseUp function to ensure elements remain visible
function handleMouseUp(e) {
    if (!isDragging || !currentMonster) return;
    
    isDragging = false;
    
    // Play sound for the monster that was dragged
    if (currentMonster.getAttribute('data-dragging') === 'true') {
        playMonsterSound(currentMonster.id);
        
        // Keep the data-dragging attribute temporarily to maintain styling
        // We'll remove it after repositioning
    }
    
    // Get the current position in the viewport
    const currentRect = currentMonster.getBoundingClientRect();
    const currentX = currentRect.left;
    const currentY = currentRect.top;
    
    // Determine which side container to return the monster to
    const monsterId = currentMonster.id;
    let targetContainer;
    
    if (monsterId.includes('bowgart') || 
        monsterId.includes('tweedle') || 
        monsterId.includes('congle') || 
        monsterId.includes('viveine') || 
        monsterId.includes('maw')) {
        targetContainer = document.querySelector('.left-monsters');
    } else {
        targetContainer = document.querySelector('.right-monsters');
    }
    
    // Return to appropriate container and maintain position
    if (targetContainer) {
        // Add to container
        targetContainer.appendChild(currentMonster);
        
        // Keep absolute positioning to maintain dragged location
        currentMonster.style.position = 'absolute';
        
        // Convert viewport position to position relative to new parent
        const containerRect = targetContainer.getBoundingClientRect();
        const newLeft = currentX - containerRect.left;
        const newTop = currentY - containerRect.top;
        
        // Apply new position
        currentMonster.style.left = newLeft + 'px';
        currentMonster.style.top = newTop + 'px';
        currentMonster.style.right = 'auto'; // Clear right positioning
        currentMonster.style.bottom = 'auto'; // Clear bottom positioning
        
        // Keep elevated z-index to ensure visibility
        currentMonster.style.zIndex = '100';
        
        // Now it's safe to remove the dragging attribute
        setTimeout(() => {
            currentMonster.removeAttribute('data-dragging');
        }, 10);
    }
    
    // Reset the current monster reference
    currentMonster = null;
}

// Play the sound associated with a monster (modified function)
function playMonsterSound(monsterId) {
    // Check if monster has already been played and if we have a sound for it
    if (!playedMonsters.has(monsterId) && monsterSounds[monsterId]) {
        // Create a new audio element
        const audio = new Audio(`audio/${monsterSounds[monsterId]}`);
        
        // Set it to loop
        audio.loop = true;
        
        // Play the audio
        audio.play()
            .then(() => {
                // Add to active audios array
                activeAudios.push({
                    monsterId: monsterId,
                    audio: audio
                });
                
                // Mark this monster as played
                playedMonsters.add(monsterId);
            })
            .catch(error => {
                console.error('Audio playback failed:', error);
            });
    }
}

// Update the stopAllAudio function for complete reset
function stopAllAudio() {
    // Stop all audio
    activeAudios.forEach(item => {
        item.audio.pause();
        item.audio.currentTime = 0;
    });
    activeAudios = [];
    
    // Clear the played monsters set
    playedMonsters.clear();
    
    // Get all containers
    const leftContainer = document.querySelector('.left-monsters');
    const rightContainer = document.querySelector('.right-monsters');
    
    // Return all monsters to original containers and positions
    document.querySelectorAll('.monster-item').forEach(monster => {
        // Clear all positioning styles
        monster.style.position = '';
        monster.style.left = '';
        monster.style.top = '';
        monster.style.right = '';
        monster.style.bottom = '';
        monster.style.zIndex = '';
        monster.style.width = '';
        monster.style.height = '';
        monster.removeAttribute('data-dragging');
        
        // Return to appropriate container
        const monsterId = monster.id;
        if (monsterId.includes('bowgart') || 
            monsterId.includes('tweedle') || 
            monsterId.includes('congle') || 
            monsterId.includes('viveine') || 
            monsterId.includes('maw')) {
            leftContainer.appendChild(monster);
        } else {
            rightContainer.appendChild(monster);
        }
    });
}

// Modify the toggleMute function to also provide visual feedback
function toggleMute() {
    const muted = activeAudios.length > 0 ? activeAudios[0].audio.muted : false;
    activeAudios.forEach(item => {
        item.audio.muted = !muted;
    });
    
    // Optional: Change the speaker icon based on mute state
    const speakerBtn = document.getElementById('speaker-icon');
    if (speakerBtn) {
        if (!muted) {
            // Change to muted icon or add a class
            speakerBtn.classList.add('muted');
        } else {
            // Change back to unmuted icon or remove class
            speakerBtn.classList.remove('muted');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initDragAndDrop();
    
    // Setup control buttons
    const playBtn = document.getElementById('play-icon');
    const pauseBtn = document.getElementById('pause-icon');
    const speakerBtn = document.getElementById('speaker-icon');
    const refreshBtn = document.getElementById('refresh-icon');
    
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            activeAudios.forEach(item => item.audio.play());
        });
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            activeAudios.forEach(item => item.audio.pause());
        });
    }
    
    if (speakerBtn) {
        speakerBtn.addEventListener('click', toggleMute);
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', stopAllAudio);
    }
});
