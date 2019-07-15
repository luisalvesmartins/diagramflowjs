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
    new anchor(0,0,"nw-resize"),
    new anchor(.5,0,"n-resize",true),
    new anchor(1,0,"ne-resize"),
    new anchor(0,.5,"w-resize",true),
    new anchor(1,.5,"e-resize",true),
    new anchor(0,1,"sw-resize"),
    new anchor(.5,1,"s-resize",true),
    new anchor(1,1,"se-resize"), 
    new anchor(.5,.5,"move")
];
//add the node
model.addNode(
    new node(x,y, width,height, anchors, text, color, renderFunction)
    );
`````

Example of a renderFunction for a rectangle:

`````javascript
    Rectangle:function(ctx){ //only variable passed: ctx
        ctx.beginPath();
        ctx.fillStyle=this.fillStyle; //object props: fillStyle,x,y,w,h,text
        ctx.strokeStyle="blue";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle="black";
        ctx.font="10px Verdana";
        ctx.textBaseline="top";
        this.textfill(ctx); //render the text automatically in the bounding box
    }
`````

A link is added by calling

`````javascript
model.addLink(new link( fromNode, toNode, anchorFrom, anchorTo, text));
`````

Check the demo index.html page for a running example