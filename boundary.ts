import { SCREEN_HEIGHT, SCREEN_WIDTH } from "./consts.js";
import { GameObject, RoundGameObject } from "./game_object.js";
import { Monster } from "./monster.js";
import { Point } from "./utils.js";
import { Wizard } from "./wizard.js";

export class Boundary extends GameObject {
    SPIKE_HEIGHT = 20
    SPIKE_SPACING = 20

    X_MIN = this.SPIKE_HEIGHT
    X_MAX = SCREEN_WIDTH - this.SPIKE_HEIGHT
    Y_MIN = this.SPIKE_HEIGHT
    Y_MAX = SCREEN_HEIGHT - this.SPIKE_HEIGHT
    WIDTH = 10

    draw(): void {
        this.game.ctx.fillStyle = "#8080ff"

        let xCount = Math.round(SCREEN_WIDTH / this.SPIKE_SPACING)
        let yCount = Math.round(SCREEN_HEIGHT / this.SPIKE_SPACING)

        let p00 = new Point(0, 0)
        let p01 = new Point(0, SCREEN_HEIGHT)
        let p10 = new Point(SCREEN_WIDTH, 0)
        let p11 = new Point(SCREEN_WIDTH, SCREEN_HEIGHT)

        this.drawSpikes(p00, p10, xCount)
        this.drawSpikes(p11, p01, xCount)
        this.drawSpikes(p01, p00, yCount)
        this.drawSpikes(p10, p11, yCount)
    }

    drawSpikes(from: Point, to: Point, count: number): void {
        const SPIKE_WIDTH = 10
        const SPIKE_HEIGHT = this.X_MIN

        let spikeStep = to.sub(from).norm() / (count - 1)
        let baseDir = to.sub(from).normalized()
        let spikeDir = baseDir.rotate(Math.PI / 2)

        this.game.ctx.fillStyle = "rgb(167,180,186)"
        this.game.ctx.strokeStyle = "black"
        this.game.ctx.beginPath()

        for (let i = 1; i < count - 1; i++) {
            let base = from.add(baseDir.scale(i * spikeStep))
            let p1 = base.sub(baseDir.scale(SPIKE_WIDTH / 2))
            let p2 = base.add(baseDir.scale(SPIKE_WIDTH / 2))
            let p3 = base.add(spikeDir.scale(SPIKE_HEIGHT))

            this.game.ctx.moveTo(p1.x, p1.y)
            this.game.ctx.lineTo(p2.x, p2.y)
            this.game.ctx.lineTo(p3.x, p3.y)
            this.game.ctx.closePath()
        }

        this.game.ctx.fill()
        this.game.ctx.stroke()
    }

    touch(other: RoundGameObject) {
        if (other.pos.x - other.radius < this.X_MIN)
            return true

        if (other.pos.y - other.radius < this.Y_MIN)
            return true

        if (other.pos.x + other.radius > this.X_MAX)
            return true

        if (other.pos.y + other.radius > this.Y_MAX)
            return true

        return false
    }

    update(delta: number): void {
        for (let obj of this.game.objects) {
            if (obj instanceof Wizard || obj instanceof Monster) {
                if (this.touch(obj))
                    obj.die()
            }
        }
    }
}