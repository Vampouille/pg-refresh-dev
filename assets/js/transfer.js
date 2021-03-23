/*
 * Transfer animation
 */
class Transfer {

    constructor(from, to) {

        this.path = undefined
        this.circles = []
        this.path_padding = 10
        this.path_height = 50
        this.shift = 10
        this.density = 20
        this.circle_min = 5
        this.circle_max = 15
        this.color = '#188f28'

        // Create new hidden path
        this.path = new Path()
        this.path.add(from.label.bounds.bottomCenter.add(new Point(0, this.path_padding)))
        this.path.add(from.label.bounds.bottomCenter.add(new Point(0, this.path_padding + this.path_height)))
        this.path.add(to.label.bounds.bottomCenter.add(new Point(0, this.path_padding + this.path_height)))
        this.path.add(to.label.bounds.bottomCenter.add(new Point(0, this.path_padding)))

        // Draw circles
        for (var i = 0; i < Math.round(this.path.length / this.density); i++) {
            this.circles[i] = {
                item: new Path.Circle(100, 100, this.circle_min + Math.random() * (this.circle_max - this.circle_min)),
                offset: Math.random() * this.path.length,
                shift: new Point(Math.random() * 2 * this.shift - this.shift,
                                 Math.random() * 2 * this.shift - this.shift)
            };
            this.circles[i].item.fillColor = this.color
            this.circles[i].item.fillColor.hue = Math.random() * 360
        }
    }

    delete() {
        // Cleanup path
        this.path.remove()
        // Cleanup circles
        for (var i = 0; i < this.circles.length; i++)
            this.circles[i].item.remove()
    }

   update(event) {

       for (var i = 0; i < this.circles.length; i++) {
            if (this.circles[i].offset < this.path.length) {
                this.circles[i].item.position = this.path.getPointAt(this.circles[i].offset).add(this.circles[i].shift)
                this.circles[i].offset += event.delta * 100
            } else {
                this.circles[i].offset = 0
            }
        }
    }

}