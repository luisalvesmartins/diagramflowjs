var model={
    ctx:null,
    nodes:[],
    links:[],
    myCanvas:null,

    addNode:function(node){
        this.nodes.push(node);
    },
    addLink:function(link){
        this.links.push(link);
    },

    clean:function(){
        this.ctx.beginPath();

        var grd = this.ctx.createLinearGradient(0, this.myCanvas.height, this.myCanvas.width, 0);
        grd.addColorStop(0, "#eeeeee");
        grd.addColorStop(1, "white");

        // Fill with gradient
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(0, 0, this.myCanvas.width, this.myCanvas.height);
        this.ctx.stroke();
    },

    clear:function(){
        this.nodes=[];
        this.links=[];
    },

    draw:function(){
        this.clean();
        for (let index = 0; index < this.nodes.length; index++) {
            this.nodes[index].draw(this.ctx);
        }

        for (let index = 0; index < this.links.length; index++) {
            this.links[index].draw(this.ctx);
        }
        if (mouse.selNode!=null){
            this.nodes[mouse.selNode].highlight(this.ctx);
        }
    },
    init:function(canvasName){
        this.myCanvas=document.getElementById(canvasName);
        this.myCanvasContainer=document.getElementById(canvasName).parentElement;
        this.ctx=this.myCanvas.getContext("2d");
        this.myCanvas.addEventListener("mousedown",mouse.down)
        this.myCanvas.addEventListener("mousemove",mouse.move)
        this.myCanvas.addEventListener("mouseup",mouse.up)
        this.myCanvas.addEventListener("dblclick",mouse.dblclick)
        this.myCanvas.addEventListener("keydown",mouse.key)
        this.myCanvas.ondragstart = function() { return false; };
        this.myCanvas.width=this.myCanvasContainer.clientWidth;
        this.myCanvas.height=this.myCanvasContainer.clientHeight;

        window.addEventListener("resize",function(){
            model.myCanvas.width=model.myCanvasContainer.clientWidth;
            model.myCanvas.height=model.myCanvasContainer.clientHeight;
            model.draw();
        });

    },

    findNode:function(mouseC){
        var minArea=34435345345344;
        var selIndex=null;
        for (let index = 0; index < this.nodes.length; index++) {
            if (this.nodes[index].isInside(mouseC.x,mouseC.y))
            {
                var calcArea=this.nodes[index].w*this.nodes[index].h;
                if (calcArea<minArea)
                {
                    selIndex=index;
                    minArea=calcArea;
                }
            }
        }
        return selIndex;
    },

    copyFrom:function(sourceModel){
        model.nodes=[];
        if (sourceModel.nodes){
            for (let index = 0; index < sourceModel.nodes.length; index++) {
                const element = sourceModel.nodes[index];
                var anchors=[];
                element.anchors.forEach(a => {
                    anchors.push(new model.anchor(a.x,a.y,a.cursorClass));
                });
                model.addNode(new model.node(element.x,element.y,element.w,element.h,anchors,element.text,element.fillStyle, element.figure, element.data));
            }
        }
        model.links=[];
        if (sourceModel.links){
            for (let index = 0; index < sourceModel.links.length; index++) {
                const element = sourceModel.links[index];
    
                model.addLink(new model.link(element.from,element.to, element.anchorFrom,element.anchorTo, element.text));
            }
        }
        mouse.selNode=null;
        mouse.dragging=null;
    },

    selectNode:function(node){
        mouse.selNode=node;
        model.draw();
    },
    connector:function(x,y,mode,title,decoration,options){
        this.x=x;
        this.y=y;
        this.mode=mode;
        if (options)
            this.options=options;
        else
            this.options={dropAllowed:true, dragAllowed:true,radius:7};
        this.title=title;
        this.decoration={};
        if (decoration){
            if (decoration.fillStyle==null)
                this.decoration.fillStyle="black";
            else
                this.decoration.fillStyle=decoration.fillStyle;
            if (decoration.strokeStyle==null)
                this.decoration.strokeStyle="black";
            else
                this.decoration.strokeStyle=decoration.strokeStyle;
            if (decoration.highlightStrokeStyle==null)
                this.decoration.highlightStrokeStyle="black";
            else
                this.decoration.highlightStrokeStyle=decoration.highlightStrokeStyle;
            if (decoration.highlightText==null)
                this.decoration.highlightText="black";
            else
                this.decoration.highlightText=decoration.highlightText;
        }
        this.draw=function(ctx,originX,originY,width,height){
            ctx.beginPath();
            ctx.lineWidth=1;
            ctx.fillStyle=this.decoration.fillStyle;
            ctx.strokeStyle = this.decoration.strokeStyle;
            ctx.arc(this.x*width+originX,this.y*height+originY,this.options.radius,0,2*Math.PI,false);
            ctx.fill();
            ctx.stroke();
        }
        this.highlight=function(ctx,originX,originY,width,height){
            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle = this.decoration.highlightStrokeStyle;
            var oX=this.x*width+originX;
            var oY=this.y*height+originY;
            ctx.arc(oX,oY,this.options.radius+2,0,2*Math.PI,false);
            ctx.stroke();
            if (this.title!=null)
            {
                ctx.fillStyle = this.decoration.highlightText;
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.fillText(this.title,oX,oY+this.options.radius+2);
            }
        }
        this.distance=function(x,y,originX,originY,width,height)
        {
            return (x-this.x*width-originX)*(x-this.x*width-originX) + (y-this.y*height-originY)*(y-this.y*height-originY);
        }
        this.isInside=function(x,y,originX,originY,width,height){
            var d=this.distance(x,y,originX,originY,width,height);
            if (d<=this.options.radius*this.options.radius){
                return true;
            }
            else
                return false;
        };
    },
    anchor:function(x,y,cursorClass)
    {
        this.x=x;
        this.y=y;
        this.radius=5;
        this.cursorClass=cursorClass;
        this.strokeStyle="gray";
        this.strokeStyleHighlight="red";

        this.draw=function(ctx,originX,originY,width,height){
            ctx.beginPath();
            ctx.strokeStyle = this.strokeStyle;
            ctx.lineWidth=1;
            ctx.rect(x*width+originX-this.radius,y*height+originY-this.radius,this.radius*2,this.radius*2);
            ctx.stroke();
        }
        this.highlight=function(ctx,originX,originY,width,height){
            ctx.beginPath();
            ctx.strokeStyle = this.strokeStyleHighlight;
            var r=this.radius*1.5;
            ctx.rect(x*width+originX-r,y*height+originY-r,r*2,r*2);
            ctx.stroke();
        }
        this.distance=function(x,y,originX,originY,width,height)
        {
            return (x-this.x*width-originX)*(x-this.x*width-originX) + (y-this.y*height-originY)*(y-this.y*height-originY);
        }
        this.isInside=function(x,y,originX,originY,width,height){
            var d=this.distance(x,y,originX,originY,width,height);
            if (d<=this.radius*this.radius){
                return true;
            }
            else
                return false;
        };
    },
    node:function(x,y,w,h,connectors,text,fillStyle,figure,args)
    {
        this.textfill=function(ctx) {
            var fontSize   =  12;
            var lines      =  new Array();
            var width = 0, i, j;
            var result;
            var color = this.strokeStyle || "white";
            var text=this.text;
            var max_width=this.w;

            // Font and size is required for ctx.measureText()
            ctx.textAlign = "left";
            ctx.font   = fontSize + "px Arial";

            ctx.textAlign="center";
            // Start calculation
            while ( text.length ) {
                for( i=text.length; ctx.measureText(text.substr(0,i)).width > max_width-14; i-- );
            
                result = text.substr(0,i);
            
                if ( i !== text.length )
                    for( j=0; result.indexOf(" ",j) !== -1; j=result.indexOf(" ",j)+1 );
                
                lines.push( result.substr(0, j|| result.length) );
                width = Math.max( width, ctx.measureText(lines[ lines.length-1 ]).width );
                text  = text.substr( lines[ lines.length-1 ].length, text.length );
            }
            
            ctx.font   = fontSize + "px Arial";

            // Render
            ctx.fillStyle = color;
            var vOffSet=(this.h-(lines.length+1)*(fontSize+5))/2-5;
            for ( i=0, j=lines.length; i<j; ++i ) {
                ctx.fillText( lines[i], this.x+this.w/2 , this.y + 5 + fontSize + (fontSize+5) * i + vOffSet );
            }
        }

        this.x=Number(x);
        this.y=Number(y);
        this.w=Number(w);
        this.h=Number(h);
        this.data=args;
        this.connectors=connectors;
        this.anchors=[
            new model.anchor(0,0,"nw-resize"),
            new model.anchor(.5,0,"n-resize"),
            new model.anchor(1,0,"ne-resize"),
            new model.anchor(1,.5,"e-resize"),
            new model.anchor(1,1,"se-resize"), 
            new model.anchor(.5,1,"s-resize"),
            new model.anchor(0,1,"sw-resize"),
            new model.anchor(0,.5,"w-resize"),
        ];
        this.strokeStyle="black";
        this.fillStyle=fillStyle;
        this.text=text;
        this.figure=figure;
        this.draw=function(ctx){
            if (typeof (this.figure)==="undefined" || typeof (this.figure)==="function"){
                this.figure="Rectangle";
            }
            else
                Figures[this.figure](ctx,this);
            if (this.connectors!=null)
            {
                this.connectors.forEach(connector=>{
                    connector.draw(ctx,this.x,this.y,this.w,this.h);
                });
            }
        };
        this.connectorCoords=function(connectorIndex){
            return {x:this.x+this.connectors[connectorIndex].x*this.w,
                    y:this.y+this.connectors[connectorIndex].y*this.h};
        }
        this.anchorCoords=function(anchorIndex){
            return {x:this.x+this.anchors[anchorIndex].x*this.w,y:this.y+this.anchors[anchorIndex].y*this.h};
        }
        this.isInside=function(x,y){
            if (x>=this.x && x<=this.x+this.w && y>=this.y && y<=this.y+this.h)
                return true;
            else
                return false;
        };
        this.isInsideConnectors=function(point){
            if (this.connectors)
                for (let index = 0; index < this.connectors.length; index++) {
                    const element = this.connectors[index];
                    if (element.isInside(point.x,point.y,this.x,this.y,this.w,this.h))
                    {
                        return index;
                    }
                }
            return null;
        };
        this.isInsideAnchors=function(x,y){
            for (let index = 0; index < this.anchors.length; index++) {
                const element = this.anchors[index];
                if (element.isInside(x,y,this.x,this.y,this.w,this.h))
                {
                    return index;
                }
            }
            return null;
        };
        this.nearestAnchor=function(mouseC){
            var dMin=999999;
            var sel=null;
            for (let index = 0; index < this.anchors.length; index++) {
                const element = this.anchors[index];
                var d=element.distance(mouseC.x,mouseC.y,this.x,this.y,this.w,this.h);
                if (d<dMin && element.cursorClass!="move")
                {
                    dMin=d;
                    sel=index;
                }
            }
            return sel;
        };
        this.highlight=function(ctx){
            this.anchors.forEach(element => {
                element.draw(ctx,this.x,this.y,this.w,this.h);
            });
        }
    },
    link:function(from,to,anchorIndexFrom,anchorIndexTo,text,mode){
        this.directionToVector=function(cursorClass){
            switch (cursorClass) {
            case "w-resize":
                return {x:-1,y:0};
            case "e-resize":
                return {x:1,y:0};
            case "s-resize":
                return {x:0,y:1};
            case "n-resize":
                return {x:0,y:-1};
            case "ne-resize":
                return {x:1,y:-1};
            case "nw-resize":
                return {x:-1,y:-1};
            case "se-resize":
                return {x:1,y:1};
            case "sw-resize":
                return {x:-1,y:1};
            }
        }
    
        this.from=from;
        this.to=to;
        this.anchorFrom=anchorIndexFrom;
        this.anchorTo=anchorIndexTo;
        this.segments=[];
        this.strokeStyle="black";
        this.strokeStyleHighlight="red";
        this.indexText=0;
        this.text=text;
        if (mode!=null)
            this.mode=mode.toLowerCase();
        else
            this.mode="straight";
    
        this.reSegment=function(){
            if (this.mode=="straight" || this.mode==null)
            {
                var aC1=model.nodes[this.from].connectorCoords(this.anchorFrom);
                var aC2=model.nodes[this.to].connectorCoords(this.anchorTo);
                this.segments=[{x:aC1.x,y:aC1.y},{x:aC2.x,y:aC2.y}];
                this.indexText=1;
            }
            else
            {
                this.segments=[];
                var aC1=model.nodes[this.from].connectorCoords(this.anchorFrom);
                var aC2=model.nodes[this.to].connectorCoords(this.anchorTo);

                this.segments.push({x:aC1.x,y:aC1.y});
                var d1={};
                var d2={};
                if (this.mode=="square")
                {
                    var x1=model.nodes[this.from].connectors[this.anchorFrom].x-.5;
                    var y1=model.nodes[this.from].connectors[this.anchorFrom].y-.5;
                    if (Math.abs(x1)>Math.abs(y1))
                        y1=0;
                    else
                        x1=0;
                    d1.x=Math.sign(x1);
                    d1.y=Math.sign(y1);

                    var x1=model.nodes[this.to].connectors[this.anchorTo].x-.5;
                    var y1=model.nodes[this.to].connectors[this.anchorTo].y-.5;
                    //console.log(x1 + " " + y1);
                    if (Math.abs(x1)>Math.abs(y1))
                        y1=0;
                    else
                        x1=0;
                    d2.x=Math.sign(x1);
                    d2.y=Math.sign(y1);
                    //console.log(d2)

                    // var dxm=(aC1.x+aC2.x)/2;
                    // var dym=(aC1.y+aC2.y)/2;
                    // this.segments.push({x:dxm,y:aC1.y});
                    // this.segments.push({x:dxm,y:aC2.y});
    
    
                    // this.segments.push({x:aC2.x,y:aC2.y});

                }
                else
                {
                    d1=this.directionToVector(model.nodes[from].connectors[this.anchorFrom].cursorClass);
                    d2=this.directionToVector(model.nodes[to].connectors[this.anchorTo].cursorClass);
                }
                    //FIRST
                    aC1.x+=10*d1.x;
                    aC1.y+=10*d1.y;
                    this.segments.push({x:aC1.x,y:aC1.y});

                    var origaC2x=aC2.x;
                    var origaC2y=aC2.y;
                    aC2.x+=10*d2.x;
                    aC2.y+=10*d2.y;
                    this.segments.push({x:aC2.x,y:aC2.y});

                    var dx=Math.abs(aC1.x-aC2.x);
                    var dy=Math.abs(aC1.y-aC2.y);
                    var nX,nY;
                    if (dx>dy)
                    {
                        if (Math.sign(aC2.y-aC1.y)!=Math.sign(d1.y))
                        {
                            nX=aC2.x;
                            nY=aC1.y;
                        }
                        else
                        {
                            nX=aC1.x;
                            nY=aC2.y;
                        }
                    }
                    else
                    {
                        if (Math.sign(aC2.x-aC1.x)!=Math.sign(d1.x))
                        {
                            nX=aC2.x;
                            nY=aC1.y;
                        }
                        else
                        {
                            nX=aC1.x;
                            nY=aC2.y;
                        }
                    }
                    var lastP;
                    if (Math.sign(nY-aC1.y)!=Math.sign(d1.y) && nY!=aC1.y)
                    {
                        // if (this.checkConflict(aC1.x,aC1.y, aC2.x,aC1.y,model.nodes[from]))
                        //     console.log("conflict");
        
                        lastP={x:aC2.x,y:aC2.y}
                        this.segments.push(lastP);
                        //this.segments.push({x:nX,y:dym});
                    }
                    else
                    {
                        if (Math.sign(nX-aC1.x)!=Math.sign(d1.x) && nX!=aC1.x && Math.sign(d1.x)!=0)
                        {
                            if (aC2.y<aC1.y)
                                var dym=aC1.y-model.nodes[from].h/2 - 10;
                            else
                                var dym=aC1.y+model.nodes[from].h/2 + 10;
                            if (this.checkConflict(aC1.x,aC1.y, aC1.x,dym,model.nodes[from]))
                                console.log("conflict");
                            this.segments.push({x:aC1.x,y:dym});
                            if (this.checkConflict(aC1.x,dym,nX,dym,model.nodes[from]))
                                console.log("conflict");
                            lastP={x:nX,y:dym}
                            this.segments.push(lastP);
                        }
                        else{
                            if (Math.sign(aC2.y-nY)==Math.sign(d2.y))
                            {
                                //console.log("B")
                                var dxm=(nX+aC1.x)/2;
                                if (this.checkConflict(aC1.x,aC1.y, dxm,nY,model.nodes[from]))
                                    console.log("conflict");
                                this.segments.push({x:dxm,y:nY});
                                if (this.checkConflict(dxm,nY,dxm,aC2.y, model.nodes[from]))
                                    console.log("conflict");
                                lastP={x:dxm,y:aC2.y}
                                this.segments.push(lastP);
                            }
                            else
                            {
                                if (this.checkConflict(aC1.x,aC1.y,nX,nY, model.nodes[from]))
                                    console.log("conflict");
                                lastP={x:nX,y:nY}
                                this.segments.push(lastP);
                            }
                        }
                        var conflict=this.checkConflict(lastP.x, lastP.y,aC2.x,aC2.y, model.nodes[from])
                        switch (conflict) {
                            case "V":
                                if(lastP.x>model.nodes[from].x+model.nodes[from].w/2+10){
                                    this.segments.push({x:model.nodes[from].x+model.nodes[from].w+10,y:lastP.y});
                                    this.segments.push({x:model.nodes[from].x+model.nodes[from].w+10,y:model.nodes[from].y-10});
                                    this.segments.push({x:lastP.x,y:model.nodes[from].y-10});
                                }
                                else
                                {
                                    this.segments.push({x:model.nodes[from].x-10,y:lastP.y});
                                    this.segments.push({x:model.nodes[from].x-10,y:model.nodes[from].y-10});
                                    this.segments.push({x:lastP.x,y:model.nodes[from].y-10});
                                }
                                break;
                            case "H":
                                console.log("H")
                                break;
                            default:
                                break;
                        }
                        this.segments.push({x:aC2.x,y:aC2.y});
            
            
                    }
                this.segments.push({x:origaC2x,y:origaC2y});
           
                
            }

            //LINKTEXT POSITION
            var element0 = this.segments[0];
            var maxD=0;
            this.indexText=1;
            for (let index = 1; index < this.segments.length; index++) {
                const element = this.segments[index];
                var d=Math.abs(element.x-element0.x)+Math.abs(element.y-element0.y);
                if (d>maxD){
                    maxD=d;
                    this.indexText=index;
                }
                element0=element;
            }

        }    
    
        this.checkConflict=function(x1,y1,x2,y2,node){
            if (x1==x2){
                //V
                var nY1=y1;
                var nY2=y2;
                if (y1>y2)
                {
                    nY1=y2;
                    nY2=y1;
                }
                if (x1>=node.x && x1<=node.x+node.w)
                {
                    if (nY1<=node.y && nY2>=node.y)
                    {
                        return "V";
                    }
                }
            }
            else
            {
                //H
            }
            return null;
        }

        this.reSegment();
        
        this.arrow=function(context, fromx, fromy, tox, toy) {
            var headlen = 15; // length of head in pixels
            var dx = tox - fromx;
            var dy = toy - fromy;
            var angle = Math.atan2(dy, dx);
            context.beginPath();
            context.moveTo(fromx, fromy);
            context.lineTo(tox, toy);
            context.stroke();
            context.beginPath();
            context.fillStyle="black";
            context.moveTo(tox, toy);
            context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 10), toy - headlen * Math.sin(angle - Math.PI / 10));
            //context.moveTo(tox, toy);
            context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 10), toy - headlen * Math.sin(angle + Math.PI / 10));
            context.fill();
          }        
    
        this.draw=function(ctx){
            //PATH
            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle = this.strokeStyle;
            const element = this.segments[0];
            ctx.moveTo(element.x,element.y);
            for (let index = 1; index < this.segments.length-1; index++) {
                const element = this.segments[index];
                ctx.lineTo(element.x,element.y);
            }
            ctx.stroke();
            //TEXT
            var elementT=this.segments[this.indexText];
            var elementT0=this.segments[this.indexText-1];
            ctx.beginPath();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(this.text,(elementT.x+elementT0.x)/2,(elementT.y+elementT0.y)/2);
            ctx.fill();

            var elementT=this.segments[this.segments.length-2];
            var elementT0=this.segments[this.segments.length-1];
            this.arrow(ctx,elementT.x,elementT.y,elementT0.x,elementT0.y);
            // //ENDPOINT
            // var element1 = this.segments[this.segments.length-1];
            // ctx.beginPath();
            // ctx.fillStyle=this.strokeStyle;
            // ctx.strokeStyle = this.strokeStyle;
            // ctx.arc(element1.x,element1.y,2*2,0,2*Math.PI,false);
            // ctx.fill();
        }
        this.highlight=function(ctx){
            //SEGMENT
            ctx.beginPath();
            ctx.strokeStyle = this.strokeStyleHighlight;
            const element = this.segments[0];
            ctx.moveTo(element.x,element.y);
            for (let index = 1; index < this.segments.length; index++) {
                const element = this.segments[index];
                ctx.lineTo(element.x,element.y);
            }
            var element1 = this.segments[this.segments.length-1];
            ctx.stroke();
            //ENDPOINT
            ctx.beginPath();
            ctx.fillStyle=this.strokeStyleHighlight;
            ctx.strokeStyle = this.strokeStyleHighlight;
            ctx.arc(element1.x,element1.y,2*2,0,2*Math.PI,false);
            ctx.fill();
        }
    
        this.distance=function(a,b){
            return Math.sqrt((a.x-b.x)*(a.x-b.x) + (a.y-b.y)*(a.y-b.y));
        }
        this.isBetween=function(a,c,b){
            return this.distance(a,c)+this.distance(c,b)-this.distance(a,b)<1;
        }
        this.isOverLink=function(point){
            for (let index = 1; index < this.segments.length; index++) {
                const element = this.segments[index];
                const element0 = this.segments[index-1];
                if (this.isBetween(element0,point,element))
                    return true;
            }
            return false;
        }
    },
    defaultAnchors:function(figure)
    {
        var anchors=[];
        switch (figure) {
        case "Square":
        case "Rectangle":
        case "RoundedRectangle":
            anchors=[
                new model.anchor(0,0,"nw-resize"),
                new model.anchor(.5,0,"n-resize"),
                new model.anchor(1,0,"ne-resize"),
                new model.anchor(1,.5,"e-resize"),
                new model.anchor(1,1,"se-resize"), 
                new model.anchor(.5,1,"s-resize"),
                new model.anchor(0,1,"sw-resize"),
                new model.anchor(0,.5,"w-resize"),
            ];
            break;
        case "Circle":
            anchors=[
                new model.anchor(0,0,"nw-resize"),
                new model.anchor(.14,.14,"nw-resize"),
                new model.anchor(.5,0,"n-resize"),
                new model.anchor(.86,.14,"ne-resize"),
                new model.anchor(1,0,"ne-resize"),
                new model.anchor(1,.5,"e-resize"),
                new model.anchor(.86,.86,"se-resize"),
                new model.anchor(1,1,"se-resize"), 
                new model.anchor(.5,1,"s-resize"),
                new model.anchor(.14,.86,"sw-resize"),
                new model.anchor(0,1,"sw-resize"),
                new model.anchor(0,.5,"w-resize"),
            ];
            break;
        case "Diamond":
            anchors=[
                new model.anchor(0,0,"nw-resize"),
                new model.anchor(.5,0,"n-resize"),
                new model.anchor(1,0,"ne-resize"),
                new model.anchor(1,.5,"e-resize"),
                new model.anchor(1,1,"se-resize"), 
                new model.anchor(.5,1,"s-resize"),
                new model.anchor(0,1,"sw-resize"),
                new model.anchor(0,.5,"w-resize"),
            ];
        default:
            break;
        }
        return anchors;
    }

};
var mouse={
    dragging:false,
    dragOrigin:{},
    dragNode:null,
    selNode:null,
    selAnchor:null,
    selConnector:null,
    selLink:null,
    editText:false,
    mouseCoords:function(ev){
        var rect = model.myCanvas.getBoundingClientRect();
        return {x:ev.clientX-rect.left,y:ev.clientY-rect.top};
    },
    down:function(ev){
        if (mouse.editText)
        {
            mouse.editText=false;
            var ed=document.getElementById("tmpTextEdit");
            ed.style.display="none";
        }
        mouse.selLink=null;
        var mouseC=mouse.mouseCoords(ev);
        var newselNode=model.findNode(mouseC);

        if (mouse.selConnector!=null)
        {
            mouse.dragging="newlink";
            return
        }
        if (mouse.selAnchor!=null){
            mouse.dragging="anchor";
            model.draw();
            return;
        }
        if (newselNode!=null){
            mouse.selNode=newselNode;
            // Dispatch/Trigger/Fire the event
            var event = new CustomEvent("selectionChanged", { "detail": mouse.selNode });
            document.dispatchEvent(event);
            mouse.dragOrigin={
                    x:mouseC.x-model.nodes[mouse.selNode].x,
                    y:mouseC.y-model.nodes[mouse.selNode].y
                    };
            if (mouse.selAnchor!=null)
            {
                mouse.dragging="anchor";
                model.draw();
                return;
            }
            else{
                model.nodes[mouse.selNode].highlight(model.ctx);
                mouse.selAnchor=model.nodes[mouse.selNode].nearestAnchor(mouseC);
                mouse.dragging="move";

                this.nodesToMove=[];
                this.linksToMove=[];
                for (let j = 0; j < model.links.length; j++) {
                    const elementLinked=model.links[j];
                    if (elementLinked.to==mouse.selNode || elementLinked.from==mouse.selNode){
                        this.linksToMove.push(j);
                    }
                };

                var hostNode=model.nodes[mouse.selNode];
                for (let i = 0; i < model.nodes.length; i++) {
                    const element = model.nodes[i];
                    var elemDragOrigin={x:mouseC.x-element.x,y:mouseC.y-element.y};
    
                    if (i!=mouse.selNode && element.x>=hostNode.x && element.x+element.w<=hostNode.x+hostNode.w && element.y>=hostNode.y && element.y+element.h<=hostNode.y+hostNode.h)
                    {
                        this.nodesToMove.push({index:i,elemDragOrigin:elemDragOrigin});

                        for (let j = 0; j < model.links.length; j++) {
                            const elementLinked=model.links[j];
                            if (elementLinked.to==i || elementLinked.from==i){
                                this.linksToMove.push(j);
                            }
                        };
                    }
                }
    
            }
            model.draw();
        }
        else
        {
            if (mouse.selAnchor==null){
                //deselect
                mouse.selNode=null;
                mouse.dragging=null;

                model.draw();

                //CHECK LINKS
                for (let index = 0; index < model.links.length; index++) {
                    const element = model.links[index];
                    if (element.isOverLink({x:mouseC.x,y:mouseC.y})==true){
                        element.highlight(model.ctx);
                        mouse.dragging="linkedit";
                        mouse.selLink=index;
                        break;
                    }
                }
            }
            else{
                mouse.dragging="anchor";
                model.draw();
            }
        }

        if (mouse.dragging==null){
            mouse.dragging="all";
            this.nodesToMove=[];
            for (let i = 0; i < model.nodes.length; i++) {
                const element = model.nodes[i];
                var elemDragOrigin={x:mouseC.x-element.x,y:mouseC.y-element.y};

                this.nodesToMove.push({index:i,elemDragOrigin:elemDragOrigin});
            }

        }
        //console.log(mouse.selNode + " " + mouse.selAnchor + " " + mouse.dragging)
    },
    move:function(ev){
        var mouseC=mouse.mouseCoords(ev);
        switch (mouse.dragging) {
            case "all":
                this.nodesToMove.forEach(nodeLinked => {
                    const element = model.nodes[nodeLinked.index];
    
                    element.x=mouseC.x-nodeLinked.elemDragOrigin.x;
                    element.y=mouseC.y-nodeLinked.elemDragOrigin.y;
                });
                model.links.forEach(link => {
                    link.reSegment();
                });
                model.draw();
                break;
            case "newlink":
                model.draw();
                model.ctx.beginPath();
                var aC=model.nodes[mouse.selConnectorNode].connectorCoords(mouse.selConnector);
                model.ctx.moveTo(aC.x,aC.y);
                model.ctx.lineTo(mouseC.x,mouseC.y);
                model.ctx.stroke();
    
                mouse.linkDestNode=null;
                //CHECK DESTINATION connector
                for (let j = 0; j < model.nodes.length; j++) {
                    if (j!=mouse.selConnectorNode)
                    {
                        const element = model.nodes[j];
    
                        var i=element.isInsideConnectors(mouseC);
                        if (i!=null){
                            if (element.connectors[i].options.dropAllowed && (element.connectors[i].mode!=model.nodes[mouse.selConnectorNode].connectors[mouse.selConnector].mode || element.connectors[i].mode=="mixed"))
                            {
                                mouse.linkDestNode=j;
                                mouse.linkDestConnector=i;
                                element.connectors[i].highlight(model.ctx,element.x,element.y,element.w,element.h);
                            }
                            break;
                        }
                    }
                }
                break;
            case "move":
                model.nodes[mouse.selNode].x=mouseC.x-mouse.dragOrigin.x;
                model.nodes[mouse.selNode].y=mouseC.y-mouse.dragOrigin.y;
                
                this.nodesToMove.forEach(nodeLinked => {
                    const element = model.nodes[nodeLinked.index];
    
                    element.x=mouseC.x-nodeLinked.elemDragOrigin.x;
                    element.y=mouseC.y-nodeLinked.elemDragOrigin.y;
                });
                this.linksToMove.forEach(elementLinked => {
                    model.links[elementLinked].reSegment();
                });
                model.draw();
                break;
            case "anchor":
                switch (model.nodes[mouse.selNode].anchors[mouse.selAnchor].cursorClass) {
                    case "move":
                        model.nodes[mouse.selNode].x=mouseC.x-mouse.dragOrigin.x;
                        model.nodes[mouse.selNode].y=mouseC.y-mouse.dragOrigin.y;
                        break;
                    case "w-resize":
                        model.nodes[mouse.selNode].w= model.nodes[mouse.selNode].x-mouseC.x + model.nodes[mouse.selNode].w;
                        model.nodes[mouse.selNode].x= mouseC.x ;
                        break;
                    case "e-resize":
                        model.nodes[mouse.selNode].w= mouseC.x - model.nodes[mouse.selNode].x //- mouse.dragOrigin.x;
                        break;
                    case "ne-resize":
                        model.nodes[mouse.selNode].w= mouseC.x - model.nodes[mouse.selNode].x //- mouse.dragOrigin.x;
                        model.nodes[mouse.selNode].h= model.nodes[mouse.selNode].y-mouseC.y + model.nodes[mouse.selNode].h;
                        model.nodes[mouse.selNode].y= mouseC.y;
                        break;
                    case "se-resize":
                        model.nodes[mouse.selNode].w= mouseC.x - model.nodes[mouse.selNode].x //- mouse.dragOrigin.x;
                        model.nodes[mouse.selNode].h= mouseC.y - model.nodes[mouse.selNode].y //- mouse.dragOrigin.x;
                        break;
                    case "s-resize":
                        model.nodes[mouse.selNode].h= mouseC.y - model.nodes[mouse.selNode].y //- mouse.dragOrigin.x;
                        break;
                    case "sw-resize":
                        model.nodes[mouse.selNode].w= model.nodes[mouse.selNode].x-mouseC.x + model.nodes[mouse.selNode].w;
                        model.nodes[mouse.selNode].x= mouseC.x ;
                        model.nodes[mouse.selNode].h= mouseC.y - model.nodes[mouse.selNode].y //- mouse.dragOrigin.x;
                        break;
                    case "nw-resize":
                        model.nodes[mouse.selNode].w= model.nodes[mouse.selNode].x-mouseC.x + model.nodes[mouse.selNode].w;
                        model.nodes[mouse.selNode].x= mouseC.x ;
                        model.nodes[mouse.selNode].h= model.nodes[mouse.selNode].y-mouseC.y + model.nodes[mouse.selNode].h;
                        model.nodes[mouse.selNode].y= mouseC.y ;
                    break;            
                    case "n-resize":
                        model.nodes[mouse.selNode].h= model.nodes[mouse.selNode].y-mouseC.y + model.nodes[mouse.selNode].h;
                        model.nodes[mouse.selNode].y= mouseC.y ;
                        break;         
                    default:
                        break;
                }
    
                model.links.forEach(element => {
                    if (element.to==mouse.selNode || element.from==mouse.selNode){
                        element.reSegment();
                    }
                });
                model.draw();
                break;
            default:
                if (mouse.selNode!=null){
                    var element=model.nodes[mouse.selNode];
    
                    //in anchor
                    var i=element.isInsideAnchors(mouseC.x,mouseC.y);
                    if (i!=null){
                        mouse.selAnchor=i;
                        model.myCanvas.style.cursor=element.anchors[i].cursorClass;
                        element.anchors[i].highlight(model.ctx,element.x,element.y,element.w,element.h);
                    }
                    else{
                        if (mouse.selAnchor!=null){
                            model.draw();
                        }
                        mouse.selAnchor=null;
                        mouse.dragging=null;
                        model.myCanvas.style.cursor="auto";                    
                    }

                    //CHECK CONNECTOR
                    var found=false;
                    for (let j = 0; j < model.nodes.length; j++) {
                        const element = model.nodes[j];
    
                        var i=element.isInsideConnectors(mouseC);
                        if (i!=null){
                            if (element.connectors[i].options.dragAllowed){
                                mouse.selConnector=i;
                                mouse.selConnectorNode=j;
                                element.connectors[mouse.selConnector].highlight(model.ctx,element.x,element.y,element.w,element.h);
                                found=true;
                                break;
                            }
                        }
                    }
                    if (!found){
                        mouse.selConnector=null;
                        mouse.selConnectorNode=null;
                        model.draw();
                    }
                }
                else
                {
                    var found=false;
                    for (let j = 0; j < model.nodes.length; j++) {
                        const element = model.nodes[j];
    
                        var i=element.isInsideConnectors(mouseC);
                        if (i!=null){
                            if (element.connectors[i].options.dragAllowed){
                                mouse.selConnector=i;
                                mouse.selConnectorNode=j;
                                element.connectors[mouse.selConnector].highlight(model.ctx,element.x,element.y,element.w,element.h);
                                found=true;
                                break;
                            }
                        }
                    }
                    if (!found){
                        mouse.selConnector=null;
                        mouse.selConnectorNode=null;
                        model.draw();
                    }
                    // mouse.selConnector=null;
                }
                break;
        }
    },
    up:function(ev){
        //var mouseC=mouse.mouseCoords(ev);

        if (mouse.dragging!=null){
            if (mouse.dragging=="newlink"){
                if (mouse.linkDestNode!=null)
                {
                    model.addLink(new model.link(mouse.selConnectorNode, mouse.linkDestNode,mouse.selConnector,mouse.linkDestConnector,"","straight"));
                }
                mouse.linkDestNode=null;
                mouse.selConnectorNode=null;
                mouse.selConnector=null;
                mouse.linkDestConnector=null;
                model.draw();
            }
            mouse.dragging=null;
            mouse.dragOrigin={};
            mouse.dragNode=null;
            mouse.selAnchor=null;
            mouse.selConnector=null;
        }
    },
    key:function(ev){
        if (ev.key=="Delete"){
            if (mouse.selNode!=null){
                //DELETE ALL THE LINKS
                for (let index = 0; index < model.links.length; index++) {
                    const element = model.links[index];
                    if (element.from==mouse.selNode || element.to==mouse.selNode)
                        model.links.splice(index,1);
                }
                //DELETE NODE
                model.nodes.splice(mouse.selNode,1);
                mouse.selNode=null;
                model.draw();
            }
            if (mouse.selLink!=null)
            {
                model.links.splice(mouse.selLink,1);
                mouse.selLink=null;
                model.draw();
            }
        }
    },
    dblclick:function(ev){
        if (mouse.selNode!=null){
            mouse.editText=true;
            var textNode=model.nodes[mouse.selNode];
            var ed=document.getElementById("tmpTextEdit");
            if (!ed)
                ed=document.createElement("TEXTAREA");
            ed.id="tmpTextEdit";
            ed.style.display="block";
            ed.style.position="absolute";
            ed.style.margin=0;
            ed.style.padding=0;
            var rect = model.myCanvas.getBoundingClientRect();
            ed.style.left=textNode.x +rect.left + "px";
            ed.style.top=textNode.y + rect.top+ "px";
            ed.style.width=textNode.w + "px";
            ed.style.height=textNode.h + "px";
            ed.value=textNode.text;
            ed.addEventListener("keyup",function(){model.nodes[mouse.selNode].text=this.value})
            document.body.appendChild(ed);
        }
        if (mouse.selLink!=null)
        {
            mouse.editText=true;

            var link=model.links[mouse.selLink];
            var elementT=link.segments[link.indexText];
            var elementT0=link.segments[link.indexText-1];
            var x=(elementT.x+elementT0.x)/2;
            var y=(elementT.y+elementT0.y)/2;

            var ed=document.getElementById("tmpTextEdit");
            if (!ed)
                ed=document.createElement("TEXTAREA");
            ed.id="tmpTextEdit";
            ed.style.display="block";
            ed.style.position="absolute";
            ed.style.margin=0;
            ed.style.padding=0;
            var rect = model.myCanvas.getBoundingClientRect();
            ed.style.left=x +rect.left-100 + "px";
            ed.style.top=y + rect.top-10 + "px";
            ed.style.width=200 + "px";
            ed.style.height=20 + "px";
            ed.value=link.text;
            ed.addEventListener("keyup",function(){model.links[mouse.selLink].text=this.value})
            document.body.appendChild(ed);
        }
    }
}
