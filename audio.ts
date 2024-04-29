export {}
export class AudioEffects {
    static audioScream: HTMLAudioElement = this.addAudioElement('deathscream.wav')
    static audioMonsterDie: HTMLAudioElement = this.addAudioElement('monsterdie.wav')
    static audioFailure: HTMLAudioElement = this.addAudioElement('failure.mp3')


    static addAudioElement(path: string): HTMLAudioElement{
        let e = document.createElement('audio')
        e.src = path
        e.setAttribute('preload', 'auto')
        e.setAttribute('controls', 'none')
        e.volume = 0.5
        e.style.display = 'none'
        document.body.appendChild(e)
        return e
    }
}