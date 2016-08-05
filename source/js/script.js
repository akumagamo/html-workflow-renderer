"use strict";

(function(canvas){
    const DEFAULT_SHAPE_SIZE = { width: 50, height: 20 };
    const SHAPES = { STATE: 0, TASK: 1, CONDITIONAL: 2, FORK: 3, JOIN: 4 };
    const COLORS = { SELECTED_SHAPE: "gray" };
    const QUANDRANTS = { Q0: 0, Q1: 1, Q2: 2, Q3: 3, VERTICAL: 4, HORIZONTAL: 5 };
    const TRANSITION = { COLOR: "black", SELECTED_COLOR: "red", ARROW_SIZE: 5, ARROW_FILL_COLOR: "white", ARROW_IS_FILL_STYLE: true };
    const CANVAS_SIZE = {width: 500, height:500}; 

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
                break;
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
                break;
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
                break;
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
                break;
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

    function calculateYCoordinate(px1, py1, px2, py2, x ){
        var divisor = (px2 - px1);
        var k = (py2-py1) / (px2 - px1);
       
        return (x - px2) * (divisor===0?0:k) + py2;
    }

    function calculateXCoordinate(px1, py1, px2, py2, y ){
        return ( y + px2 * (py2-py1)/(px2-px1) - py2) * (px2 - px1) / (py2-py1);
    }

    function isPointOnStraight(node, transition, point){
     
        var firstIntersectionPoint = {
            x: point.x,
            y: calculateYCoordinate(transition.x, transition.y,node.x,node.y, point.x)
        };

        var secondIntersectionPoint = {
            x: calculateXCoordinate(transition.x, transition.y,node.x,node.y, point.y),
            y: point.y
        };

        if(node.x < transition.x && transition.x < point.x){
            firstIntersectionPoint = {
                x: transition.x,
                y: transition.y
            };
            firstIntersectionPoint = secondIntersectionPoint;
        } else if(node.x > transition.x && node.x < point.x){
            firstIntersectionPoint = {
                x: node.x,
                y: node.y
            };
            firstIntersectionPoint = secondIntersectionPoint;
        } else if(node.x === transition.x) {
            if(node.y < transition.y){
                if(transition.y > point.y && point.y > node.y ){
                    firstIntersectionPoint = {
                        x: node.x,
                        y: point.y
                    };
                    secondIntersectionPoint = {
                        x: node.x,
                        y: point.y
                    };
                }else{
                    firstIntersectionPoint = {
                        x: node.x,
                        y: node.y
                    };
                    secondIntersectionPoint = {
                        x: node.x,
                        y: transition.y
                    };
                }
            }
            else {
                if( node.y > point.y  && point.y > transition.y   ){
                    firstIntersectionPoint = {
                        x: node.x,
                        y: point.y
                    };
                    secondIntersectionPoint = {
                        x: node.x,
                        y: point.y
                    };
                }else{
                    firstIntersectionPoint = {
                        x: node.x,
                        y: node.y
                    };
                    secondIntersectionPoint = {
                        x: node.x,
                        y: transition.y
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

        return (lengthVector2<5 || lengthVector1<5);
    }

    function handleUIEvents(event){
        var x = event.offsetX;
        var y = event.offsetY;
        var isCtrlPressed = event.ctrlKey;

        switch(event.type){
            case "mousedown":
                WorkflowEngine.ui.clearTransitionSelection();
                if(isCtrlPressed){
                    WorkflowEngine.ui.newTransaction(x, y);
                } else {
                    WorkflowEngine.ui.beginDragging(x, y);
                    WorkflowEngine.ui.selectTransition(x, y);
                }   
                break;
            case "mousemove":
                if(WorkflowEngine.ui.isDragging){
                    WorkflowEngine.ui.dragging(x, y);
                }
                break;
            case "mouseup":
            case "mouseout":
                WorkflowEngine.ui.endDragging();
                break;

        }
    }

    canvas.addEventListener("mousedown", handleUIEvents);
    canvas.addEventListener("mousemove", handleUIEvents);
    canvas.addEventListener("mouseup", handleUIEvents);
    canvas.addEventListener("mouseout", handleUIEvents);

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

   /* var demoWorkflowNodes = [ 
        {name: "start", type: SHAPES.STATE, x:25, y:20, targets:["end"] },
        {name: "end",type: SHAPES.TASK, x:150, y:100, targets:[]}];
*/
    var WorkflowEngine = {
        ui:{
            isDragging: false,
            isTransitionStarted: false,
            selectTransition: function(x ,y){
                if(WorkflowEngine.selectedItem)
                    return;

                for(var idx = 0; idx < WorkflowEngine.transitionList.length; idx++){
                    var transition = WorkflowEngine.transitionList[idx];
                    var canSelect = isPointOnStraight(
                        transition.node, 
                        transition.transition,
                        { x: x, y: y}
                    );
                    if(canSelect){
                        WorkflowEngine.selectedTransition = {node: transition.node, transition: transition.transition.name};
                        break;
                    }
                }
                WorkflowEngine.render();
            },
            newTransaction: function(x, y){
                var selectedItem = WorkflowEngine.selectItem(x, y);

                canvas.style.cursor = "crosshair";
                WorkflowEngine.ui.clearDragging();

                if(WorkflowEngine.ui.isTransitionStarted){ 
                    if(selectedItem!==undefined){
                        WorkflowEngine.ui.transitionStartItem.targets.push(selectedItem.name);
                    }
                    WorkflowEngine.ui.clearTransition();
                } else {
                    if(selectedItem!==undefined){
                        WorkflowEngine.ui.transitionStartItem = selectedItem;
                        WorkflowEngine.ui.isTransitionStarted = true;
                    } else{
                        WorkflowEngine.ui.clearTransition();
                    }
                }
                WorkflowEngine.render();
            },
            endDragging: function(){
                WorkflowEngine.ui.clearDragging()
            },
            beginDragging: function(x, y){
                WorkflowEngine.ui.clearTransition();
                WorkflowEngine.ui.dragItem = WorkflowEngine.selectItem(x, y);
                WorkflowEngine.ui.isDragging = WorkflowEngine.ui.dragItem !== undefined;
                WorkflowEngine.render();
            },
            dragging: function(x, y){
                WorkflowEngine.ui.dragItem.x = event.x;
                WorkflowEngine.ui.dragItem.y = event.y;
                WorkflowEngine.render();
            },
            clearDragging: function(){
                WorkflowEngine.ui.isDragging = false;
                delete WorkflowEngine.ui.dragItem;
            },
            clearTransition: function(){
                canvas.style.cursor = "default";
                WorkflowEngine.ui.isTransitionStarted = false;
                delete WorkflowEngine.ui.transitionStartItem;
                delete WorkflowEngine.selectedItem;
            },
            clearTransitionSelection: function(){
                delete WorkflowEngine.selectedTransition;
            }
        },
        init: function (canvas, workflow) {
            canvas.width = CANVAS_SIZE.width;
            canvas.height = CANVAS_SIZE.height;
            this.workflow = workflow;
            this.loadTransitionList();
            this.context = canvas.getContext("2d");
        },
        selectItem: function(x, y){
            this.selectedItem = this.workflow.find(
                (item)=>{
                    return (item.x - DEFAULT_SHAPE_SIZE.width/2) <= x && (item.x + DEFAULT_SHAPE_SIZE.width/2) >= x &&
                        (item.y - DEFAULT_SHAPE_SIZE.height/2) <= y && (item.y + DEFAULT_SHAPE_SIZE.height/2) >= y; //+100 LEGEND
                });
            return this.selectedItem;
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
        createNewNode: function(node){
            this.workflow.push(node);
        },
        render: function(){
            this.context.clearRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);
            this.loadTransitionList();
            for (var idx = 0; idx < this.workflow.length; idx++) {
                var item = this.workflow[idx];
                var selectedTarget = "";
                var transitionsPoints = this.getTransitionsEndPoints(item.targets);

                if(this.selectedTransition && item === this.selectedTransition.node){
                    selectedTarget = this.selectedTransition.transition;
                }

                drawTransitions(this.context, item.x, item.y, transitionsPoints, selectedTarget);
                drawShape(this.context, item.x, item.y, item.type, item===this.selectedItem);
            }
        },
        getTransitionsEndPoints: function(targets){
            return targets.map(
                (item) => {
                    var target = this.workflow.find((x)=>{
                        return x.name === item;
                    });
                    return {x: target.x, y: target.y, name: target.name}; 
                }
            );
        }
    };

    WorkflowEngine.init(canvas, demoWorkflowNodes);
    WorkflowEngine.render();
    window.w = WorkflowEngine;
}(document.getElementById("canvas")));