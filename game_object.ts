import { Game } from "./game.js"
import { Point, Press } from "./utils.js"

export class GameObject {
    game: Game

    constructor(game: Game) {
        this.game = game
    }

    kill() {
        let index = this.game.objects.indexOf(this)
        if (index >= 0)
            this.game.objects.splice(index, 1)
    }

    update(delta: number) {
    }

    draw() {
    }
}

export class RoundGameObject extends GameObject{
    pos: Point
    radius: number
    color: string
    pressed: Press
    dying: boolean
    deathProgress: number

    constructor(game: Game, pos: Point, radius: number, color: string) {
        super(game)
        this.pos = pos
        this.radius = radius
        this.color = color
        this.pressed = Press.NoPress
        this.dying = false
        this.deathProgress = 0
    }

    draw() {
        this.game.ctx.fillStyle = this.color
        this.game.ctx.beginPath()
        this.game.ctx.ellipse(this.pos.x, this.pos.y, this.radius, this.radius, 0, 0, 2 * Math.PI)
        this.game.ctx.fill()
    }

    touch(other: RoundGameObject) : boolean {
        return (this.radius + other.radius) >= ((this.pos.x - other.pos.x)**2 + (this.pos.y - other.pos.y)**2) ** 0.5
    }
}
