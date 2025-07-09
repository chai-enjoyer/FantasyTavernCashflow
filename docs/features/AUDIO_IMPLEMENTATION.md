# Audio Implementation Guide

## 🎯 Current Audio Service Integration Points

### Already Implemented in Code

1. **AudioService.ts** methods that need sounds:
   ```typescript
   playSound('buttonClick')        // UI clicks
   playSound('cardFlip')          // New card appears
   playMoneyChange(amount)        // Coins based on amount
   playNPCSound(emotion)          // NPC reactions
   playSpecialSound(npcClass)     // Character entrance
   ```

2. **GameCard.tsx**:
   - `audio.playSound('cardFlip')` - When new card appears
   - `audio.playSpecialSound(npc.class)` - NPC entrance sound

3. **ChoiceButton.tsx**:
   - `audio.playSound('buttonClick')` - On choice selection

4. **ResultScreen.tsx**:
   - `audio.playMoneyChange(moneyChange)` - Money gain/loss
   - `audio.playNPCSound(choice.npcEmotion)` - NPC reaction

## 🔊 Detailed Sound Descriptions

### Money Sounds Breakdown
```
coins_gain_small (< 100g):
- 2-3 gold coins dropping onto wood
- Bright, metallic tinkle
- Duration: 0.3s

coins_gain_medium (100-1000g):
- 5-8 coins cascading
- Fuller, richer sound
- Small pouch landing
- Duration: 0.5s

coins_gain_large (> 1000g):
- Heavy leather pouch hitting table
- Multiple coins spilling
- Deep, satisfying thud
- Duration: 0.8s
```

### NPC Entrance Sounds
```
noble_enter:
- Trumpet flourish (subtle)
- Silk rustling
- Confident footsteps on wood

criminal_enter:
- Minor key sting
- Creaking floorboard
- Knife unsheathing (subtle)

mage_enter:
- Magical chime cascade
- Sparkle effect
- Whispering wind

dragon_enter:
- Deep bass rumble
- Ancient presence
- Echoing roar (distant)
```

## 🎼 Music Layering System

### Tavern Ambient Layers
```
Base Layer (always playing):
- Fireplace crackling
- Distant conversation murmur
- Occasional mug clink

Activity Layer (based on reputation):
- Low Rep: Sparse, few patrons
- Med Rep: Moderate activity
- High Rep: Bustling, lively

Instrument Layer:
- Low Rep: Solo lute
- Med Rep: Add fiddle
- High Rep: Full ensemble

Time Layer:
- Day: Brighter tones
- Evening: Warmer, cozier
- Night: Mysterious undertones
```

## 🎚️ Dynamic Audio Parameters

### Volume Ducking Logic
```javascript
// When important sound plays:
1. Duck music to 40% over 0.2s
2. Play important sound at 100%
3. Return music to 60% over 0.5s

// Priority levels:
- Critical: Game over, bankruptcy warning
- High: Money changes, NPC reactions  
- Medium: UI sounds, card flips
- Low: Ambient layers
```

### Adaptive Music Triggers
```javascript
// Switch to tension_theme when:
- Criminal NPC appears
- Player money < 500g
- Risk > 70%

// Switch to celebration_theme when:
- Gain > 5000g in one turn
- Noble gives positive reaction
- Reputation milestone reached

// Return to tavern_ambient after:
- 2 turns of normal play
- Risk returns to normal
- Tension event resolves
```

## 🎤 NPC Voice Guidelines

### Emotion Mapping
```
Positive Emotions:
- happy: Warm laughter, pleased hum
- grateful: Relieved sigh, "thank you" murmur
- impressed: Appreciative whistle

Negative Emotions:
- angry: Growl, scoff, door slam
- disappointed: Heavy sigh, tutting
- threatening: Low chuckle, blade sound

Neutral Emotions:
- neutral: Thoughtful "hmm"
- considering: Tongue click
- indifferent: Slight grunt
```

### Character Voice Characteristics
```
Commoner: 
- Rough, earthy tones
- Simple expressions
- Working-class accent hints

Adventurer:
- Confident, bold
- Slight echo (helmet?)
- Weapon/armor sounds

Noble:
- Refined, haughty
- Measured speech
- Jewelry tinkling

Criminal:
- Gravelly, suspicious
- Whispered threats
- Coin flipping sound

Cleric:
- Peaceful, warm
- Slight reverb (temple echo)
- Prayer beads clicking

Mage:
- Ethereal quality
- Magical resonance
- Crystal chiming

Dragon:
- Deep, ancient
- Rumbling undertone
- Smoke/fire crackling
```

## 🛠️ Technical Implementation

### Web Audio API Setup
```javascript
class AudioManager {
  constructor() {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.musicGain = this.context.createGain();
    this.sfxGain = this.context.createGain();
    
    // Compression for consistent volume
    this.compressor = this.context.createDynamicsCompressor();
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 30;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;
  }
}
```

### Sound Pool System
```javascript
// Prevent audio cutting off
class SoundPool {
  constructor(audioBuffer, poolSize = 3) {
    this.buffer = audioBuffer;
    this.pool = [];
    this.currentIndex = 0;
    
    for (let i = 0; i < poolSize; i++) {
      this.pool.push(this.createSource());
    }
  }
  
  play() {
    const source = this.pool[this.currentIndex];
    source.start(0);
    this.currentIndex = (this.currentIndex + 1) % this.pool.length;
  }
}
```

### Mobile Audio Tricks
```javascript
// iOS audio unlock
document.addEventListener('touchstart', () => {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}, { once: true });

// Preload critical sounds
const criticalSounds = [
  'button_click',
  'coins_gain_small',
  'card_flip'
];

// Load on user interaction
async function preloadCritical() {
  for (const sound of criticalSounds) {
    await audioService.preload(sound);
  }
}
```

## 📱 File Size Optimization

### Compression Settings
```
Music files (MP3):
- Bitrate: 128 kbps (mobile) / 192 kbps (desktop)
- Mono/Stereo: Stereo for music, mono for SFX
- Sample rate: 44.1 kHz

Sound effects (OGG):
- Quality: 6 (out of 10)
- Channels: Mono for UI, stereo for ambience
- Trim silence, normalize peaks

Total size targets:
- Core pack: < 5MB
- Full pack: < 20MB
- Premium pack: < 50MB
```

## 🎵 Free Asset Sources

### Recommended Sources
1. **Freesound.org** - CC licensed sounds
2. **OpenGameArt.org** - Game-specific audio
3. **Incompetech.com** - Royalty-free music
4. **Zapsplat.com** - Free with account

### Search Keywords
- "medieval tavern ambience"
- "gold coins wooden table"
- "parchment paper flip"
- "fantasy UI sounds"
- "medieval fanfare"
- "dragon roar distant"

### Asset Processing
1. Normalize all sounds to -3dB peak
2. Add subtle room reverb to dry sounds
3. EQ cut below 80Hz for mobile
4. Compress dynamic range for consistency
5. Export in multiple formats