import { Game } from "./game.js";
import { RoundGameObject } from "./game_object.js";
import { MONSTER_KILL_SCORE, MONSTER_VELOCITY } from "./consts.js";
import { Point } from "./utils.js";
import {Wizard} from "./wizard.js"
import { AudioEffects } from "./audio.js";

export class Monster extends RoundGameObject {
    public circle_phase = 0;
    private static CIRCLE_PHASE_NORM = 0.006;
    private static CIRCULAR_MOVEMENT_NORM = 0.35
    isPulled: boolean
    direction: number

    constructor(game: Game, pos: Point) {
        super(game, pos, 30, "red");
        this.isPulled = false
        this.direction = 0
    }

    draw(): void {
        this.game.ctx.save()
        this.game.ctx.translate(this.pos.x, this.pos.y)
        this.game.ctx.rotate(this.direction + Math.PI / 2)
        this.game.ctx.scale(1 - this.deathProgress, 1 - this.deathProgress)
        this.game.ctx.drawImage(document.getElementById("monster") as HTMLImageElement, -25, -25, 50, 50)
        this.game.ctx.restore()
    }

    update(delta: number): void {
        if (this.dying) {
            this.deathProgress += delta/500
            if (this.deathProgress > 1)
                this.kill()
            return
        }
        this.walk(delta)
        this.kill_wizards() 
        this.circle_phase =  (this.circle_phase + delta * Monster.CIRCLE_PHASE_NORM) % (2*Math.PI);
    }

    die() {
        if (this.dying)
            return
        AudioEffects.audioMonsterDie.currentTime = 0
        AudioEffects.audioMonsterDie.play()
        this.dying = true
    }

    kill(): void {
        super.kill()
        this.game.score += MONSTER_KILL_SCORE
    }

    walk(delta: number) {
        var nearest_wizard = this.find_nearest_wizard()
        if (nearest_wizard === null)
            return
        var angle = Math.atan2(nearest_wizard.pos.y - this.pos.y,
        nearest_wizard.pos.x - this.pos.x)
        this.direction = angle
        if (this.isPulled) {
            this.isPulled = false
            return
        }
        this.pos.x += Math.cos(angle) * delta * MONSTER_VELOCITY
        this.pos.y += Math.sin(angle) * delta * MONSTER_VELOCITY
        
        this.pos.x += Math.sin(this.circle_phase) * delta * MONSTER_VELOCITY * Monster.CIRCULAR_MOVEMENT_NORM
        this.pos.y += Math.cos(this.circle_phase) * delta * MONSTER_VELOCITY * Monster.CIRCULAR_MOVEMENT_NORM
    }

    find_nearest_wizard() : Wizard | null{
        var nearest_distance = 999999999999
        let nearest_wizard : Wizard | null = null
        this.game.objects.forEach(wizard => {
            if (wizard instanceof Wizard && wizard.timeUntilVulnerablity < 0 && !wizard.dying) {
                var distance = this.pos.distance(wizard.pos)
                if (distance < nearest_distance) {
                    nearest_distance = distance
                    nearest_wizard = wizard
                }
            }
        });
        return nearest_wizard
    }

    kill_wizards() {
        this.game.objects.forEach(wizard => {
            if (wizard instanceof Wizard) {
                if (this.touch(wizard)) {
                    wizard.die()
                }
            }
        });
    }
}
