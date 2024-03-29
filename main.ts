export { }

let canvas: HTMLCanvasElement = document.getElementById('canvas')! as HTMLCanvasElement
let ctx = canvas.getContext('2d')!

let waitFrame = () => new Promise((resolve, reject) => requestAnimationFrame(resolve))

document.addEventListener('mousemove', (e) => {
    // TODO Handle mouse move event using `e.offsetX` and `e.offsetY`
})

let previousTimestamp: number;
let playing = true
let endTimestamp: number

document.addEventListener('mousedown', (e) => {
    // TODO Handle mouse down event using `e.offsetX` and `e.offsetY`
})

async function drawFrame(timestamp: number) {
    let dt = (timestamp - previousTimestamp) / 1000;
    previousTimestamp = timestamp

    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // TODO handle game tick
}

async function main() {
    previousTimestamp = await waitFrame() as number
    while (true) {
        drawFrame(await waitFrame() as number)
    }
}

await main()
