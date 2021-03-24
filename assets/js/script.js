let transfer
// drag and drop
let dad
let dbs

/*
 * Variable for drag and drop db
 */
let selected_db;
let drop_db;
// db icon dragging follow mouse
let moving_icon;
// db icon released that will go to drop_db or return to selected_db
let last_tasks_json = ''
let transfer_task_id


paper.install(window)
window.onload = function () {
    paper.setup('myCanvas')

    fetch('/api/database/') 
      .then(response => response.json())
      .then(data => draw_dbs(data))

    view.onFrame = onFrame 
    view.onMouseDown = onMouseDown
    view.onMouseDrag = onMouseDrag
    view.onMouseUp = onMouseUp

    view.draw()
}

function draw_dbs(json){

    dbs = {}
    for (var i = 0; i < json.length; i++)
        dbs[json[i].id] = json[i]

    /*
     * Load DB Icon and draw DBs
     */
    project.importSVG('assets/img/db.svg', function(item, raw) {
        var db_position = new Point(100, 100)
        item.scale(2.5)
        item.strokeColor = "#af6d6d"
        item.fillColor = "#af6d6d"

        for (var id in dbs) {
            item.position = db_position
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
            item = item.clone()
            db_position = db_position.add(new Point(300, 0))
        }
        item.remove()
        updateTasks()
        setInterval(updateTasks, 10000)
    });


}

function onMouseDown(event) {
    if(dad == undefined)
        for (var id in dbs)
            if(event.point.isInside(dbs[id]['item'].bounds)){
                dad = new DragAndDrop(dbs, dbs[id], launch_task)
                break;
            }
}

function onMouseDrag(event){
    if(dad)
        dad.drag(event)
}

function onMouseUp(event){
    if(dad)
        dad.drop(event)
}

function onFrame(event){
    if(dad && dad.update(event))
        dad = undefined
    
    if(transfer)
        transfer.update(event)
}

function launch_task(from, to){

    fetch('/api/task/', 
      {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({'from': from.id, 'to': to.id})
      })
      .then(response => response.json())
      .then(data => updateTasks())
}


/**
 * Tasks table
 */

function updateTasks(){
    fetch('/api/task/') 
      .then(response => response.json())
      .then(data => redraw_table(data))
}


function redraw_table(tasks){

    if(JSON.stringify(tasks) != last_tasks_json){
        console.log("Updating tasks")
        last_tasks_json = JSON.stringify(tasks)
        tasks = tasks.reverse()

        // Update table
        table = document.createElement('table')
        table.appendChild(generate_table_header())

        tasks.forEach(function(task){
            table.appendChild(gen_row(task))
        })
        document.getElementById('tasks').innerHTML = ''
        document.getElementById('tasks').appendChild(table)


        // Update transfer animation

        // Current animation still running ?
        if(transfer){
            tasks.forEach(function(task){
                if(transfer && task.id == transfer.task.id && task.state != 'Running'){
                    // Remove animation for terminated transfer (Done, Error)
                    transfer.delete()
                    transfer = undefined
                }
            })
        } 
        if(!transfer)
            tasks.forEach(function (task) {
                if (task.state == 'Running') {
                    task.from = dbs[task.db_from]
                    task.to = dbs[task.db_to]
                    transfer = new Transfer(task)
                }
            })
    }
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

function generate_table_header(){

    header = document.createElement('thead')

    // Table header
    header.innerHTML =`<thead><tr>
        <th>From</th>
        <th>To</th>
        <th>State</th>
        <th>Start</th>
        <th>End</th>
        <th>Duration</th>
    </tr></thead>`

    return header
}