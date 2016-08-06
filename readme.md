# Worflow Render Engine
## Versionnumber 0.1.0 (2016-08-06) Alpha
(***Documentation last update 2016-08-06 15:30***)  

Workflow Render Engine (eventually for Liferay) 

![Screenshot from a workflow](https://raw.githubusercontent.com/akumagamo/html-workflow-renderer/master/readme/screenshot_01.png "Screenshot from a workflow")

## Features
* Render Workflow 
    * from JSON on HTML canvas
* Create new Transitions
* Select Transistion
* Select Node 
* Delete Transitions
* Delete Nodes
* Move Nodes

## Roadmap / Future Features
* Load XML (Liferay Style)
* Save XML (Liferay Style)
* Add Labels
  * for Shapes
  * for Transitions
* New Shapes 
  * Better Graphics
  * Other Functions
* Update the Element Values
  * Names
  * Scripts
  * ...
* Bend Transitions
* Automatic Layouting support

## Known Bugs
* Sometimes Selection of Transitions occures, after the end of the straight

## SourceControl Link & Information
https://github.com/akumagamo/html-workflow-renderer.git

## Documentation
1) Create JSON WorkFlow List 
1) Initialize WorkflowEngine
1) Invoke Render function 

*Here is a link to a [mini Demo](https://raw.githubusercontent.com/akumagamo/html-workflow-renderer/master/index.html)*

### Base Code Example
    var canvas = document.getElementById("canvas");
    var workflowNodes = [ 
        {name: "start", type: SHAPES.STATE, x:25, y:20, targets:["end"]},
        {name: "end",type: SHAPES.TASK, x:150, y:100, targets:[]}
    ];
    WorkflowEngine.init(canvas, workflowNodes);
    WorkflowEngine.render();

### File / Folder Structure
     +-+- workflow
       +-+- documents
       | +- ...
       +-+- readme (resources for this document)
       | +- screenshot_01.png
       +-+- source
       | +-+- js
       | | +- script.js
       | +- index.html
       +- readme.md (this document)
       +- LICENSE

### API / Commands

#### WorkflowNodes
Array of WorkflowNode

#### WorkflowNode  
    var demoNode = {
      name: "StartNode",     // Name of the Node
      type: SHAPES.STATE,    // Type of Shapes possible Options (STATE, TASK, CONDITIONAL, FORK, JOIN )
      x: 10,                 // X Coordinate oft the middle of the Node
      y: 10,                 // Y Coordinate oft the middle of the Node
      targets: ["NEXT NODE"] // list of Nodes which are connected to this Node
    }