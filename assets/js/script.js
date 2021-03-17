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
    
    for (var id in dbs) {
        item.position = db_position;
        dbs[id]['item'] = item;
        label = new PointText({
            content: id,
            fontSize: "2em",
            position: item.bounds.bottomCenter + new Point(0, 20),
        });
        debug = new Path(new Rectangle(item.bounds));
        debug.strokeColor = "#FF0000";
        debug.strokeColor = "#FF0000";
        debug.selected = true;
        //
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

function onMouseDown(event) {
    if(drop_icon == undefined){
    
        for (var id in dbs) {
            if(event.point.isInside(dbs[id]['item'].bounds)){
                selected_db = id;
                moving_icon = dbs[id]['item'].clone();
                moving_icon.strokeColor = '#FF0000';
                moving_icon.fillColor = '#FF0000';
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