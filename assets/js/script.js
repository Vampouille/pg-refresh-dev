let transfer
let dbs = {}

/*
 * Variable for drag and drop db
 */
let selected_db;
let drop_db;
// db icon dragging follow mouse
let moving_icon;
// db icon released that will go to drop_db or return to selected_db
let drop_icon = null
let visible_div = true
let last_tasks_json = ''
let transfer_task_id


paper.install(window)
window.onload = function () {
    paper.setup('myCanvas');

    /*
     * Load database definition
     */

    var Httpreq = new XMLHttpRequest();
    Httpreq.open("GET", "/api/database/", false);
    Httpreq.send(null);
    dbs_json = JSON.parse(Httpreq.responseText);
    for (var i = 0; i < dbs_json.length; i++)
        dbs[dbs_json[i].id] = dbs_json[i]

    /*
     * Load DB Icon and draw DBs
     */
    project.importSVG('assets/img/db.svg', function(item, raw) {
        console.log("SVG loaded");
        var db_position = new Point(100, 100);
        item.scale(2.5);
        item.strokeColor = "#af6d6d";
        item.fillColor = "#af6d6d";

        for (var id in dbs) {
            item.position = db_position;
            dbs[id] = {
                id: id,
                item: item,
                label: new PointText({
                    content: id,
                    fillColor: '#c7c4c4',
                    fontSize: "2em",
                    position: item.bounds.bottomCenter.add(new Point(0, 20)),
                }),
            }
            item = item.clone();
            db_position = db_position.add(new Point(300, 0))
        }
        item.remove()
    });

    view.onFrame = onFrame 
    view.onMouseDown = onMouseDown
    view.onMouseDrag = onMouseDrag
    view.onMouseUp = onMouseUp

    view.draw();
}

function onMouseDown(event) {
    if(drop_icon == null){
    
        for (var id in dbs) {
            if(event.point.isInside(dbs[id]['item'].bounds)){
                selected_db = id;
                moving_icon = dbs[id]['item'].clone();
                moving_icon.strokeColor = '#cb5252';
                moving_icon.fillColor = '#cb5252';
                break;
            }
        }
        console.log("Selected DB " + selected_db);
    }
}

function onMouseDrag(event){
    if(moving_icon != null){
        moving_icon.position = event.point
    }
}

function onMouseUp(event){
    if(moving_icon != null){
        bb = moving_icon.bounds
        drop_db = undefined;
        for (var id in dbs) {
            if(id != selected_db && dbs[id]['item'].bounds.intersects(bb)){
                drop_db = id;
            } 
        }
        drop_icon = moving_icon;
        moving_icon = undefined;
    }
}

function onFrame(event){
    if(drop_icon != null){
        var dest;
        if(drop_db != undefined){
            console.log("moving to dest");
            dest = dbs[drop_db]['item'].bounds.center;
        } else {
            console.log("moving to src");
            dest = dbs[selected_db]['item'].bounds.center;
        }
        var move = dest.subtract(drop_icon.bounds.center);
        if(move.length <= 1){
            drop_icon.remove();
            if(drop_db != undefined){
                console.log("Copy " + selected_db + " --> " + drop_db);
                launch_task(dbs[selected_db], dbs[drop_db]);
            }
            drop_db = undefined;
            selected_db = undefined;
            drop_icon = null;
        } else {
            move.length = Math.ceil(move.length / 10);
            drop_icon.position = drop_icon.position.add(move);
        }
    }
    if(transfer)
        transfer.update(event)
}

function launch_task(from, to){

    var req = new XMLHttpRequest();
    req.open("POST", "/api/task/", false);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({'from': from.id, 'to': to.id}));
    console.log(req.responseText);
    if(transfer){
        transfer.delete()
    }
    transfer = new Transfer(from, to)

}

function gen_row(task){
    line = document.createElement('tr')
    line.className = task['state']

    line.appendChild(gen_td(task['db_from']))
    line.appendChild(gen_td(task['db_to']))
    line.appendChild(gen_td(task['state']))
    line.appendChild(gen_td(task['start']))
    line.appendChild(gen_td(task['end']))
    line.appendChild(gen_td(task['duration']))

    return line
}

function gen_td(label){
    td = document.createElement('td')
    td.innerHTML = label
    return td
}

function gen_th(label){
    th = document.createElement('th')
    th.innerHTML = label
    return th
}
function generate_table_header(){

    header = document.createElement('thead')

    // Table header
    line = document.createElement('tr')

    line.appendChild(gen_th('From'))
    line.appendChild(gen_th('To'))
    line.appendChild(gen_th('State'))
    line.appendChild(gen_th('Start'))
    line.appendChild(gen_th('End'))
    line.appendChild(gen_th('Duration'))

    header.appendChild(line)
    return header
}

function updateTasks(){
    // Fetch tasks
    var req = new XMLHttpRequest()
    req.open("GET", "/api/task/", false)
    req.send(null)
    if(req.responseText != last_tasks_json){
        console.log("Updating tasks")
        last_tasks_json = req.responseText
        tasks = JSON.parse(req.responseText)
        tasks = tasks.reverse()

        var active_div = document.getElementById('tasks_' + visible_div)
        var inactive_div = document.getElementById('tasks_' + (!visible_div))

        // Cleanup inactive div and build new table
        while (inactive_div.firstChild)
            inactive_div.removeChild(inactive_div.lastChild)
        table = document.createElement('table')
        table.appendChild(generate_table_header())

        // Fill with new tasks
        //console.log("Fetches tasks")
        //console.log(tasks)
        for (var i = 0; i < tasks.length; i++){
            console.log("Adding task " + tasks[i]['id'])
            table.appendChild(gen_row(tasks[i]))
            // Draw animation of running task if running
            // TODO animation = new Animation()

        }
        //inactive_div.innerHTML = ''
        inactive_div.appendChild(table)

        // Switch div
        active_div.style.display = 'none'
        inactive_div.style.display = 'block'
        visible_div = !visible_div
    }
}

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
                'item': new Path.Circle(100, 100, this.circle_min + Math.random() * (this.circle_max - this.circle_min)),
                'offset': Math.random() * this.path.length,
                'shift': new Point(Math.random() * 2 * this.shift - this.shift,
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
 

setInterval(updateTasks, 1000);
    // fetch('/api/task/', 
    //   {
    //     method: 'POST',
    //     headers: {"Content-Type": "application/json"},
    //     body: JSON.stringify({'from': from, 'to': to})
    //   })
    //   .then(response => response.json())
    //   .then(data => console.log(data))
    // // TODO confirm alert("Transfer")
    // animation = new Animation(from, to)
