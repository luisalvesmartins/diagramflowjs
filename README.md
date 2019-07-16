# diagramflowjs
A light javascript library to interactively create diagram flows or flowcharts.

Play with it here: https://lambot.blob.core.windows.net/github/diagramflowjs/index.html 

No jquery or external libraries dependencies.

Model can be extended by creating your own figures.

![sample](./sample.png)

A node is added by defining the anchors and the image render:

`````javascript
//Typical anchors for a square object
var anchors=[
    new model.anchor(0,0,"nw-resize"),
    new model.anchor(.5,0,"n-resize",true),
    new model.anchor(1,0,"ne-resize"),
    new model.anchor(0,.5,"w-resize",true),
    new model.anchor(1,.5,"e-resize",true),
    new model.anchor(0,1,"sw-resize"),
    new model.anchor(.5,1,"s-resize",true),
    new model.anchor(1,1,"se-resize")
];

//or use the default anchors (easier,eh?)
anchors=model.defaultAnchors("Rectangle");

//add the node
model.addNode(
    new model.node(x,y, width,height, anchors, text, color, renderFunction, customProperties)
    );
`````

Example of a renderFunction for a rectangle:

`````javascript
    Rectangle:function(ctx,node){ // ctx and node object
        ctx.beginPath();
        ctx.fillStyle=node.fillStyle; //node object props: fillStyle,x,y,w,h,text, data
        ctx.strokeStyle="blue";
        ctx.fillRect(node.x, node.y, node.w, node.h);
        ctx.fillStyle="black";
        ctx.font="10px Verdana";
        ctx.textBaseline="top";
        node.textfill(ctx); //render the text automatically in the bounding box
    }
`````

A link is added by calling

`````javascript
model.addLink(new model.link( fromNode, toNode, anchorFrom, anchorTo, text));
`````

Check the demo index.html page for a running example