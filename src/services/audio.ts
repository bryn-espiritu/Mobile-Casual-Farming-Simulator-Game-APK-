class SoundService {
  private ctx: AudioContext | null = null;
  public sfxMuted: boolean = false;
  public ambientMuted: boolean = false;
  private ambientTimer: number | null = null;
  private isAmbientPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public ensureUnlocked() {
    this.initCtx();
  }

  // Soft wooden tap
  public playTap() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Audio fallback silent
    }
  }

  // Soft earth hoe / plow sound
  public playPlow() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // ignore
    }
  }

  // Gentle seed flutter pop
  public playPlant() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // ignore
    }
  }

  // Water droplet splash
  public playWater() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.09);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // ignore
    }
  }

  // Juicy sparkling harvest arpeggio (kalimba / acoustic bell)
  public playHarvest() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.05;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.14, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch {
      // ignore
    }
  }

  // Cheerful coin collection chime
  public playCoin() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const gain2 = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now); // B5
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      gain2.gain.setValueAtTime(0.18, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.28);
    } catch {
      // ignore
    }
  }

  // Animal petting affection sound
  public playAnimalPet(type: string = 'cow') {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (type === 'chicken') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.linearRampToValueAtTime(520, now + 0.05);
        osc.frequency.linearRampToValueAtTime(480, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      } else if (type === 'cow') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(130, now + 0.35);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      } else if (type === 'sheep') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(300, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      } else {
        // Dog/Cat purr/chirp
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.18);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // ignore
    }
  }

  // Level up fanfare
  public playLevelUp() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const chord = [392, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.6);
      });
    } catch {
      // ignore
    }
  }

  // Season change windchime
  public playSeasonChange() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 830.61, 987.77, 1318.51];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.1;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.8);
      });
    } catch {
      // ignore
    }
  }

  // Generative relaxing acoustic ambient background music
  public startAmbient() {
    if (this.isAmbientPlaying) return;
    this.isAmbientPlaying = true;
    this.playNextAmbientChord();
  }

  public stopAmbient() {
    this.isAmbientPlaying = false;
    if (this.ambientTimer) {
      window.clearTimeout(this.ambientTimer);
      this.ambientTimer = null;
    }
  }

  private chordIndex = 0;
  private playNextAmbientChord = () => {
    if (!this.isAmbientPlaying) return;

    if (!this.ambientMuted && this.ctx && this.ctx.state === 'running') {
      try {
        // Peaceful folk progression in E Major: E -> B/D# -> C#m7 -> Aadd9
        const progressions = [
          [164.81, 246.94, 329.63, 392.0], // E maj
          [185.00, 246.94, 293.66, 369.99], // B inv
          [138.59, 207.65, 246.94, 329.63], // C#m7
          [110.00, 220.00, 277.18, 329.63], // A
        ];

        const notes = progressions[this.chordIndex % progressions.length];
        this.chordIndex++;

        const now = this.ctx.currentTime;
        notes.forEach((freq, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const noteTime = now + i * 0.15;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, noteTime);

          // Very quiet, peaceful background wash
          gain.gain.setValueAtTime(0.025, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 2.8);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(noteTime);
          osc.stop(noteTime + 3.0);
        });
      } catch {
        // silent
      }
    }

    // Next chord in 3.5 seconds
    this.ambientTimer = window.setTimeout(this.playNextAmbientChord, 3600);
  };
}

export const sound = new SoundService();
