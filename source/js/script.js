"use strict";

(function(canvas){
    const CANVAS_SIZE = { width: 500, height:400 }; 
    const COLORS = { SELECTED_SHAPE: "gray" };
    const CURSORS = { DEFAULT: "default", CREATE_TRANSITION: "crosshair"};
    const DEFAULT_SHAPE_SIZE = { width: 50, height: 20 };
    const EVENT_KEYS = { DELETE: "Delete" };
    const QUANDRANTS = { Q0: 0, Q1: 1, Q2: 2, Q3: 3, VERTICAL: 4, HORIZONTAL: 5 };
    const SHAPES = { STATE: 0, TASK: 1, CONDITIONAL: 2, FORK: 3, JOIN: 4 };
    const TRANSITION = { SELECTION_DELTA: 5, COLOR: "black", SELECTED_COLOR: "red", ARROW_SIZE: 5, ARROW_FILL_COLOR: "white", ARROW_IS_FILL_STYLE: true };
    const UI_ACTION_MODE = { UNSELECTED:0, NEW_TRANSITION:1, NODE_SELECT:2, TRANSITION_SELECT:3, DRAGGING: 4 };

    function calculateNewTransitionPoint(pointx, pointy, targetx, targety){
        var s;
        var newX;
        var newY;
        var pointSlope;
        var targetSlope = (targetx - pointx) / (targety - pointy);

        switch(calculateQuadrant(pointx, pointy, targetx, targety)){
            case QUANDRANTS.Q0:
                pointSlope = 
                    ((pointx + DEFAULT_SHAPE_SIZE.width / 2) - pointx) / 
                    ((pointy - DEFAULT_SHAPE_SIZE.height / 2) - pointy);

                if(Math.abs(pointy-targety)<5){
                    return { x: pointx + DEFAULT_SHAPE_SIZE.width/2, y: pointy};
                } else if(pointSlope < targetSlope){
                    s = (pointy - DEFAULT_SHAPE_SIZE.height/2 - pointy) / (targety - pointy) ;
                    newX = pointx + s * (targetx - pointx) ;
                    return { x: newX, y: pointy - DEFAULT_SHAPE_SIZE.height/2};
                } else if (pointSlope > targetSlope){
                    s = (pointx + DEFAULT_SHAPE_SIZE.width/2 - pointx) / (targetx - pointx) ;
                    newY = pointy + s * (targety - pointy) ;
                    return { x: pointx + DEFAULT_SHAPE_SIZE.width/2, y: newY};
                } else {
                    return { x: pointx + DEFAULT_SHAPE_SIZE.width/2, y: pointy};
                }
            case QUANDRANTS.Q1:
                pointSlope = 
                    ((pointx + DEFAULT_SHAPE_SIZE.width / 2) - pointx) / 
                    ((pointy + DEFAULT_SHAPE_SIZE.height / 2) - pointy);

                if(Math.abs(pointx-targetx)<5){
                    return { x: pointx, y: pointy + DEFAULT_SHAPE_SIZE.height/2};
                } else if(pointSlope > targetSlope){
                    s = (pointy + DEFAULT_SHAPE_SIZE.height/2 - pointy) / (targety - pointy) ;
                    newX = pointx + s * (targetx - pointx) ;
                    return { x: newX, y: pointy + DEFAULT_SHAPE_SIZE.height/2 };
                } else if(pointSlope < targetSlope) {
                    s = (pointx + DEFAULT_SHAPE_SIZE.width/2 - pointx) / (targetx - pointx) ;
                    newY = pointy + s * (targety - pointy) ;
                    return { x: pointx + DEFAULT_SHAPE_SIZE.width/2, y: newY };
                } else {
                    return { x: pointx, y: pointy + DEFAULT_SHAPE_SIZE.height/2};
                }
            case QUANDRANTS.Q2:
                pointSlope = 
                    ((pointx - DEFAULT_SHAPE_SIZE.width / 2) - pointx) / 
                    ((pointy + DEFAULT_SHAPE_SIZE.height / 2) - pointy);

                if(Math.abs(pointy-targety)<5){
                    return { x: pointx - DEFAULT_SHAPE_SIZE.width/2, y: pointy };
                } else if(pointSlope < targetSlope) {
                    s = (pointy + DEFAULT_SHAPE_SIZE.height/2 - pointy) / (targety - pointy) ;
                    newX = pointx + s * (targetx - pointx) ;
                    return { x: newX, y: pointy + DEFAULT_SHAPE_SIZE.height/2 };
                } else if(pointSlope > targetSlope) {
                    s = (pointx - DEFAULT_SHAPE_SIZE.width/2 - pointx) / (targetx - pointx) ;
                    newY = pointy + s * (targety - pointy) ;
                    return { x: pointx - DEFAULT_SHAPE_SIZE.width/2, y: newY };
                } else {
                    return { x: pointx - DEFAULT_SHAPE_SIZE.width/2, y: pointy };
                }
            case QUANDRANTS.Q3:
                pointSlope = 
                    ((pointx - DEFAULT_SHAPE_SIZE.width / 2) - pointx) / 
                    ((pointy - DEFAULT_SHAPE_SIZE.height / 2) - pointy);

                if(Math.abs(pointx-targetx)<10){
                    return { x: pointx , y: pointy - DEFAULT_SHAPE_SIZE.height/2};
                } else if(pointSlope > targetSlope){
                    s = (pointy - DEFAULT_SHAPE_SIZE.height/2 - pointy) / (targety - pointy) ;
                    newX = pointx + s * (targetx - pointx) ;
                    return { x: newX, y: pointy - DEFAULT_SHAPE_SIZE.height/2 };
                } else if(pointSlope < targetSlope){
                    s = (pointx - DEFAULT_SHAPE_SIZE.width/2 - pointx) / (targetx - pointx) ;
                    newY = pointy + s * (targety - pointy) ;
                    return { x: pointx - DEFAULT_SHAPE_SIZE.width/2, y: newY };
                } else {
                    return { x: pointx , y: pointy - DEFAULT_SHAPE_SIZE.height/2};
                }
            default:
                throw {name:"Not Implemented", message:"Not Implemented"};
        }
    }

    function calculateQuadrant(pointx, pointy, targetx, targety) {
        var quadrant;
        if (pointx < targetx  && pointy >= targety) {
            quadrant = QUANDRANTS.Q0;
        } else if (pointx <= targetx && pointy < targety) {
            quadrant = QUANDRANTS.Q1;
        } else if (pointx > targetx  && pointy <= targety) {
            quadrant = QUANDRANTS.Q2;
        } else if (pointx >= targetx  && pointy > targety) {
            quadrant = QUANDRANTS.Q3;
        } else {
            throw {name:"Not Implemented", message:"Not Implemented"};
        }
        return quadrant;
    }

    function calculateVectorLength (x, y) {
        return Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
    }

    function calculateXCoordinate(px1, py1, px2, py2, y ){
        return ( y + px2 * (py2-py1)/(px2-px1) - py2) * (px2 - px1) / (py2-py1);
    }
    
    function calculateYCoordinate(px1, py1, px2, py2, x ){
        var divisor = (px2 - px1);
        var k = (py2-py1) / (px2 - px1);
        return (x - px2) * (divisor===0?0:k) + py2;
    }

    function drawArrow (context, fromx, fromy, tox, toy, fullarrow) {
        var arrowSize = TRANSITION.ARROW_SIZE;
        var vx = tox - fromx;
        var vy = toy - fromy;

        var theta = Math.acos(vx / calculateVectorLength(vx, vy)); 

        var gamma = 30 * Math.PI / 180;
        var deltaAngle = (Math.PI - gamma);

        var x1 = -arrowSize * Math.cos(gamma + theta);
        var y1 = arrowSize * Math.sin(gamma + theta);

        var x2 = arrowSize * Math.cos(deltaAngle + theta);
        var y2 = arrowSize * Math.sin(deltaAngle + theta);

        if(fromy <= toy) {
            var helpVar = x1;

            x1 = x2; 
            x2 = helpVar;

            helpVar = -y1;
            y1 = y2;
            y2 = helpVar;
        } 
        else if(fromy > toy) {
            x2 = x2;
            y2 = -y2;
        } 

        context.beginPath();
        context.moveTo(tox + x2, toy + y2);
        context.lineTo(tox, toy);
        context.lineTo(tox + x1 , toy + y1);

        if(fullarrow){
            context.fillStyle = TRANSITION.ARROW_FILL_COLOR;
            context.closePath();
            context.fill();
        }
        context.stroke();
    }

    function drawLine(context, fromx, fromy, tox, toy){
        context.beginPath();
        context.moveTo( fromx, fromy );
        context.lineTo( tox, toy );
        context.stroke();
    }

    function drawShape(context, x, y, type, isshapeselected){
        var topLeft = {
            x: x - DEFAULT_SHAPE_SIZE.width / 2,
            y: y - DEFAULT_SHAPE_SIZE.height / 2
        };  

        var height = DEFAULT_SHAPE_SIZE.height;
        var width = DEFAULT_SHAPE_SIZE.width;

        context.fillStyle = COLORS.SELECTED_SHAPE;

        switch(type){
            case SHAPES.STATE: 
            case SHAPES.JOIN:
                var radius = height/2;
                context.beginPath();
                context.strokeStyle = "green";
                context.arc(topLeft.x + radius, topLeft.y + radius, radius,   0.5 * Math.PI , -0.5 * Math.PI);
                context.lineTo(topLeft.x + width - radius, topLeft.y);
                context.arc(topLeft.x + width - radius, topLeft.y + radius, radius, -0.5 * Math.PI, 0.5 * Math.PI);
                context.closePath();

                if(isshapeselected){
                    context.fill();
                }

                context.stroke();
                break;
            case SHAPES.TASK:
                context.strokeStyle = "gray";
                 
                if(isshapeselected){
                    context.fillRect(topLeft.x, topLeft.y, width, height);
                }
                context.strokeRect(topLeft.x, topLeft.y, width, height);
                break;
            case SHAPES.CONDITIONAL:
            case SHAPES.FORK:
                context.strokeStyle = "red";
                context.beginPath();
                context.moveTo(topLeft.x + width/2, topLeft.y);
                context.lineTo(topLeft.x + width, topLeft.y + height/2);
                context.lineTo(topLeft.x + width / 2, topLeft.y + height);
                context.lineTo(topLeft.x , topLeft.y + height/2);
                context.closePath();
                 if(isshapeselected){
                    context.fill();
                }
                context.stroke();
                break;
        }
    }

    function drawTransitions(context, pointx, pointy, targets, selectedtarget){
        
        for (var idx = 0; idx < targets.length; idx++) {
            var target = targets[idx];
            var startPoint = calculateNewTransitionPoint(pointx, pointy, target.x, target.y);
            var endPoint = calculateNewTransitionPoint(target.x, target.y, pointx, pointy);

            context.strokeStyle = target.name===selectedtarget ? TRANSITION.SELECTED_COLOR : TRANSITION.COLOR;

            drawLine(context, startPoint.x, startPoint.y, endPoint.x, endPoint.y);
            drawArrow(context, startPoint.x, startPoint.y, endPoint.x, endPoint.y, TRANSITION.ARROW_IS_FILL_STYLE);
        }
    }

    function isPointOnStraight(transition, point){
        var startPoint = transition.node;
        var stopPoint = transition.transition;

        var firstIntersectionPoint = {
            x: point.x,
            y: calculateYCoordinate(stopPoint.x, stopPoint.y,startPoint.x,startPoint.y, point.x)
        };

        var secondIntersectionPoint = {
            x: calculateXCoordinate(stopPoint.x, stopPoint.y,startPoint.x,startPoint.y, point.y),
            y: point.y
        };

        if(
            (startPoint.x < stopPoint.x && stopPoint.x < point.x) ||
            (startPoint.x > stopPoint.x && stopPoint.x > point.x)
        ){
            firstIntersectionPoint = {
                x: stopPoint.x,
                y: stopPoint.y
            };
            secondIntersectionPoint = firstIntersectionPoint;
        } else if(
            (startPoint.x > stopPoint.x && startPoint.x < point.x) ||
            (startPoint.x < stopPoint.x && startPoint.x > point.x)
        ){
            firstIntersectionPoint = {
                x: startPoint.x,
                y: startPoint.y
            };
            secondIntersectionPoint = firstIntersectionPoint;
        } else if(startPoint.x === stopPoint.x) {
            if(startPoint.y < stopPoint.y){
                if(stopPoint.y > point.y && point.y > startPoint.y ){
                    firstIntersectionPoint = {
                        x: startPoint.x,
                        y: point.y
                    };
                    secondIntersectionPoint = {
                        x: startPoint.x,
                        y: point.y
                    };
                }else{
                    firstIntersectionPoint = {
                        x: startPoint.x,
                        y: startPoint.y
                    };
                    secondIntersectionPoint = {
                        x: startPoint.x,
                        y: stopPoint.y
                    };
                }
            }
            else {
                if( startPoint.y > point.y  && point.y > stopPoint.y   ){
                    firstIntersectionPoint = {
                        x: startPoint.x,
                        y: point.y
                    };
                    secondIntersectionPoint = {
                        x: startPoint.x,
                        y: point.y
                    };
                }else{
                    firstIntersectionPoint = {
                        x: startPoint.x,
                        y: startPoint.y
                    };
                    secondIntersectionPoint = {
                        x: startPoint.x,
                        y: stopPoint.y
                    };
                }
            }
        }

        var lengthVector1 = calculateVectorLength(
            point.x - firstIntersectionPoint.x,
            point.y - firstIntersectionPoint.y
        );

        var lengthVector2 = calculateVectorLength(
            point.x - secondIntersectionPoint.x,
            point.y - secondIntersectionPoint.y
        );

        return (lengthVector2 < TRANSITION.SELECTION_DELTA || lengthVector1 < TRANSITION.SELECTION_DELTA);
    }

    function handleUIEvents(event){
        var x = event.offsetX;
        var y = event.offsetY;
        var isCtrlPressed = event.ctrlKey;

        switch(event.type){
            case "mousedown":
                WorkflowEngine.ui.selectItem(x, y, isCtrlPressed);
                break;
            case "mousemove":
                WorkflowEngine.ui.dragNodeTo(x, y);
                break;
            case "mouseup":
            case "mouseout":
                WorkflowEngine.ui.clearDragging();
                break;
            case "keydown":
                if(event.key === EVENT_KEYS.DELETE){
                     WorkflowEngine.ui.deletedItem();
                }
                break;
        }
        WorkflowEngine.ui.updateCanvas();
    }

    canvas.addEventListener("mousedown", handleUIEvents);
    canvas.addEventListener("mousemove", handleUIEvents);
    canvas.addEventListener("mouseup", handleUIEvents);
    canvas.addEventListener("mouseout", handleUIEvents);

    document.addEventListener("keydown", handleUIEvents);

    var demoWorkflowNodes = [ 
        {name: "created", type: SHAPES.STATE, x:25, y:20, targets:["review"] },
        {name: "review",type: SHAPES.TASK, x:25, y:180, targets:["if"]},
        {name: "approved",type: SHAPES.STATE, x:350, y:20, targets:[]},
        {name: "if",type: SHAPES.CONDITIONAL, x:100, y:175, targets:["split","error","join"]},
        {name: "split",type: SHAPES.FORK, x:205, y:160, targets:["safe state","xor"]},
        {name: "join",type: SHAPES.JOIN, x:180, y:20, targets:["xor"]},
        {name: "safe state",type: SHAPES.STATE, x:195,y:75, targets:["join"]},
        {name: "xor",type: SHAPES.JOIN, x:350, y:140, targets:["approved"]},
        {name: "error",type: SHAPES.STATE, x:210, y:260, targets:["xor"]}
    ];
  /*
 var demoWorkflowNodes = [ 
        {name: "start", type: SHAPES.STATE, x:25, y:20, targets:["end"] },
        {name: "end",type: SHAPES.TASK, x:150, y:100, targets:[]}];
*/
    var WorkflowEngine = {
        ui:{
            currentMode: UI_ACTION_MODE.UNSELECTED,
            deletedItem: function(){
                WorkflowEngine.deleteSelectedTransition();
                WorkflowEngine.deleteSelectedNode();
            },
            beginDragging: function(x, y){
                WorkflowEngine.ui.clearTransition();
                WorkflowEngine.selectItem(x, y);
                WorkflowEngine.ui.currentMode =  WorkflowEngine.isANodeSelected() ? 
                    UI_ACTION_MODE.DRAGGING : UI_ACTION_MODE.UNSELECTED;
            },
            clearDragging: function(){
                if(WorkflowEngine.ui.currentMode === UI_ACTION_MODE.DRAGGING){
                    WorkflowEngine.ui.currentMode = WorkflowEngine.isANodeSelected() ? UI_ACTION_MODE.NODE_SELECT : UI_ACTION_MODE.UNSELECTED;
                }
            },
            clearSelectedItem: function(){
                this.clearTransition();
                this.clearTransitionSelection();
                this.clearDragging();      
            },
            clearTransition: function(){
                canvas.style.cursor = CURSORS.DEFAULT;
                WorkflowEngine.ui.currentMode = WorkflowEngine.isANodeSelected() ? UI_ACTION_MODE.NODE_SELECT : UI_ACTION_MODE.UNSELECTED;
                delete WorkflowEngine.transitionStartPoint;
            },
            clearTransitionSelection: function(){
                WorkflowEngine.ui.currentMode = WorkflowEngine.isANodeSelected() ? UI_ACTION_MODE.NODE_SELECT : UI_ACTION_MODE.UNSELECTED;
                delete WorkflowEngine.selectedTransition;
            },
            dragNodeTo: function(x, y){
                if(WorkflowEngine.ui.currentMode === UI_ACTION_MODE.DRAGGING){
                    WorkflowEngine.selectedItem.x = x;
                    WorkflowEngine.selectedItem.y = y;
                }
            },
            newTransition: function(x, y){
                canvas.style.cursor = CURSORS.CREATE_TRANSITION;
                
                WorkflowEngine.selectItem(x, y);

                if(WorkflowEngine.isANodeSelected()){
                    if(WorkflowEngine.ui.currentMode === UI_ACTION_MODE.NEW_TRANSITION){
                        WorkflowEngine.transitionStartPoint.targets.push(WorkflowEngine.selectedItem.name);
                        WorkflowEngine.ui.clearTransition();     
                    } else {
                        WorkflowEngine.transitionStartPoint = WorkflowEngine.selectedItem;
                        WorkflowEngine.ui.currentMode = UI_ACTION_MODE.NEW_TRANSITION;
                    }
                } else {
                    WorkflowEngine.ui.clearTransition();               
                }
            },
            selectItem: function(x, y, transitionmode){
                if(transitionmode){
                    WorkflowEngine.ui.newTransition(x, y);
                } else {
                    WorkflowEngine.ui.clearSelectedItem();
                    WorkflowEngine.ui.beginDragging(x, y);
                    if(!WorkflowEngine.selectedItem){
                        WorkflowEngine.ui.selectTransition(x, y);
                    }
                }
            },
            selectTransition: function(x ,y){
                for(var idx = 0; idx < WorkflowEngine.transitionList.length; idx++){
                    var transition = WorkflowEngine.transitionList[idx];
                    var canSelect = isPointOnStraight(
                        transition,
                        { x: x, y: y}
                    );
                    if(canSelect){
                        WorkflowEngine.selectedTransition = {node: transition.node, transition: transition.transition.name};
                        WorkflowEngine.ui.currentMode =  UI_ACTION_MODE.TRANSITION_SELECT;
                        break;
                    }
                }
            },
            updateCanvas: function() {
                WorkflowEngine.render();
            }
        },
        createNewNode: function(node){
            this.workflow.push(node);
        },
        deleteSelectedNode: function(){
            if(WorkflowEngine.ui.currentMode ===  UI_ACTION_MODE.NODE_SELECT){
                var selectedItemName = this.selectedItem.name;
                this.workflow = this.workflow.map( node => {
                    node.targets = node.targets.filter( x => x !== selectedItemName);
                    return (node.name!==selectedItemName) ? node : undefined;
                }).filter(node => node);
            }
        },
        deleteSelectedTransition: function(){
            if(WorkflowEngine.ui.currentMode ===  UI_ACTION_MODE.TRANSITION_SELECT){                
                this.selectedTransition.node.targets = 
                    this.selectedTransition.node.targets
                        .filter(target => target !== this.selectedTransition.transition);
            }
        },
        getTransitionsEndPoints: function(targets){
            return targets.map(
                (item) => {
                    var target = this.workflow.find((x)=>{
                        return x.name === item;
                    });
                    return target?{x: target.x, y: target.y, name: target.name}:undefined; 
                }
            );
        },
        init: function (canvas, workflow) {
            this.context = canvas.getContext("2d");
            this.workflow = workflow;
            this.loadTransitionList();
            canvas.width = CANVAS_SIZE.width;
            canvas.height = CANVAS_SIZE.height;
        },
        isANodeSelected: function(){
            return this.selectedItem !== undefined;
        },
        loadTransitionList: function(){
             this.transitionList = [];
             for (var idx = 0; idx < this.workflow.length; idx++) {
                var item = this.workflow[idx];
                var transitionsPoints = this.getTransitionsEndPoints(item.targets);
                this.transitionList = this.transitionList.concat(transitionsPoints.map(
                    (transition) => {
                        return {
                            node:item, transition:transition 
                        };
                }));
            }
        },
        render: function(){
            this.context.clearRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);
            this.loadTransitionList();
            for (var idx = 0; idx < this.workflow.length; idx++) {
                var item = this.workflow[idx];
                var selectedTarget = "";
                var transitionsPoints = this.getTransitionsEndPoints(item.targets);

                if(WorkflowEngine.ui.currentMode === UI_ACTION_MODE.TRANSITION_SELECT && item === this.selectedTransition.node){
                    selectedTarget = this.selectedTransition.transition;
                }

                drawTransitions(this.context, item.x, item.y, transitionsPoints, selectedTarget);
                drawShape(this.context, item.x, item.y, item.type, item===this.selectedItem);
            }
        },
        selectItem: function(x, y){
            this.selectedItem = this.workflow.find(
                (item)=>{
                    return (item.x - DEFAULT_SHAPE_SIZE.width/2) <= x && (item.x + DEFAULT_SHAPE_SIZE.width/2) >= x &&
                        (item.y - DEFAULT_SHAPE_SIZE.height/2) <= y && (item.y + DEFAULT_SHAPE_SIZE.height/2) >= y; //+100 LEGEND
                });
            return this.selectedItem;
        }
    };

    WorkflowEngine.init(canvas, demoWorkflowNodes);
    WorkflowEngine.render();
    
    //HELPER
    window.WorkflowEngine = WorkflowEngine;
}(document.getElementById("canvas")));
