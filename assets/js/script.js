/*
 * Load database definition
 */

var Httpreq = new XMLHttpRequest(); // a new request
Httpreq.open("GET", "/api/task/", false);
Httpreq.send(null);
dbs = JSON.parse(Httpreq.responseText);
console.log(dbs);

var rectangle = new Rectangle(new Point(50, 50), new Point(150, 100));
var path = new Path.Rectangle(rectangle);
path.fillColor = '#e9e9ff';

var db;

project.importSVG('assets/img/db.svg', function(item, raw) {
    var db_icon = new Path();
    item.position = new Point(100, 100);
    db = item
    /*db_icon.position = new Point(100, 100);
    db_icon.add(item);
    db_icon.position = new Point(100, 100);*/
    console.log("SVG loaded");
    });

function onFrame(event) {
    if (db === undefined) {
        console.log("SVG not loaded");
    } else {
        db.position += new Point(1, 1);
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

