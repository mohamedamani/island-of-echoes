import { useEffect, useRef, useCallback, useState } from 'react';

interface AudioState {
  isNight: boolean;
  playerHealth: number;
  sanity: number;
  isUnderAttack: boolean;
}

export const useGameAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const sfxGainRef = useRef<GainNode | null>(null);
  
  const dayAmbientRef = useRef<OscillatorNode[]>([]);
  const nightAmbientRef = useRef<OscillatorNode[]>([]);
  const musicOscillatorsRef = useRef<OscillatorNode[]>([]);
  
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const currentStateRef = useRef<AudioState>({
    isNight: false,
    playerHealth: 100,
    sanity: 100,
    isUnderAttack: false
  });

  // Initialize Audio Context
  const initAudio = useCallback(() => {
    if (audioContextRef.current) return;
    
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioContextRef.current;
    
    // Create gain nodes
    masterGainRef.current = ctx.createGain();
    ambientGainRef.current = ctx.createGain();
    musicGainRef.current = ctx.createGain();
    sfxGainRef.current = ctx.createGain();
    
    // Connect nodes
    ambientGainRef.current.connect(masterGainRef.current);
    musicGainRef.current.connect(masterGainRef.current);
    sfxGainRef.current.connect(masterGainRef.current);
    masterGainRef.current.connect(ctx.destination);
    
    // Set initial volumes
    masterGainRef.current.gain.value = volume;
    ambientGainRef.current.gain.value = 0.3;
    musicGainRef.current.gain.value = 0.2;
    sfxGainRef.current.gain.value = 0.5;
  }, [volume]);

  // Create wind sound (filtered noise)
  const createWindSound = useCallback((isNight: boolean) => {
    const ctx = audioContextRef.current;
    if (!ctx || !ambientGainRef.current) return;

    // Create noise using oscillators for wind effect
    const oscillators: OscillatorNode[] = [];
    
    // Multiple detuned oscillators for richer wind
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = 'sawtooth';
      osc.frequency.value = isNight ? 80 + i * 20 : 120 + i * 30;
      
      filter.type = 'lowpass';
      filter.frequency.value = isNight ? 200 : 400;
      filter.Q.value = 1;
      
      gain.gain.value = 0.02;
      
      // Add LFO for wind movement
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.1 + Math.random() * 0.2;
      lfoGain.gain.value = isNight ? 30 : 50;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ambientGainRef.current);
      
      osc.start();
      oscillators.push(osc);
    }
    
    return oscillators;
  }, []);

  // Create cricket/night sounds
  const createNightSounds = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx || !ambientGainRef.current) return;

    const oscillators: OscillatorNode[] = [];
    
    // Cricket sounds - high frequency chirps
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = 4000 + i * 500;
      
      // Modulate gain for chirping effect
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 5 + Math.random() * 3;
      lfoGain.gain.value = 0.01;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();
      
      gain.gain.value = 0.005;
      
      osc.connect(gain);
      gain.connect(ambientGainRef.current);
      
      osc.start();
      oscillators.push(osc);
    }
    
    // Owl-like low frequency
    const owlOsc = ctx.createOscillator();
    const owlGain = ctx.createGain();
    owlOsc.type = 'sine';
    owlOsc.frequency.value = 300;
    owlGain.gain.value = 0.008;
    
    const owlLfo = ctx.createOscillator();
    const owlLfoGain = ctx.createGain();
    owlLfo.frequency.value = 0.3;
    owlLfoGain.gain.value = 0.005;
    owlLfo.connect(owlLfoGain);
    owlLfoGain.connect(owlGain.gain);
    owlLfo.start();
    
    owlOsc.connect(owlGain);
    owlGain.connect(ambientGainRef.current);
    owlOsc.start();
    oscillators.push(owlOsc);
    
    return oscillators;
  }, []);

  // Create day bird sounds
  const createDaySounds = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx || !ambientGainRef.current) return;

    const oscillators: OscillatorNode[] = [];
    
    // Bird chirps - frequency modulated sine waves
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = 1500 + i * 300;
      
      // Frequency modulation for bird-like sound
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 8 + Math.random() * 4;
      lfoGain.gain.value = 200;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      
      // Amplitude modulation for intermittent chirps
      const ampLfo = ctx.createOscillator();
      const ampLfoGain = ctx.createGain();
      ampLfo.frequency.value = 0.5 + Math.random() * 0.5;
      ampLfoGain.gain.value = 0.008;
      ampLfo.connect(ampLfoGain);
      ampLfoGain.connect(gain.gain);
      ampLfo.start();
      
      gain.gain.value = 0.005;
      
      osc.connect(gain);
      gain.connect(ambientGainRef.current);
      
      osc.start();
      oscillators.push(osc);
    }
    
    return oscillators;
  }, []);

  // Create scary background music
  const createMusic = useCallback((isNight: boolean, sanity: number) => {
    const ctx = audioContextRef.current;
    if (!ctx || !musicGainRef.current) return;

    const oscillators: OscillatorNode[] = [];
    
    // Base drone
    const baseFreq = isNight ? 55 : 65; // A1 or C2
    const drone = ctx.createOscillator();
    const droneGain = ctx.createGain();
    const droneFilter = ctx.createBiquadFilter();
    
    drone.type = 'sawtooth';
    drone.frequency.value = baseFreq;
    
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = isNight ? 150 : 200;
    
    droneGain.gain.value = 0.05;
    
    // Add subtle vibrato
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibrato.frequency.value = isNight ? 0.5 : 0.3;
    vibratoGain.gain.value = isNight ? 3 : 1;
    vibrato.connect(vibratoGain);
    vibratoGain.connect(drone.frequency);
    vibrato.start();
    
    drone.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(musicGainRef.current);
    drone.start();
    oscillators.push(drone);
    
    // Dissonant harmonics for tension
    const dissonance = isNight ? [1.5, 2.1, 3.2] : [1.5, 2, 3];
    dissonance.forEach((mult, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = baseFreq * mult;
      
      filter.type = 'lowpass';
      filter.frequency.value = 300;
      
      gain.gain.value = 0.02 * (1 - i * 0.2);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(musicGainRef.current);
      osc.start();
      oscillators.push(osc);
    });
    
    // Low sanity = more dissonant, scary sounds
    if (sanity < 50) {
      const scaryOsc = ctx.createOscillator();
      const scaryGain = ctx.createGain();
      
      scaryOsc.type = 'sawtooth';
      scaryOsc.frequency.value = baseFreq * 0.5;
      
      const scaryLfo = ctx.createOscillator();
      const scaryLfoGain = ctx.createGain();
      scaryLfo.frequency.value = 0.1;
      scaryLfoGain.gain.value = 10;
      scaryLfo.connect(scaryLfoGain);
      scaryLfoGain.connect(scaryOsc.frequency);
      scaryLfo.start();
      
      scaryGain.gain.value = 0.03 * (1 - sanity / 100);
      
      scaryOsc.connect(scaryGain);
      scaryGain.connect(musicGainRef.current);
      scaryOsc.start();
      oscillators.push(scaryOsc);
    }
    
    return oscillators;
  }, []);

  // Stop all oscillators in an array
  const stopOscillators = useCallback((oscillators: OscillatorNode[]) => {
    oscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Already stopped
      }
    });
  }, []);

  // Update ambient sounds based on state
  const updateAmbient = useCallback((isNight: boolean) => {
    stopOscillators(dayAmbientRef.current);
    stopOscillators(nightAmbientRef.current);
    
    const windOscs = createWindSound(isNight) || [];
    
    if (isNight) {
      const nightOscs = createNightSounds() || [];
      nightAmbientRef.current = [...windOscs, ...nightOscs];
      dayAmbientRef.current = [];
    } else {
      const dayOscs = createDaySounds() || [];
      dayAmbientRef.current = [...windOscs, ...dayOscs];
      nightAmbientRef.current = [];
    }
  }, [createWindSound, createNightSounds, createDaySounds, stopOscillators]);

  // Update music based on state
  const updateMusic = useCallback((isNight: boolean, sanity: number) => {
    stopOscillators(musicOscillatorsRef.current);
    musicOscillatorsRef.current = createMusic(isNight, sanity) || [];
  }, [createMusic, stopOscillators]);

  // Play sound effect
  const playSFX = useCallback((type: 'attack' | 'hit' | 'collect' | 'enemy_growl' | 'footstep' | 'craft' | 'build' | 'death') => {
    const ctx = audioContextRef.current;
    if (!ctx || !sfxGainRef.current || isMuted) return;

    const now = ctx.currentTime;
    
    switch (type) {
      case 'attack': {
        // Whoosh sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.2);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGainRef.current);
        
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
      
      case 'hit': {
        // Impact sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.connect(gain);
        gain.connect(sfxGainRef.current);
        
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      
      case 'collect': {
        // Pickup sound - pleasant ding
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(1200, now + 0.05);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc.connect(gain);
        gain.connect(sfxGainRef.current);
        
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      
      case 'enemy_growl': {
        // Growl - low frequency noise
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.setValueAtTime(60, now + 0.3);
        osc.frequency.setValueAtTime(90, now + 0.5);
        
        filter.type = 'lowpass';
        filter.frequency.value = 300;
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.setValueAtTime(0.4, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGainRef.current);
        
        osc.start(now);
        osc.stop(now + 0.6);
        break;
      }
      
      case 'footstep': {
        // Soft thud
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);
        
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        osc.connect(gain);
        gain.connect(sfxGainRef.current);
        
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }
      
      case 'craft': {
        // Crafting sound - metallic
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(600 + i * 200, now + i * 0.1);
          
          gain.gain.setValueAtTime(0.15, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.1);
          
          osc.connect(gain);
          gain.connect(sfxGainRef.current);
          
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.1);
        }
        break;
      }
      
      case 'build': {
        // Building sound - hammer hits
        for (let i = 0; i < 2; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'square';
          osc.frequency.setValueAtTime(200, now + i * 0.15);
          osc.frequency.exponentialRampToValueAtTime(80, now + i * 0.15 + 0.1);
          
          gain.gain.setValueAtTime(0.25, now + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.12);
          
          osc.connect(gain);
          gain.connect(sfxGainRef.current);
          
          osc.start(now + i * 0.15);
          osc.stop(now + i * 0.15 + 0.12);
        }
        break;
      }
      
      case 'death': {
        // Death sound - dramatic low
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 1);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 1);
        
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGainRef.current);
        
        osc.start(now);
        osc.stop(now + 1.5);
        break;
      }
    }
  }, [isMuted]);

  // Update all audio based on game state
  const updateAudioState = useCallback((state: AudioState) => {
    if (!audioContextRef.current) {
      initAudio();
    }
    
    const prev = currentStateRef.current;
    
    // Update ambient if night status changed
    if (prev.isNight !== state.isNight) {
      updateAmbient(state.isNight);
      updateMusic(state.isNight, state.sanity);
    }
    
    // Update music if sanity changed significantly
    if (Math.abs(prev.sanity - state.sanity) > 10) {
      updateMusic(state.isNight, state.sanity);
    }
    
    currentStateRef.current = state;
  }, [initAudio, updateAmbient, updateMusic]);

  // Start audio (must be called from user interaction)
  const startAudio = useCallback(() => {
    initAudio();
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    updateAmbient(currentStateRef.current.isNight);
    updateMusic(currentStateRef.current.isNight, currentStateRef.current.sanity);
  }, [initAudio, updateAmbient, updateMusic]);

  // Stop all audio
  const stopAudio = useCallback(() => {
    stopOscillators(dayAmbientRef.current);
    stopOscillators(nightAmbientRef.current);
    stopOscillators(musicOscillatorsRef.current);
    dayAmbientRef.current = [];
    nightAmbientRef.current = [];
    musicOscillatorsRef.current = [];
  }, [stopOscillators]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (masterGainRef.current) {
        masterGainRef.current.gain.value = newMuted ? 0 : volume;
      }
      return newMuted;
    });
  }, [volume]);

  // Set volume
  const setMasterVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (masterGainRef.current && !isMuted) {
      masterGainRef.current.gain.value = newVolume;
    }
  }, [isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAudio]);

  return {
    startAudio,
    stopAudio,
    updateAudioState,
    playSFX,
    toggleMute,
    setMasterVolume,
    isMuted,
    volume
  };
};
