import { Game } from "./game.js";
import { RoundGameObject } from "./game_object.js";
import { Monster } from "./monster.js";
import { Point } from "./utils.js";
import { Wizard } from "./wizard.js";

export class Water extends RoundGameObject {
    constructor(game: Game, pos: Point) {
        super(game, pos, 30, "blue")
    }

    update(delta: number) {
        for (let obj of this.game.objects) {
            if (obj === this)
                continue
            if (!(obj instanceof Wizard || obj instanceof Monster)) {
                continue
            }

            if (this.touch(obj))
                obj.die()
        }
    }

    draw() {
        const spikes = 7;
        const ballRadius = this.radius * 0.6;
        const spikeRadius = this.radius;
        const spikeWidth = 5;
        const Q = Math.PI / 2;

        this.game.ctx.save();
        this.game.ctx.fillStyle = "rgb(34,34,34)";
        this.game.ctx.shadowColor = 'black';
        this.game.ctx.shadowOffsetX = 0;
        this.game.ctx.shadowOffsetY = 0;
        this.game.ctx.shadowBlur = 30;
        this.game.ctx.beginPath();
        this.game.ctx.ellipse(this.pos.x, this.pos.y, ballRadius, ballRadius, 0, 0, 2 * Math.PI);
        this.game.ctx.fill();
        this.game.ctx.restore();

        this.game.ctx.fillStyle = "rgb(167,180,186)";
        for (let i = 0; i < spikes; i++ ) {
            let angle = 2 * Math.PI / spikes * i;
            this.game.ctx.beginPath();
            this.game.ctx.moveTo(this.pos.x + Math.cos(angle) * ballRadius + Math.cos(angle - Q) * spikeWidth, this.pos.y + Math.sin(angle) * ballRadius + Math.sin(angle - Q) * spikeWidth);
            this.game.ctx.lineTo(this.pos.x + Math.cos(angle) * spikeRadius, this.pos.y + Math.sin(angle) * spikeRadius);
            this.game.ctx.lineTo(this.pos.x + Math.cos(angle) * ballRadius + Math.cos(angle + Q) * spikeWidth, this.pos.y + Math.sin(angle) * ballRadius + Math.sin(angle + Q) * spikeWidth);
            this.game.ctx.fill();
            this.game.ctx.stroke();
        }
    }
}