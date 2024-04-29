import { AudioEffects } from "./audio.js"
import { Boundary } from "./boundary.js"
import { MAX_LIVES, TIME_FACTOR, TIME_UNTIL_FIRST, TIME_UNTIL_GAME_OVER } from "./consts.js"
import { GameObject, RoundGameObject } from "./game_object.js"
import { Monster } from "./monster.js"
import { Point, Press } from "./utils.js"
import { Water } from "./water.js"
import { Wizard } from "./wizard.js"

enum GameMode {
    OPENING,
    GAME,
    GAME_OVER,
  }

export class Game {
    ctx: CanvasRenderingContext2D
    width: number
    height: number
    objects: Array<GameObject>
    mouseState: MouseState
    score: number
    lives: number
    hud: Hud
    boundary: Boundary
    last_monster_created: number
    time_until_next: number
    gameOver: GameOver
    openingScreen: OpeningScreen
    mode: GameMode

    constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
        this.ctx = ctx
        this.score = 0
        this.lives = MAX_LIVES
        this.width = width
        this.height = height
        this.objects = Array<GameObject>()
        this.mouseState = new MouseState()
        this.hud = new Hud(this)
        this.boundary = new Boundary(this)
        this.last_monster_created = Date.now()
        this.time_until_next = TIME_UNTIL_FIRST
        this.gameOver = new GameOver(this)
        this.openingScreen = new OpeningScreen(this)
        this.mode = GameMode.OPENING
    }

    start() {
        this.score = 0
        this.lives = MAX_LIVES
        this.time_until_next = TIME_UNTIL_FIRST
        
        this.mode = GameMode.GAME
        this.objects = []
        
        this.addObject(this.boundary)
        this.addObject(new Water(this, new Point(this.width / 2, this.height * 0.3)))
        this.addObject(new Water(this, new Point(this.width / 3, this.height * 0.7)))
        this.addObject(new Water(this, new Point(this.width * 2 / 3, this.height * 0.7)))
    
        this.addObject(new Wizard(this, new Point(this.width / 3, this.height / 3), 0))
        this.addObject(new Wizard(this, new Point(this.width * 2 / 3, this.height / 3), 0))
        this.addObject(new Wizard(this, new Point(this.width / 2, this.height * 2 / 3), 0))

        this.create_new_monster();
    }

    addObject(object: GameObject) {
        this.objects.push(object)
    }

    draw() {
        if (this.mode === GameMode.OPENING) {

            this.openingScreen.draw()
            return
        }

        this.objects.forEach(object => {
            this.ctx.save()
            object.draw()
            this.ctx.restore()
        })
        this.ctx.save()
        this.hud.draw()
        this.ctx.restore()

        if (this.mode === GameMode.GAME_OVER) {
            this.ctx.save()
            this.gameOver.draw()
            this.ctx.restore()
        }
    }

    update(delta: number) {
        if (this.lives === 0 && this.mode != GameMode.GAME_OVER) {
            AudioEffects.audioScream.pause()
            AudioEffects.audioMonsterDie.pause()
            AudioEffects.audioFailure.currentTime = 0
            AudioEffects.audioFailure.play()
            this.mode = GameMode.GAME_OVER
            this.gameOver.update(delta)
            return
        }

        if (this.mode === GameMode.GAME_OVER) {
            this.gameOver.update(delta)
        }

        let mousePress = this.mouseState.getPress()

        if (mousePress != Press.NoPress) {
            if (this.mode === GameMode.OPENING){
                this.start()
                return 
            }
            if (this.mode === GameMode.GAME_OVER && this.gameOver.timeUntilGameOver < 0){
                this.gameOver.timeUntilGameOver = TIME_UNTIL_GAME_OVER
                this.start()
                return 
            }
        }

        if (this.mode === GameMode.GAME_OVER) {
            return
        }

        //////////////note: everything from here doesn't happen in game over

        this.objects.slice().reverse().forEach(object => {
            if (object instanceof RoundGameObject) {
                if (object.pos.distance(this.mouseState.pos) <= object.radius) {
                    object.pressed = mousePress
                    mousePress = Press.NoPress
                } else {
                    object.pressed = Press.NoPress
                }
            }
        })

        this.objects.forEach(object => {
            object.update(delta)
        })

        this.hud.update(delta)
        if (Date.now() - this.last_monster_created > this.time_until_next) {
            this.create_new_monster()
            this.last_monster_created = Date.now()
            this.time_until_next *= TIME_FACTOR
            if (this.time_until_next < 1000)
                this.time_until_next = 1000
        }
    }

    
    create_new_monster() {
        var new_monster = new Monster(this, new Point(0, 0))
        while (true) {
            var x = Math.floor(Math.random() * this.width)
            var y = Math.floor(Math.random() * this.height)
            var pos = new Point(x, y)
            new_monster.pos = pos
            var far_from_all = true
            this.objects.forEach(obj => {
                if (obj instanceof Wizard && !obj.dying) {
                    if (obj.pos.distance(pos) < 150) {
                        far_from_all = false
                        return
                    }
                }
                if (obj instanceof Water || obj instanceof Boundary) {
                    if (obj.touch(new_monster))
                        far_from_all = false
                    return
                }
            });
            if (far_from_all) {
                this.addObject(new_monster)
                break
            }
        }
        return
    }
}

export class Hud {
    game: Game
    image: HTMLImageElement

    constructor(game: Game) {
        this.image = document.getElementById("heart") as HTMLImageElement
        this.game = game
    }

    update(delta: number) {
        this.game.score += delta / 1000
    }

    draw() {
        let ctx = this.game.ctx
        ctx.font = '30px MyFont'
        ctx.fillStyle = 'white'
        ctx.textAlign = 'left'
        ctx.fillText("Score: " + Math.floor(this.game.score).toString().padStart(4), this.game.width / 2 - 50, 50)

        for (let i = 0; i < this.game.lives; i++) {
            ctx.drawImage(this.image, 10 + i*60, 10, 50, 50)
        }
    } 
}

export class GameOver {
    game: Game
    timeUntilGameOver: number

    constructor(game: Game) {
        this.game = game
        this.timeUntilGameOver = TIME_UNTIL_GAME_OVER
    }

    update(delta: number) {
        this.timeUntilGameOver -= delta
    }

    draw() {
        let ctx = this.game.ctx

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        let width = this.game.width
        let height = this.game.height
        ctx.fillRect(this.game.width / 2 - width / 2, this.game.height / 2 - height / 2, width, height)

        ctx.shadowColor = 'black'; // Shadow color
        ctx.shadowOffsetX = 1; // Horizontal shadow offset
        ctx.shadowOffsetY = 1; // Vertical shadow offset
        ctx.shadowBlur = 1; // Blur amount

        ctx.font = '100px MyFont'
        ctx.fillStyle = 'white'
        ctx.textAlign = 'center'
        ctx.fillText("Game Over :(", this.game.width / 2, this.game.height / 2 - 30)

        if (this.timeUntilGameOver <= 0){
            ctx.font = '50px MyFont'
            ctx.fillStyle = 'white'
            ctx.textAlign = 'center'
            ctx.fillText("Press anywhere on the", this.game.width / 2, this.game.height / 2 + 30)
            ctx.fillText("screen to restart", this.game.width / 2, this.game.height / 2 + 80)
        }
    }
}

export class OpeningScreen {
    game: Game
    image: HTMLImageElement

    constructor(game: Game) {
        this.game = game
        this.image = document.getElementById("instructions") as HTMLImageElement
    }

    update(delta: number) {

    }

    draw() {
        let ctx = this.game.ctx
        this.game.ctx.drawImage(this.image, 0, 0)
    }
}

export class MouseState {
    pos: Point
    pressHistory: Array<Press>

    constructor() {
        this.pos = new Point(0, 0)
        this.pressHistory = new Array<Press>()
    }

    onMouseDown(pos: Point, press: Press) {
        this.pos = pos
        this.pressHistory.push(press)
    }

    onMouseUp(pos: Point, press: Press) {
        this.pos = pos
        this.pressHistory.splice(this.pressHistory.lastIndexOf(press), 1)
    }

    onMouseMove(pos: Point) {
        this.pos = pos
    }

    getPress() {
        if (this.pressHistory.length > 0)
            return this.pressHistory[this.pressHistory.length - 1]
        else
            return Press.NoPress
    }
}