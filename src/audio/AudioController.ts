export class AudioController {
    private static instance: AudioController;
    private backgroundMusic: HTMLAudioElement | null = null;
    // 누름 한 번을 기다리는 중인가. 여럿이 겹쳐 기다리지 않게 든다.
    private waitingForGesture = false;
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

    // 이 화면의 음악으로 바꿔 걸고 튼다. **화면이 보여질 때 부른다.**
    //
    // 전에는 화면이 만들어질 때 걸었다. 화면은 한 번만 만들어지므로, 다른 화면에 갔다
    // 돌아오면 음악이 다시 걸리지도 틀리지도 않았다 (R2-134).
    //
    // 브라우저는 사용자가 한 번이라도 누르기 전에는 소리를 못 내게 막는다. 첫 화면은
    // 누른 적이 없는 상태로 뜨므로 그때는 막힌다. 막히면 **다음 누름 한 번을 기다려**
    // 다시 튼다. 그 기다림을 화면마다 두지 않고 여기 한 곳에 둔다.
    //
    // 기다리는 사이에 다른 화면으로 가면 그 화면이 제 음악을 걸어 둔다. 그래서 누름이
    // 왔을 때 지금 걸려 있는 것을 튼다 — 기다리기 시작할 때의 것이 아니다.
    public playForScreen(src: unknown): void {
        this.setMusic(src);

        const music = this.backgroundMusic;
        if (!music) return;

        music.play().catch(() => {
            if (this.waitingForGesture) return;
            this.waitingForGesture = true;
            window.addEventListener('click', () => {
                this.waitingForGesture = false;
                this.playMusic();
            }, {once: true});
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
