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
        item = item.clone();
        db_position += new Point(300,0);
    }
    item.remove()
});
/*
 * Variable for drag and drop db
 */
var selected_db;
var moving_icon;


function onMouseDown(event) {
    selected_db = undefined;
    for (var id in dbs) {
        if(event.point.isInside(dbs[id]['item'].bounds)){
            selected_db = id;
            moving_icon = dbs[id]['item'].clone();
            moving_icon.strokeColor = '#FF0000';
            break;
        }
    }
    console.log("Selected DB " + selected_db);
}

function onMouseDrag(event){
    if(moving_icon != undefined){
        moving_icon.position = event.point
    }
}