import { Game } from "./game.js"
import { Monster } from "./monster.js"
import { Point } from "./utils.js"
import { Water } from "./water.js"
import { Wizard } from "./wizard.js"

export { }

let canvas: HTMLCanvasElement = document.getElementById('canvas')! as HTMLCanvasElement
let ctx = canvas.getContext('2d')!

var myFont = new FontFace('myFont', 'url(DellaRespira-Regular.ttf)');
myFont.load().then(function(font){
    // with canvas, if this is ommited won't work
    document.fonts.add(font);
});

let game = new Game(ctx, canvas.width, canvas.height)

function start() {
    game = new Game(ctx, canvas.width, canvas.height);

}
start()

let waitFrame = () => new Promise((resolve, reject) => requestAnimationFrame(resolve))

let previousTimestamp: number;

document.addEventListener('mousedown', (e) => {
    game.mouseState.onMouseDown(new Point(e.offsetX, e.offsetY), e.button)
})

document.addEventListener('mouseup', (e) => {
    game.mouseState.onMouseUp(new Point(e.offsetX, e.offsetY), e.button)
})

document.addEventListener('mousemove', (e) => {
    game.mouseState.onMouseMove(new Point(e.offsetX, e.offsetY))
})

// Disable the right-click default menu
document.addEventListener("contextmenu", e => e.preventDefault());

let floorImg = document.getElementById("floor") as HTMLImageElement
async function drawFrame(timestamp: number) {
    let dt = timestamp - previousTimestamp;
    previousTimestamp = timestamp

    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 3; y++) {
            ctx.drawImage(floorImg, x * 256 - 5, y * 256 - 20, 256, 256)
        }
    }

    game.update(dt)
    game.draw()
}

async function main() {
    previousTimestamp = await waitFrame() as number
    while (true) {
        drawFrame(await waitFrame() as number)
    }
}

await main()
