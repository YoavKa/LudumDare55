import { Game } from "./game.js";
import { Monster } from "./monster.js";
import { Point, Press } from "./utils.js";
import { SUMMON_POWER, TIME_UNTIL_VULNERABILITY } from "./consts.js";
import { RoundGameObject } from "./game_object.js";
import { Water } from "./water.js";
import { Boundary } from "./boundary.js";
import { AudioEffects } from "./audio.js";

const image = document.getElementById("wizard") as HTMLImageElement

export class Wizard extends RoundGameObject {
    direction: number
    msToChangeDir: number
    isPulled: boolean
    timeUntilVulnerablity: number
    haloPhase: number

    constructor(game: Game, pos: Point, timeUntilVulnerablity: number) {
        super(game, pos, 30, "green")
        this.direction = Math.random() * Math.PI * 2
        this.msToChangeDir = Math.random() * 1000
        this.isPulled = false
        this.timeUntilVulnerablity = timeUntilVulnerablity
        this.haloPhase = 0
    }

    move(delta: Point, avoidWater: boolean) {
        let oldPos = this.pos
        this.pos = this.pos.add(delta)

        if (avoidWater && this.game.boundary.touch(this)) {
            this.pos = oldPos
            return false
        }

        for (let obj of this.game.objects) {
            if (obj === this)
                continue
            if (obj instanceof Wizard || (avoidWater && obj instanceof Water)) {
                if (obj.touch(this)) {
                    this.pos = oldPos
                    return false
                }
            }
        }
        return true
    }

    walkRandomly(dt: number) {
        if (this.isPulled) {
            this.isPulled = false
            return
        }
        let directionVector = new Point(Math.cos(this.direction), Math.sin(this.direction))
        let moved = this.move(directionVector.scale(dt/50), true)
        if (!moved) {
            this.direction = Math.random() * Math.PI * 2
        } else {
            this.msToChangeDir -= dt
            if (this.msToChangeDir < 0) {
                this.msToChangeDir = Math.random() * 2000
                this.direction = Math.random() * Math.PI * 2
            }
        }
    }

    summon(dt: number, polarity: number) {
        let toAffect = []

        for (let obj of this.game.objects) {
            if (obj === this)
                continue
            if ((obj instanceof Wizard && obj.timeUntilVulnerablity < 0) || obj instanceof Monster) {
                toAffect.push(obj)
                obj.isPulled = true
            }
        }

        for (let obj of toAffect) {
            let towards = this.pos.sub(obj.pos)
            if (towards.norm() < this.radius + obj.radius)
                continue
            towards = towards.scale(1/towards.norm())
            if (obj instanceof Wizard) {
                let step = towards.scale(polarity * dt * SUMMON_POWER/4)

                // Try moving in the requested direction
                let moved = obj.move(step, false)
                if (!moved && obj.pos.distance(this.pos) > this.radius * 2.1) {
                    // Didn't work and we're still far. Try to move closer in some direction
                    for (let angle = 0; angle < Math.PI*0.4; angle += 0.1) {
                        if (obj.move(step.rotate(angle), true))
                            break
                        if (obj.move(step.rotate(-angle), true))
                            break
                    }
                }
            } else
                obj.pos = obj.pos.add(towards.scale(polarity * dt * SUMMON_POWER))
        }
    }

    update(dt: number): void {
        this.timeUntilVulnerablity -= dt
        if (this.timeUntilVulnerablity > 0) {
            return
        }
        if (this.dying) {
            this.deathProgress += dt/500
            if (this.deathProgress > 1)
                this.kill()
            return
        }
        if (this.pressed === Press.NoPress) {
            this.walkRandomly(dt)
        } else if (this.pressed == Press.LeftPress) {
            this.summon(dt, 1)
        } else {
            this.summon(dt, -1)
        }

        if (this.pressed != Press.NoPress) {
            this.haloPhase += dt/600
        } else {
            this.haloPhase = 0
        }
    }

    spawn_new_wizard() {
        var new_wizard = new Wizard(this.game, new Point(0, 0), TIME_UNTIL_VULNERABILITY)
        while (true) {
            let boundaryDistance = 30 + this.radius
            var x = Math.floor(Math.random() * (this.game.boundary.X_MAX - this.game.boundary.X_MIN - 2 * boundaryDistance) + this.game.boundary.X_MIN)
            var y = Math.floor(Math.random() * (this.game.boundary.Y_MAX - this.game.boundary.Y_MIN - 2 * boundaryDistance) + this.game.boundary.Y_MIN)
            var pos = new Point(x, y)
            new_wizard.pos = pos
            var far_from_all = true
            this.game.objects.forEach(obj => {
                if (obj instanceof Monster || obj instanceof Water) {
                    if (obj.pos.distance(pos) < 100) {
                        far_from_all = false
                        return
                    }
                }
                if (obj instanceof Boundary || obj instanceof Wizard) {
                    if (obj.touch(new_wizard))
                        far_from_all = false
                    return
                }
            });
            if (far_from_all) {
                this.game.addObject(new_wizard)
                break
            }
        }
        return
    }

    die() {
        if (this.timeUntilVulnerablity > 0)
            return
        if (this.dying)
            return
        AudioEffects.audioScream.currentTime = 0
        AudioEffects.audioScream.play()
        this.dying = true
        if (this.game.lives > 0) {
            this.game.lives--
            if (this.game.lives > 0)
                this.spawn_new_wizard()
        }
    }

    draw(): void {
        const haloSize = 20
        let gradient = this.game.ctx.createRadialGradient(this.pos.x, this.pos.y, this.radius * 0.7,
                                                          this.pos.x, this.pos.y, this.radius + haloSize)
        let alpha

        if (this.haloPhase > Math.PI / 2)
            alpha = (Math.sin(this.haloPhase) ** 2) * 0.4 + 0.6
        else
            alpha = (Math.sin(this.haloPhase) ** 2)

        let color
        if (this.pressed === Press.LeftPress) {
            color = "8,102,226"
        } else {
            color = "224,117,6"
        }

        gradient.addColorStop(0, `rgba(${color},${alpha})`)
        gradient.addColorStop(1, `rgba(${color},0)`)

        this.game.ctx.fillStyle = gradient
        this.game.ctx.beginPath()
        this.game.ctx.ellipse(this.pos.x, this.pos.y, this.radius + haloSize, this.radius + haloSize, 0, 0, Math.PI * 2)
        this.game.ctx.fill()

        alpha = 1
        if (this.timeUntilVulnerablity > 0) {
            alpha = Math.sin(this.timeUntilVulnerablity / 150) *0.4 + 0.6
        }
        this.game.ctx.globalAlpha = alpha
        let size = this.radius * (1 - this.deathProgress)
        this.game.ctx.drawImage(image, this.pos.x - size, this.pos.y - size, size * 2, size * 2)
        this.game.ctx.globalAlpha = 1
    }
}