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
let drop_icon = null
let visible_div = true
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
    if(dad)
        if(dad.update(event))
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
      .then(data => console.log(data))
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
