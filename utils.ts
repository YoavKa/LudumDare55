// Same as button events
export enum Press {NoPress = -1, LeftPress = 0, MiddlePress = 1, RightPress = 2}

export class Point {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    add(point: Point) {
        return new Point(this.x + point.x, this.y + point.y)
    }

    sub(point: Point) {
        return new Point(this.x - point.x, this.y - point.y)
    }

    scale(amount: number) {
        return new Point(this.x * amount, this.y * amount)
    }

    norm() {
        return Math.hypot(this.x, this.y)
    }

    distance(other: Point) {
        return (this.sub(other).norm())
    }

    rotate(angle: number) {
        let curAngle = Math.atan2(this.y, this.x)
        let newAngle = curAngle + angle
        let curNorm = this.norm()
        return new Point(Math.cos(newAngle) * curNorm, Math.sin(newAngle) * curNorm)
    }

    normalized(): Point {
        return this.scale(1 / this.norm())
    }
}