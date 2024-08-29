export class AudioController {
    private static instance: AudioController;
    private backgroundMusic: HTMLAudioElement | null = null;
    private soundEffects: { [key: string]: HTMLAudioElement } = {};

    private constructor() {}

    public static getInstance(): AudioController {
        if (!AudioController.instance) {
            AudioController.instance = new AudioController();
        }
        return AudioController.instance;
    }

    public setMusic(src: any): void {
        console.log('setMusic -> src:', src)

        const musicSrc = src.default || src;

        console.log('setMusic -> musicSrc:', musicSrc)

        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
        this.backgroundMusic = new Audio(musicSrc);
        this.backgroundMusic.loop = true;

        this.backgroundMusic.addEventListener('error', (event) => {
            console.error(`Error loading audio source: ${musicSrc}`, event);
        });
    }

    public playMusic(): void {
        if (this.backgroundMusic) {
            this.backgroundMusic.play().catch(error => {
                console.error('Error playing background music:', error);
            });
        }
    }

    public pauseMusic(): void {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
    }

    public stopMusic(): void {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }

    public addSoundEffect(key: string, src: string): void {
        const soundEffect = new Audio(src);
        soundEffect.addEventListener('error', (event) => {
            console.error(`Error loading sound effect source: ${src}`, event);
        });
        this.soundEffects[key] = soundEffect;
    }

    public playSoundEffect(key: string): void {
        const soundEffect = this.soundEffects[key];
        if (soundEffect) {
            soundEffect.currentTime = 0;
            soundEffect.play().catch(error => {
                console.error(`Error playing sound effect ${key}:`, error);
            });
        }
    }
}
