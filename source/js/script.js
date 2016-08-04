"use strict";

(function(canvas){
    const DEFAULT_SHAPE_SIZE = { width: 50, height: 20 };
    const SHAPES = { STATE: 0, TASK: 1, CONDITIONAL: 2, FORK: 3, JOIN: 4 };
    const QUANDRANTS = { Q0: 0, Q1: 1, Q2: 2, Q3: 3, VERTICAL: 4, HORIZONTAL: 5 };
    const TRANSITION = { COLOR: "black", ARROW_SIZE: 5, ARROW_FILL_COLOR: "white" };
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

        context.strokeStyle = TRANSITION.COLOR;
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

        context.fillStyle = "gray";

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

    function drawTransitions(context, pointx, pointy, targets){
        context.strokeStyle = TRANSITION.COLOR;
        for (var idx = 0; idx < targets.length; idx++) {
            var target = targets[idx];
            var startPoint = calculateNewTransitionPoint(pointx, pointy, target.x, target.y);
            var endPoint = calculateNewTransitionPoint(target.x, target.y, pointx, pointy);
            drawLine(context, startPoint.x, startPoint.y, endPoint.x, endPoint.y);
            drawArrow(context, startPoint.x, startPoint.y, endPoint.x, endPoint.y, true);
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
        var k = (py2-py1) / (px2 - px1);
        return (x -px2) * k + py2;
    }

    function calculateXCoordinate(px1, py1, px2, py2, y ){
        //var k = (py2-py1) / (px2 - px1);
        return ( y + px2 * (py2-py1)/(px2-px1) - py2) * (px2 - px1) / (py2-py1);
    }

    function isPointOnStraight(startpoint, endpoint, checkpoint){
return;
        var hy1 =  calculateYCoordinate( startpoint.x, startpoint.y - 3, endpoint.x, endpoint.y - 3, checkpoint.x );
        var hy2 =  calculateYCoordinate( startpoint.x, startpoint.y + 3, endpoint.x, endpoint.y + 3, checkpoint.x );

        var hx1 =  calculateXCoordinate( startpoint.x - 3, startpoint.y, endpoint.x - 3, endpoint.y, checkpoint.y );
        var hx2 =  calculateXCoordinate( startpoint.x + 3, startpoint.y, endpoint.x + 3, endpoint.y, checkpoint.y );

    //console.info(hx1, hy1, hx2, hy2, checkpoint.x, checkpoint.y);
if(hy1 <= checkpoint.y && hy2 >= checkpoint.y)
            console.info("1");

            if(hx1 <= checkpoint.x && hx2 >= checkpoint.x)
            console.info("2");

        if(hy1 <= checkpoint.y && hy2 >= checkpoint.y && hx1 <= checkpoint.x && hx2 >= checkpoint.x){
            console.info("FOUND");
        }

        /*
        
y = x*k +c;


(spy2 - spy1)/(spx2 - spx1) = k

spy2 - spx2 * (spy2-spy1)/(spx2-spx1) =  c

y = x * (spy2 - spy1)/(spx2 - spx1) + spy2 - spx2 * (spy2-spy1)/(spx2-spx1);

x = (y + spx2 * (spy2-spy1)/(spx2-spx1) - spy2) * (spx2 - spx1) / (spy2 - spy1);


//y = x * (spy2 - spy1)/(spx2 - spx1) + spy2 - spx2 * (spy2-spy1)/(spx2-spx1);

 
//spy2 = spx2 * (spy2-spy1)/(spx2-spx1) + c 
//spy2 = spx2 * k + spy1 - spx1 * k




         */

    }

    canvas.addEventListener("mousedown", function(event){
        if(event.ctrlKey){
            WorkflowEngine.ui.newTransaction(event.x , event.y);
        } else {
            WorkflowEngine.ui.beginDragging(event.x , event.y);
            //WorkflowEngine.selectTransition(event.x , event.y);
        }       
    });

    canvas.addEventListener("mousemove", function(event){
        if(WorkflowEngine.ui.isDragging){
            WorkflowEngine.ui.dragging(event.x, event.y)
        }
    });

    canvas.addEventListener("mouseup", function(event){
        if(!event.ctrlKey){
            WorkflowEngine.ui.endDragging();
        }
    });

    canvas.addEventListener("mouseout", function(event){
        if(!event.ctrlKey){
            WorkflowEngine.ui.endDragging();
        }
    });

// HELPER

    var helper = 0;

    canvas.addEventListener("dblclick", function(event){
        WorkflowEngine.createNewNode({name: "created " + (helper++) , type: SHAPES.STATE, x:event.x, y:event.y, targets:[] });
        WorkflowEngine.render();
    });

    window.collisionList = []; 

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

    var WorkflowEngine = {
        ui:{
            isDragging: false,
            isTransitionStarted: false,
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
                WorkflowEngine.ui.dragItem.x = event.x;// LEGEND - 100;
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
            }
        },
        init: function (canvas, workflow) {
            canvas.width = CANVAS_SIZE.width;
            canvas.height = CANVAS_SIZE.height;
            this.workflow = workflow;
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
        selectTransition: function(x ,y){
         return;
            for(var idx=0; idx<window.collisionList.length; idx++){
                var transition = window.collisionList[idx];
                console.info("---");
                isPointOnStraight({x:transition.startx, y:transition.starty},{x:transition.endx, y:transition.endy}, {x:x, y:y})
                console.info("---");
            }
        },
        createNewNode: function(node){
            this.workflow.push(node);
        },
        render: function(){
            this.context.clearRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);
            //window.collisionList = [];
            for (var idx = 0; idx < this.workflow.length; idx++) {
                var item = this.workflow[idx];
                var transitionsPoints = this.getTransitionsEndPoints(item.targets);

               /* window.collisionList = window.collisionList.concat(transitionsPoints.map(
                    (trans) => {
                        return {
                            startx: item.x, starty: item.y, endx: trans.x, endy: trans.y
                        };
                }));*/
                drawTransitions(this.context, item.x, item.y, transitionsPoints); //+100 LEGEND
                drawShape(this.context, item.x, item.y, item.type, item===this.selectedItem); //+100 LEGEND
            }
             //drawLegend(this.context);
        },
        getTransitionsEndPoints: function(targets){
            return targets.map(
                (item) => {
                    var target = this.workflow.find((x)=>{
                        return x.name === item;
                    });
                    return {x: target.x, y: target.y, name: target.name}; //+100 LEGEND
                }
            );
        }
    };

    WorkflowEngine.init(canvas, demoWorkflowNodes);
    WorkflowEngine.render();

    function drawLegend(context){
        var x = DEFAULT_SHAPE_SIZE.width + 5;
        var y = DEFAULT_SHAPE_SIZE.height;

        context.strokeStyle = "black";
        context.rect(5, 5, DEFAULT_SHAPE_SIZE.width*2 -10, CANVAS_SIZE.height -10);
        context.stroke();

        for(var shapeName in SHAPES){
            drawShape(context, x, y, SHAPES[shapeName]);
            y += DEFAULT_SHAPE_SIZE.height * 1.5;
        }
    }

}(document.getElementById("canvas")));