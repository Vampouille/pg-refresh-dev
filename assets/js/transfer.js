/*
 * Transfer animation
 */
class Transfer {

    constructor(task) {

        this.task = task
        this.path = undefined
        this.circles = []
        this.path_padding = 10
        this.path_height = 50
        this.shift = 10
        this.density = 10
        this.speed = 100
        this.circle_min = 5
        this.circle_max = 15
        this.color = '#188f28'

        // Create new hidden path
        this.path = new Path()
        this.path.add(this.task.from.label.bounds.bottomCenter.add(new Point(0, this.path_padding)))
        this.path.add(this.task.from.label.bounds.bottomCenter.add(new Point(0, this.path_padding + this.path_height)))
        this.path.add(this.task.to.label.bounds.bottomCenter.add(new Point(0, this.path_padding + this.path_height)))
        this.path.add(this.task.to.label.bounds.bottomCenter.add(new Point(0, this.path_padding)))
        this.path.strokeColor = '#b11a1a';
        this.path.strokeWidth = 5;
        this.path.strokeCap = 'round';
        this.path.dashArray = [10, 12];
    }

    delete() {
        // Cleanup path
        this.path.remove()
        // Cleanup circles
        for (var i = 0; i < this.circles.length; i++)
            this.circles[i].item.remove()
    }

    update(event) {

        console.log(this.circles.length)
        var circle_to_remove = []
        for (var i = 0; i < this.circles.length; i++) {
            var age = event.time - this.circles[i].frame_start
            if ((age * this.speed) > this.path.length) {
                this.circles[i].item.remove()
                circle_to_remove.push(i);
            } else {
                this.circles[i].item.position = this.path.getPointAt(age * this.speed).add(this.circles[i].shift)
            }
        }

        for (var i = circle_to_remove.length - 1; i >= 0; i--)
            this.circles.splice(circle_to_remove[i], 1)

        if((Math.random() * 100) < this.density){
            // generate new circle
            var circle = {
                item: new Path.Circle(100, 100, this.circle_min + Math.random() * (this.circle_max - this.circle_min)),
                frame_start: event.time,
                shift: new Point(Math.random() * 2 * this.shift - this.shift,
                                 Math.random() * 2 * this.shift - this.shift)
            };
            circle.item.fillColor = this.color
            circle.item.fillColor.hue = Math.random() * 360
            circle.item.position = this.path.getPointAt(0).add(circle.shift)

            this.circles.push(circle)
        }
    }

}