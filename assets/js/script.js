/*
 * Load database definition
 */

var Httpreq = new XMLHttpRequest();
Httpreq.open("GET", "/api/database/", false);
Httpreq.send(null);
dbs_json = JSON.parse(Httpreq.responseText);
var dbs = {}
for (var i = 0; i < dbs_json.length; i++)
    dbs[dbs_json[i].id] = dbs_json[i]

/*
 * Load DB Icon and draw DBs
 */
project.importSVG('assets/img/db.svg', function(item, raw) {
    console.log("SVG loaded");
    var db_position = new Point(100,100);
    item.scale(2.5);
    item.strokeColor = "#af6d6d";
    item.fillColor = "#af6d6d";

    for (var id in dbs) {
        item.position = db_position;
        dbs[id]['item'] = item;
        label = new PointText({
            content: id,
            fillColor: '#c7c4c4',
            fontSize: "2em",
            position: item.bounds.bottomCenter + new Point(0, 20),
        });
        item = item.clone();
        db_position += new Point(300,0);
    }
    item.remove()
});
/*
 * Variable for drag and drop db
 */
var selected_db;
var drop_db;
var moving_icon;
var drop_icon;
var visible_div = true
var last_tasks_json = ''

function onMouseDown(event) {
    if(drop_icon == undefined){
    
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
    if(moving_icon != undefined){
        moving_icon.position = event.point
    }
}

function onMouseUp(event){
    if(moving_icon != undefined){
        drop_db = undefined;
        for (var id in dbs) {
            if(id != selected_db && dbs[id]['item'].bounds.intersects(moving_icon.bounds)){
                drop_db = id;
            } 
        }
        drop_icon = moving_icon;
        moving_icon = undefined;
    }
}

function onFrame(){
    if(drop_icon != undefined){
        var dest;
        if(drop_db != undefined){
            console.log("moving to dest");
            dest = dbs[drop_db]['item'].bounds.center;
        } else {
            console.log("moving to src");
            dest = dbs[selected_db]['item'].bounds.center;
        }
        var move = dest - drop_icon.bounds.center;
        if(move.length <= 1){
            drop_icon.remove();
            if(drop_db != undefined){
                console.log("Copy " + selected_db + " --> " + drop_db);
                launch_task(selected_db, drop_db);
            }
            drop_db = undefined;
            selected_db = undefined;
            drop_icon = undefined;
        } else {
            move.length = Math.ceil(move.length / 10);
            drop_icon.position += move;
        }
    }
}

function launch_task(from, to){

    var req = new XMLHttpRequest();
    req.open("POST", "/api/task/", false);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({'from': from, 'to': to}));
    console.log(req.responseText);

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
        }
        inactive_div.appendChild(table)

        // Switch div
        active_div.style.display = 'none'
        inactive_div.style.display = 'block'
        visible_div = !visible_div
    }
}


setInterval(updateTasks, 1000);


