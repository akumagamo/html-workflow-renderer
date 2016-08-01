"use strict";

(function(canvas){
    const DEFAULT_SHAPE_SIZE = { width: 50, height: 20 };
    const SHAPES = {STATE: 0, TASK: 1, CONDITIONAL: 2, FORK: 2, JOIN: 2,};
    const QUANDRANTS = {Q0: 0, Q1: 1, Q2: 2, Q3: 3, VERTICAL: 4, HORIZONTAL: 5};

    const ARROW_SIZE = 5;

    var context = canvas.getContext("2d");

    canvas.width = 400;
    canvas.height = 400;

    var workflowNodes = /* [
        { name: "state1", type: "state", x: 50, y: 150, targets: ["state2"], isStartState: true },
        { name: "state2", type: "state", x: 250, y:  150, targets: [], isStartState: false, isEndState: true }
    ];*/
     [ 
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
        init: function (context, workflow) {
            this.workflow = workflow;
            this.context = context;
        },
        render: function(){
            this.context.clearRect(0, 0, 300, 300);
            for (var idx = 0; idx < this.workflow.length; idx++) {
                var item = this.workflow[idx];
                var transitionsPoints = this.getTransitionsEndPoints(item.targets);
                drawTransitions(this.context, item.x, item.y, transitionsPoints);
                drawShape(this.context, item.x, item.y, item.type);
            }
        },
        getTransitionsEndPoints: function(targets){
            return targets.map(
                (item) => {
                    var target = this.workflow.find((x)=>{
                        return x.name === item;
                    });
                    return {x: target.x, y: target.y};
                }
            );
        }
    };

    function getQuadrant(pointx, pointy, targetx, targety) {
        var quadrant;
        if (pointx < targetx  && pointy >= targety) {
            quadrant = QUANDRANTS.Q0;
        } else if (pointx <= targetx  && pointy < targety) {
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

    function drawShapex(context, x, y){
        var topLeft = {
            x: x - DEFAULT_SHAPE_SIZE.width / 2,
            y: y - DEFAULT_SHAPE_SIZE.height / 2
        };
        context.strokeStyle = "gray";
        context.strokeRect(topLeft.x, topLeft.y, DEFAULT_SHAPE_SIZE.width, DEFAULT_SHAPE_SIZE.height);
    }

    function drawShape(context, x, y, type){
        var topLeft = {
            x: x - DEFAULT_SHAPE_SIZE.width / 2,
            y: y - DEFAULT_SHAPE_SIZE.height / 2
        };  

        var height = DEFAULT_SHAPE_SIZE.height;
        var width = DEFAULT_SHAPE_SIZE.width;

         switch(type){
            case 0:  // flowchart Start / Stop
                var radius = height/2;
                context.beginPath();
                context.strokeStyle = "green";
                context.arc(topLeft.x + radius, topLeft.y + radius, radius,   1/2*Math.PI , -1/2*Math.PI);
                context.lineTo(topLeft.x + width - radius, topLeft.y);
                context.arc(topLeft.x + width - radius, topLeft.y + radius, radius, -1/2*Math.PI, 1/2*Math.PI);
                context.closePath();
                context.stroke();
                break;
            case 1: // flowchart OPERATION
                context.strokeStyle = "gray";
                context.strokeRect(topLeft.x, topLeft.y, width, height);
                break;
            case 2: // flowchart Split
                context.strokeStyle = "red";
                context.beginPath();
                context.moveTo(topLeft.x + width/2, topLeft.y);
                context.lineTo(topLeft.x + width, topLeft.y + height/2);
                context.lineTo(topLeft.x + width / 2, topLeft.y + height);
                context.lineTo(topLeft.x , topLeft.y + height/2);
                context.closePath();
                context.stroke();
                break;
            }
    }

    function drawTransition(pointx, pointy, targetx, targety){

        var s;
        var newX;
        var newY;
        var pointSlope;
        var targetSlope = (targetx - pointx) / (targety - pointy);

        switch(getQuadrant(pointx, pointy, targetx, targety)){
            case QUANDRANTS.Q0:
                pointSlope = 
                    ((pointx + DEFAULT_SHAPE_SIZE.width / 2) - pointx) / 
                    ((pointy - DEFAULT_SHAPE_SIZE.height / 2) - pointy);

                if(pointSlope < targetSlope){
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

                if(pointSlope > targetSlope){
                    s = (pointy + DEFAULT_SHAPE_SIZE.height/2 - pointy) / (targety - pointy) ;
                    newX = pointx + s * (targetx - pointx) ;
                    return { x: newX, y: pointy + DEFAULT_SHAPE_SIZE.height/2 };
                } else if(pointSlope < targetSlope) {
                    s = (pointx + DEFAULT_SHAPE_SIZE.width/2 - pointx) / (targetx - pointx) ;
                    newY = pointy + s * (targety - pointy) ;
                    return { x: pointx + DEFAULT_SHAPE_SIZE.width/2, y: newY };
                } else {
                    return { x: pointx, y: pointx + DEFAULT_SHAPE_SIZE.height/2};
                }
                break;
            case QUANDRANTS.Q2:
                pointSlope = 
                    ((pointx - DEFAULT_SHAPE_SIZE.width / 2) - pointx) / 
                    ((pointy + DEFAULT_SHAPE_SIZE.height / 2) - pointy);

                if(pointSlope < targetSlope) {
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

                if(pointSlope > targetSlope){
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

    function drawTransitions(context, pointx, pointy, targets){
        context.strokeStyle = "black";
        for (var idx = 0; idx < targets.length; idx++) {
            var target = targets[idx];
            var startPoint = drawTransition(pointx, pointy, target.x, target.y);
            var endPoint = drawTransition(target.x, target.y, pointx, pointy);
            context.beginPath();
            context.moveTo( startPoint.x, startPoint.y );
            context.lineTo( endPoint.x, endPoint.y );
            context.stroke();
            drawArrow(context, startPoint.x, startPoint.y, endPoint.x, endPoint.y);
        }
    }

     function drawArrow (context, fromx, fromy, tox, toy) {
      var arrowSize = ARROW_SIZE;
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
      
      context.strokeStyle = "black";
      context.beginPath();
      context.moveTo(tox + x2, toy + y2);
      context.lineTo(tox, toy);
      context.lineTo(tox + x1 , toy + y1);
     /* if(fullarrow){
        ctx.fillStyle = "white";
        ctx.closePath();
        ctx.fill();
      }*/
      context.stroke();
    }

    function calculateVectorLength (x, y) {
        return Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
    }

    WorkflowEngine.init(context, workflowNodes);
    WorkflowEngine.render();

    function tester(){
        const HELPER_HEIGHT = 250;
        const HELPER_WIDTH = 250;
        var currentheight = HELPER_HEIGHT;
        var currentweight = HELPER_WIDTH;
        var modifyHeight = true;
        var rotationCount = 0;
        
        window.interval = setInterval( () => {       
            if(modifyHeight){
                WorkflowEngine.workflow[rotationCount%2===0?0:1].y = HELPER_HEIGHT - currentheight;
                WorkflowEngine.workflow[rotationCount%2===0?1:0].y = currentheight;
                WorkflowEngine.render();
                currentheight -= 10;
                if(currentheight<50){
                    modifyHeight = false;
                    currentweight = HELPER_HEIGHT -50 ;
                }
            } else {
                WorkflowEngine.workflow[rotationCount%2===0?0:1].x = HELPER_WIDTH - currentweight;
                WorkflowEngine.workflow[rotationCount%2===0?1:0].x = currentweight;
                WorkflowEngine.render();
                currentweight -= 10;
                if(currentweight < 50){
                    modifyHeight = true;
                    currentheight = HELPER_HEIGHT -50;
                    rotationCount++;
                }
            }
        }, 100);
    }
  // tester();

}(document.getElementById("canvas")));
