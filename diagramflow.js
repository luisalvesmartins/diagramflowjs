function anchor(x,y,cursorClass,isConnector)
{
    this.x=x;
    this.y=y;
    this.radius=5;
    this.radius2=this.radius*this.radius;
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
        ctx.arc(x*width+originX,y*height+originY,this.radius,0,2*Math.PI,false);
        ctx.stroke();
    }
    this.highlight=function(ctx,originX,originY,width,height){
        ctx.beginPath();
        ctx.strokeStyle = this.strokeStyleHighlight;
        ctx.arc(x*width+originX,y*height+originY,this.radius*1.5,0,2*Math.PI,false);
        ctx.stroke();
    }
    this.distance=function(x,y,originX,originY,width,height)
    {
        return (x-this.x*width-originX)*(x-this.x*width-originX) + (y-this.y*height-originY)*(y-this.y*height-originY);
    }
    this.isInside=function(x,y,originX,originY,width,height){
        var d=this.distance(x,y,originX,originY,width,height);
        if (d<=this.radius2){
            return true;
        }
        else
            return false;
    };
}
function link(from,to,anchorIndexFrom,anchorIndexTo,text){
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
        }
    }

    this.from=from;
    this.to=to;
    this.anchorFrom=anchorIndexFrom;
    this.anchorTo=anchorIndexTo;
    this.backImage=null;
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

}
var model={
    ctx:null,
    nodes:[],
    links:[],

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
        var myCanvas=document.getElementById(canvasName);
        this.ctx=myCanvas.getContext("2d");
        myCanvas.addEventListener("mousedown",mouse.down)
        myCanvas.addEventListener("mousemove",mouse.move)
        myCanvas.addEventListener("mouseup",mouse.up)
        myCanvas.addEventListener("dblclick",mouse.dblclick)
        myCanvas.addEventListener("keydown",mouse.key)
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
        var mouseX=ev.x-myCanvas.offsetLeft+window.scrollX;
        var mouseY=ev.y-myCanvas.offsetTop+window.scrollY;
        var newselNode=model.findNode(mouseX,mouseY);
        if (newselNode!=null){
            mouse.selNode=newselNode;
            mouse.dragOrigin={
                    x:mouseX-model.nodes[mouse.selNode].x,
                    y:mouseY-model.nodes[mouse.selNode].y
                    };
            if (mouse.selAnchor!=null)
            {
                //resize
                mouse.dragging="anchor";
            }
            else{
                //mouse.dragImage=model.ctx.getImageData(model.nodes[selNode].x,model.nodes[selNode].y,200,200);
                model.nodes[mouse.selNode].highlight(model.ctx);
                mouse.selAnchor=model.nodes[mouse.selNode].nearestAnchor(mouseX,mouseY,true);
                mouse.dragging="link";
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
                mouse.dragging="anchor";
                model.draw();
            }
        }
        //console.log(mouse.selNode + " " + mouse.selAnchor + " " + mouse.dragging)
    },
    move:function(ev){
        var mouseX=ev.x-myCanvas.offsetLeft+window.scrollX;
        var mouseY=ev.y-myCanvas.offsetTop+window.scrollY;
        if (mouse.dragging=="link"){
            model.draw();
            model.ctx.beginPath();
            var aC=model.nodes[mouse.selNode].anchorCoords(mouse.selAnchor);
            model.ctx.moveTo(aC.x,aC.y);
            model.ctx.lineTo(mouseX,mouseY);
            model.ctx.stroke();

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
                    myCanvas.style.cursor=element.anchors[i].cursorClass;
                    element.anchors[i].highlight(model.ctx,element.x,element.y,element.w,element.h);
                }
                else{
                    mouse.selAnchor=null;
                    mouse.dragging=null;
                    myCanvas.style.cursor="auto";                    
                }
            }
        }
    },
    up:function(ev){
        var mouseX=ev.x-myCanvas.offsetLeft+window.scrollX;
        var mouseY=ev.y-myCanvas.offsetTop+window.scrollY;

        if (mouse.dragging!=null){
            if (mouse.dragging=="link")
            {
                //DISCOVER DEST
                var newselNode=model.findNode(mouseX,mouseY);
                if (newselNode!=null){
                    var selAnchor=model.nodes[newselNode].nearestAnchor(mouseX,mouseY,true);
                    if (selAnchor!=null && newselNode!=mouse.selNode){
                        //CREATE LINK
                        model.addLink(new link(mouse.selNode,newselNode,mouse.selAnchor,selAnchor,"link"));
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
            ed.style.left=textNode.x +myCanvas.offsetLeft + "px";
            ed.style.top=textNode.y + myCanvas.offsetTop+ "px";
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
            ed.style.left=x + myCanvas.offsetLeft-100 + "px";
            ed.style.top=y + myCanvas.offsetTop-10 + "px";
            ed.style.width=200 + "px";
            ed.style.height=20 + "px";
            ed.value=link.text;
            ed.addEventListener("keyup",function(){model.links[mouse.selLink].text=this.value})
            document.body.appendChild(ed);
        }
    }
}
function node(x,y,w,h,anchors,text,fillStyle,figureCallback)
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
    this.anchors=anchors;
    this.strokeStyle="black";
    this.fillStyle=fillStyle;
    this.text=text;
    this.figRectangle=function(ctx){
        ctx.beginPath();
        ctx.fillStyle=this.fillStyle;
        ctx.strokeStyle="blue";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle="black";
        ctx.font="10px Verdana";
        ctx.textBaseline="top";
        //ctx.fillText("Hello World!",this.x,this.y);
        this.textfill(ctx);
    }
    if (!figureCallback){
        figureCallback=this.figRectangle;
    }
    this.figure=figureCallback;
    this.draw=function(ctx){
        this.figure(ctx);
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
};
