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

var selected_db;
var moving_icon;
var rectangle = new Rectangle(new Point(50, 50), new Point(150, 100));
var path = new Path.Rectangle(rectangle);
path.fillColor = '#e9e9ff';

var db_icon;

project.importSVG('assets/img/db.svg', function(item, raw) {
    console.log("SVG loaded");
    var db_position = new Point(20,50);
    
    for (var id in dbs) {
        item.position = db_position;
        dbs[id]['item'] = item;
        item = item.clone();
        db_position += new Point(170,50);
    }
    item.remove()
});

function onFrame(event) {
    if (db_icon === undefined) {
        console.log("SVG not loaded");
    } else {
        db_icon.position += new Point(1, 1);
    }
}


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

// Create a Paper.js Path to draw a line into it:
var path = new Path();
// Give the stroke a color
path.strokeColor = 'black';
var start = new Point(100, 100);
// Move to start and draw a line from there
path.moveTo(start);
// Note the plus operator on Point objects.
// PaperScript does that for us, and much more!
path.lineTo(start + [ 100, -50 ]);

