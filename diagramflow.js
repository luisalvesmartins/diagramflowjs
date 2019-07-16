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
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, 1000, 1000);

        var grd = this.ctx.createLinearGradient(0, 500, 1000, 0);
        grd.addColorStop(0, "#eeeeee");
        grd.addColorStop(1, "white");

        // Fill with gradient
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(0, 0, 1000, 1000);
        this.ctx.stroke();
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
        this.ctx=this.myCanvas.getContext("2d");
        this.myCanvas.addEventListener("mousedown",mouse.down)
        this.myCanvas.addEventListener("mousemove",mouse.move)
        this.myCanvas.addEventListener("mouseup",mouse.up)
        this.myCanvas.addEventListener("dblclick",mouse.dblclick)
        this.myCanvas.addEventListener("keydown",mouse.key)
    },

    findNode:function(x,y){
        for (let index = 0; index < this.nodes.length; index++) {
            if (this.nodes[index].isInside(x,y))
            {
                return index;
            }
        }
        return null;
    },

    copyFrom:function(sourceModel){
        model.nodes=[];
        if (sourceModel.nodes){
            for (let index = 0; index < sourceModel.nodes.length; index++) {
                const element = sourceModel.nodes[index];
                var anchors=[];
                element.anchors.forEach(a => {
                    anchors.push(new model.anchor(a.x,a.y,a.cursorClass,a.isConnector));
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
    anchor:function(x,y,cursorClass,isConnector)
    {
        this.x=x;
        this.y=y;
        this.radius=5;
        this.cursorClass=cursorClass;
        this.strokeStyle="black";
        this.strokeStyleHighlight="red";

        if (isConnector==true)
            this.isConnector=isConnector;
        else
            this.isConnector=false;
        this.draw=function(ctx,originX,originY,width,height){
            ctx.beginPath();
            ctx.strokeStyle = this.strokeStyle;
            if (this.isConnector)
                ctx.arc(x*width+originX,y*height+originY,this.radius,0,2*Math.PI,false);
            else
                ctx.rect(x*width+originX-this.radius,y*height+originY-this.radius,this.radius*2,this.radius*2);
            ctx.stroke();
        }
        this.highlight=function(ctx,originX,originY,width,height){
            ctx.beginPath();
            ctx.strokeStyle = this.strokeStyleHighlight;
            var r=this.radius*1.5;
            if (this.isConnector)
                ctx.arc(x*width+originX,y*height+originY,r,0,2*Math.PI,false);
            else
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
    node:function(x,y,w,h,anchors,text,fillStyle,figure,args)
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

        this.x=x;
        this.y=y;
        this.w=w;
        this.h=h;
        this.data=args;
        this.anchors=anchors;
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
        };
        this.anchorCoords=function(anchorIndex){
            return {x:this.x+this.anchors[anchorIndex].x*this.w,y:this.y+this.anchors[anchorIndex].y*this.h};
        }
        this.isInside=function(x,y){
            if (x>=this.x && x<=this.x+this.w && y>=this.y && y<=this.y+this.h)
                return true;
            else
                return false;
        };
        this.isInsideAnchors=function(x,y){
            for (let index = 0; index < this.anchors.length; index++) {
                const element = this.anchors[index];
                if (element.isInside(x,y,this.x,this.y,this.w,this.h)==true)
                {
                    return index;
                }
            }
            return null;
        };
        this.nearestAnchor=function(x,y,wantAConnector){
            var dMin=999999;
            var sel=null;
            for (let index = 0; index < this.anchors.length; index++) {
                const element = this.anchors[index];
                var d=element.distance(x,y,this.x,this.y,this.w,this.h);
                if (d<dMin && element.cursorClass!="move")
                {
                    if (!wantAConnector || wantAConnector && element.isConnector==true){
                        dMin=d;
                        sel=index;
                    }
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
    link:function(from,to,anchorIndexFrom,anchorIndexTo,text){
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
    
        this.reSegment=function(){
            this.segments=[];
            var d1=this.directionToVector(model.nodes[from].anchors[this.anchorFrom].cursorClass);
    
            var aC1=model.nodes[from].anchorCoords(this.anchorFrom);
            this.segments.push({x:aC1.x,y:aC1.y});
    
            //FIRST
            aC1.x+=10*d1.x;
            aC1.y+=10*d1.y;
            this.segments.push({x:aC1.x,y:aC1.y});
    
            var aC2=model.nodes[to].anchorCoords(this.anchorTo);
            var d2=this.directionToVector(model.nodes[to].anchors[this.anchorTo].cursorClass);
            var origaC2x=aC2.x;
            var origaC2y=aC2.y;
            aC2.x+=10*d2.x;
            aC2.y+=10*d2.y;
    
    
            var dx=Math.abs(aC1.x-aC2.x);
            var dy=Math.abs(aC1.y-aC2.y);
            var dxm=(aC1.x+aC2.x)/2;
            var dym=(aC1.y+aC2.y)/2;
            if (dx>dy)
            {
                if (Math.sign(aC2.y-aC1.y)!=Math.sign(d1.y))
                {
                    this.segments.push({x:aC2.x,y:aC1.y});
                }
                else
                    this.segments.push({x:aC1.x,y:aC2.y});
            }
            else
            {
                if (Math.sign(aC2.x-aC1.x)!=Math.sign(d1.x))
                    this.segments.push({x:aC2.x,y:aC1.y});
                else
                    this.segments.push({x:aC1.x,y:aC2.y});
            }
            this.segments.push({x:aC2.x,y:aC2.y});
            this.segments.push({x:origaC2x,y:origaC2y});
    
            var element0 = this.segments[0];
            var maxD=0;
            this.indexText=0;
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
    
        this.reSegment();
    
        this.draw=function(ctx){
            //PATH
            ctx.beginPath();
            ctx.strokeStyle = this.strokeStyle;
            const element = this.segments[0];
            ctx.moveTo(element.x,element.y);
            for (let index = 1; index < this.segments.length; index++) {
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
            //ENDPOINT
            var element1 = this.segments[this.segments.length-1];
            ctx.beginPath();
            ctx.fillStyle=this.strokeStyle;
            ctx.strokeStyle = this.strokeStyle;
            ctx.arc(element1.x,element1.y,2*2,0,2*Math.PI,false);
            ctx.fill();
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
                new model.anchor(.5,0,"n-resize",true),
                new model.anchor(1,0,"ne-resize"),
                new model.anchor(0,.5,"w-resize",true),
                new model.anchor(1,.5,"e-resize",true),
                new model.anchor(0,1,"sw-resize"),
                new model.anchor(.5,1,"s-resize",true),
                new model.anchor(1,1,"se-resize"), 
            ];
            break;
        case "Circle":
            anchors=[
                new model.anchor(0,0,"nw-resize"),
                new model.anchor(.86,.86,"se-resize",true),
                new model.anchor(.5,0,"n-resize",true),
                new model.anchor(.86,.14,"ne-resize",true),
                new model.anchor(1,0,"ne-resize"),
                new model.anchor(.14,.14,"nw-resize",true),
                new model.anchor(.14,.86,"sw-resize",true),
                new model.anchor(0,.5,"w-resize",true),
                new model.anchor(1,.5,"e-resize",true),
                new model.anchor(0,1,"sw-resize"),
                new model.anchor(.5,1,"s-resize",true),
                new model.anchor(1,1,"se-resize"), 
            ];
            break;
        case "Diamond":
            anchors=[
                new model.anchor(0,0,"nw-resize"),
                new model.anchor(.5,0,"n-resize",true),
                new model.anchor(1,0,"ne-resize"),
                new model.anchor(0,.5,"w-resize",true),
                new model.anchor(1,.5,"e-resize",true),
                new model.anchor(0,1,"sw-resize"),
                new model.anchor(.5,1,"s-resize",true),
                new model.anchor(1,1,"se-resize"), 
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
    selLink:null,
    editText:false,
    down:function(ev){
        if (mouse.editText)
        {
            mouse.editText=false;
            var ed=document.getElementById("tmpTextEdit");
            ed.style.display="none";
        }
        mouse.selLink=null;
        var rect = model.myCanvas.getBoundingClientRect();
        var mouseX=ev.clientX-rect.left;
        var mouseY=ev.clientY-rect.top;
        var newselNode=model.findNode(mouseX,mouseY);
        if (newselNode!=null){
            mouse.selNode=newselNode;
            // Dispatch/Trigger/Fire the event
            var event = new CustomEvent("selectionChanged", { "detail": mouse.selNode });
            document.dispatchEvent(event);
            mouse.dragOrigin={
                    x:mouseX-model.nodes[mouse.selNode].x,
                    y:mouseY-model.nodes[mouse.selNode].y
                    };
            if (mouse.selAnchor!=null)
            {
                if (model.nodes[mouse.selNode].anchors[mouse.selAnchor].isConnector)
                {
                    model.nodes[mouse.selNode].highlight(model.ctx);
                    mouse.selAnchor=model.nodes[mouse.selNode].nearestAnchor(mouseX,mouseY,true);
                    if (model.nodes[mouse.selNode].anchors[mouse.selAnchor].isConnector)
                        mouse.dragging="link";
                }
                else
                {
                //resize
                    mouse.dragging="anchor";
                }
            }
            else{
                //mouse.dragImage=model.ctx.getImageData(model.nodes[selNode].x,model.nodes[selNode].y,200,200);
                model.nodes[mouse.selNode].highlight(model.ctx);
                mouse.selAnchor=model.nodes[mouse.selNode].nearestAnchor(mouseX,mouseY,true);
                if (model.nodes[mouse.selNode].anchors[mouse.selAnchor].isConnector)
                    mouse.dragging="link";
                mouse.dragging="move";
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
                    if (element.isOverLink({x:mouseX,y:mouseY})==true){
                        element.highlight(model.ctx);
                        mouse.dragging="linkedit";
                        mouse.selLink=index;
                        break;
                    }
                }
            }
            else{
                if (model.nodes[mouse.selNode].anchors[mouse.selAnchor].isConnector)
                    mouse.dragging="link";
                else
                    mouse.dragging="anchor";
                model.draw();
            }
        }
        //console.log(mouse.selNode + " " + mouse.selAnchor + " " + mouse.dragging)
    },
    move:function(ev){
        var rect = model.myCanvas.getBoundingClientRect();
        var mouseX=ev.clientX-rect.left;
        var mouseY=ev.clientY-rect.top;
        if (mouse.dragging=="link"){
            model.draw();
            model.ctx.beginPath();
            var aC=model.nodes[mouse.selNode].anchorCoords(mouse.selAnchor);
            model.ctx.moveTo(aC.x,aC.y);
            model.ctx.lineTo(mouseX,mouseY);
            model.ctx.stroke();

        }
        else if (mouse.dragging=="move"){
            model.nodes[mouse.selNode].x=mouseX-mouse.dragOrigin.x;
            model.nodes[mouse.selNode].y=mouseY-mouse.dragOrigin.y;

            model.links.forEach(element => {
                if (element.to==mouse.selNode || element.from==mouse.selNode){
                    element.reSegment();
                }
            });
            model.draw();
        }
        else if (mouse.dragging=="anchor")
        {
            switch (model.nodes[mouse.selNode].anchors[mouse.selAnchor].cursorClass) {
                case "move":
                    model.nodes[mouse.selNode].x=mouseX-mouse.dragOrigin.x;
                    model.nodes[mouse.selNode].y=mouseY-mouse.dragOrigin.y;
                    break;
                case "w-resize":
                    model.nodes[mouse.selNode].w= model.nodes[mouse.selNode].x-mouseX + model.nodes[mouse.selNode].w;
                    model.nodes[mouse.selNode].x= mouseX ;
                    break;
                case "e-resize":
                    model.nodes[mouse.selNode].w= mouseX - model.nodes[mouse.selNode].x //- mouse.dragOrigin.x;
                    break;
                case "ne-resize":
                    model.nodes[mouse.selNode].w= mouseX - model.nodes[mouse.selNode].x //- mouse.dragOrigin.x;
                    model.nodes[mouse.selNode].h= model.nodes[mouse.selNode].y-mouseY + model.nodes[mouse.selNode].h;
                    model.nodes[mouse.selNode].y= mouseY ;
                    break;
                case "se-resize":
                    model.nodes[mouse.selNode].w= mouseX - model.nodes[mouse.selNode].x //- mouse.dragOrigin.x;
                    model.nodes[mouse.selNode].h= mouseY - model.nodes[mouse.selNode].y //- mouse.dragOrigin.x;
                    break;
                case "s-resize":
                    model.nodes[mouse.selNode].h= mouseY - model.nodes[mouse.selNode].y //- mouse.dragOrigin.x;
                    break;
                case "sw-resize":
                    model.nodes[mouse.selNode].w= model.nodes[mouse.selNode].x-mouseX + model.nodes[mouse.selNode].w;
                    model.nodes[mouse.selNode].x= mouseX ;
                    model.nodes[mouse.selNode].h= mouseY - model.nodes[mouse.selNode].y //- mouse.dragOrigin.x;
                    break;
                case "nw-resize":
                    model.nodes[mouse.selNode].w= model.nodes[mouse.selNode].x-mouseX + model.nodes[mouse.selNode].w;
                    model.nodes[mouse.selNode].x= mouseX ;
                    model.nodes[mouse.selNode].h= model.nodes[mouse.selNode].y-mouseY + model.nodes[mouse.selNode].h;
                    model.nodes[mouse.selNode].y= mouseY ;
                break;            
                case "n-resize":
                    model.nodes[mouse.selNode].h= model.nodes[mouse.selNode].y-mouseY + model.nodes[mouse.selNode].h;
                    model.nodes[mouse.selNode].y= mouseY ;
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
        }
        else
        {
            if (mouse.selNode!=null){
                var element=model.nodes[mouse.selNode];
                var i=element.isInsideAnchors(mouseX,mouseY);
                if (i!=null){
                    mouse.selAnchor=i;
                    if (element.anchors[i].isConnector)
                    model.myCanvas.style.cursor="crosshair";
                    else
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
            }
        }
    },
    up:function(ev){
        var rect = model.myCanvas.getBoundingClientRect();
        var mouseX=ev.clientX-rect.left;
        var mouseY=ev.clientY-rect.top;

        if (mouse.dragging!=null){
            if (mouse.dragging=="link")
            {
                //DISCOVER DEST
                var newselNode=model.findNode(mouseX,mouseY);
                if (newselNode!=null){
                    var selAnchor=model.nodes[newselNode].nearestAnchor(mouseX,mouseY,true);
                    if (selAnchor!=null && newselNode!=mouse.selNode){
                        //CREATE LINK
                        model.addLink(new model.link(mouse.selNode,newselNode,mouse.selAnchor,selAnchor,"link"));
                    }

                }

                model.draw();
            }
            mouse.dragging=null;
            mouse.dragOrigin={};
            mouse.dragNode=null;
            mouse.selAnchor=null;
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
