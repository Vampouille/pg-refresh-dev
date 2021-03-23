/**
 * Animation for drag and drop db icon
 */

 class DragAndDrop{

    /**
     * Call on MouseDown
     */
    constructor(dbs,selected_db, drop_callback){
        this.dbs = dbs
        this.selected_db = selected_db
        this.drop_callback = drop_callback
        this.moving_icon = selected_db.item.clone()
        this.moving_icon.strokeColor = '#cb5252'
        this.moving_icon.fillColor = '#cb5252'
        this.isDropped = false
    }

    /**
     * Call on MouseDrag
     */
    drag(event){
        this.moving_icon.position = event.point
    }

    /**
     * Call on MouseUp
     */
    drop(event){

        this.dest = this.selected_db.item.bounds.center;
        for (var id in this.dbs) {
            if(id != this.selected_db.id && this.dbs[id]['item'].bounds.intersects(this.moving_icon.bounds)){
                this.dest = this.dbs[id].item.bounds.center;
                // Call the callback with the selected and drop db
                this.drop_callback(this.selected_db, this.dbs[id])
            } 
        }
        this.isDropped = true
    }

    /**
     * Call on OnFrame
     * 
     * return true if the animation is finished and to stop call
     * to this function
     */
    update(event){
        if(this.isDropped){
            var move = this.dest.subtract(this.moving_icon.bounds.center);
            if(move.length <= 1){
                this.moving_icon.remove();
                return true
            } else {
                move.length = Math.ceil(move.length / 10);
                this.moving_icon.position = this.moving_icon.position.add(move);
                return false
            }
        }
    }
 }