var areaNames = {};
var myCars = {};
var ajaxPromise = new Promise(function (resolve,reject)
{
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(this.responseText);
        areaNames = data.areaNames;
        myCars = data.myCars;
        resolve("success");
    }
    };
    xhttp.open("GET", "carAndLoc.php", true);
    xhttp.send();
});
//global function to return the selected object instead of writing document.getElementById() simple write gE()
function gE(tag)
{
    return document.getElementById(tag)
}


//create the svg elements
function createElement(rules)
{
    var elements = document.createElementNS('http://www.w3.org/2000/svg', rules.tag);
    for(var j in rules)
    {
        if(j == "placingTag" || j == "tag") continue;
        if(j=="textValue")
        {
            elements.innerHTML = rules.textValue;
            continue;           
        }
        elements.setAttribute(j,rules[j]);
    }
    gE(rules.placingTag).appendChild(elements);
}


var carsPositions = {};
var xBoxValToRoundUp;
var yBoxValToRoundUp;
var xAxis; var yAxis;

ajaxPromise.then(function ()
{
    //Creating the promises to write area
    var skeletonPromise = new Promise(function(resolve,reject)
    {
        var divide = 5;
        var width = 1000;
        var height = 650;
        xAxis = width/divide;
        var xVal = 0;
        yAxis = height/divide;
        var yVal = 0;
        for(var i =0; i <=divide; i++)
        {
            createElement({tag:"line",placingTag:'mapArea',x1:xVal,y1:"0","x2":xVal,"y2":height,"stroke-width":"0.1",stroke:"black","stroke-dasharray":"5,5"});
            createElement({tag:"line",placingTag:'mapArea',x1:0,y1:yVal,"x2":width,"y2":yVal,"stroke-width":"0.1","stroke-dasharray":"5,5",stroke:"black"});
            var xDumy = 0;
            for (var j =0; j <=divide;j++)
            {
                var m = xDumy+""+yVal;
                carsPositions[m] = [];
                xDumy+=xAxis;
            }
            xVal+=xAxis;
            yVal+=yAxis;
        }
        xBoxValToRoundUp = xAxis;
        yBoxValToRoundUp = yAxis;
        resolve([xAxis,yAxis]);
    });
    //after promises solve creating object into the carPositions object
    skeletonPromise.then(function(xy)
    {
        creatingPlaceHolder();
        for (var j in myCars)
        {
            var color = (myCars[j].type == "premium")?"Pink":"SkyBlue";
            var xRound = Math.ceil(myCars[j].position[0]/xy[0])*xy[0];
            var yRound = Math.ceil(myCars[j].position[1]/xy[1])*xy[1];
            var m = xRound+""+yRound;
            carsPositions[m].push(j);
            createElement({tag:"g",placingTag:'mapArea',id:j+"Grp",class:'carGroups',transform:'translate('+myCars[j].position[0]+','+myCars[j].position[1]+')'});
            createElement({tag:"circle",placingTag:j+"Grp",class:'circle',cx:'0',cy:"0",r:"8",fill:color});
        }
        
    });
});
//this is for load the place holders

function creatingPlaceHolder()
{

    var x = 0;
    for (var eachElement in areaNames)
    {
        createElement({tag:"g",placingTag:"mapArea",id:"stickGroup"+x,class:'stickGroups',transform:'translate('+areaNames[eachElement][0]+','+areaNames[eachElement][1]+')'});
        createElement({tag:"circle",placingTag:'stickGroup'+x,class:'circle',cx:'0',cy:"0","r":"5","fill":"green"});
        createElement({tag:"line",placingTag:'stickGroup'+x,class:'stick',x1:'0',y1:"4","x2":"0","y2":"20","stroke-width":"2",stroke:"black",fill:"green"});

        createElement({tag:"text",placingTag:'stickGroup'+x,class:'stick',x:'10',y:"4",fill:"black",textValue:eachElement,"font-size":13});

        var selected = (eachElement == "Area 4")?"selected":"";
        gE("fromArea").insertAdjacentHTML("beforeend","<option>"+eachElement+"</option>");
        gE("toArea").insertAdjacentHTML("beforeend","<option "+selected+">"+eachElement+"</option>");
        x++;
    }
}

/// main function starting here
function rideNow()
{
    var start = document.getElementById("fromArea").value;
    var end = document.getElementById("toArea").value; 

    if(start == end)
    {
        alert("Starting and Ending point should not be same");
        return ;
    }
    var type = document.getElementById("type").value; 
    var typenm =  type.substr(0, 1);
    typenm = typenm.toUpperCase() + type.substr(1);

    var xpoint = areaNames[start][0];
    var ypoint = areaNames[start][1];

    var x1point = areaNames[end][0];
    var y1point = areaNames[end][1];

    //rounding the nearest x value and y value. For example, let consider box width is 270 and the x position of the areaname is 190, 190 now rounded by 270
    var mxVal = Math.ceil(parseFloat(areaNames[start][0])/xBoxValToRoundUp)*xBoxValToRoundUp; 
    var myVal = Math.ceil(parseFloat(areaNames[start][1])/yBoxValToRoundUp)*yBoxValToRoundUp;

    var actX = mxVal, actY = myVal;
    var topLeftX = actX - xBoxValToRoundUp, topLeftY = actY - yBoxValToRoundUp;
    var startingX = 3; 
    var bottomY = (yBoxValToRoundUp*(startingX-1))+topLeftY;
    var rightX = (xBoxValToRoundUp*(startingX-1))+topLeftX;
    
    var leftX = topLeftX;
    var addY = (actY == 0)?yBoxValToRoundUp:topLeftY;
    var myY = addY+yBoxValToRoundUp;

    var posibleAreas = [];
    
    posibleAreas.push(mxVal+""+myVal);

    for(var i =1; i <= startingX; i++)
    {
        var m = topLeftX+""+topLeftY;
        if(carsPositions.hasOwnProperty(m) && carsPositions[m].length > 0) posibleAreas.push(m)
        m = topLeftX+""+bottomY;
        if(carsPositions.hasOwnProperty(m) && carsPositions[m].length > 0)posibleAreas.push(m);

        topLeftX+=xBoxValToRoundUp;      

        if( i > 0 && i < startingX-1)
        {
            m = leftX+""+myY;
            if(carsPositions.hasOwnProperty(m) && carsPositions[m].length > 0)posibleAreas.push(m);

            m = rightX+""+myY;
            if(carsPositions.hasOwnProperty(m) && carsPositions[m].length > 0)posibleAreas.push(m);

            myY+=yBoxValToRoundUp;
        }
    }
    
    var preDistance = 10000000000;
    var selectedCar;
    var exactArea;
    var exactIndex;
    var flag = 0;
    for (var i in posibleAreas)
    {
        var carSelected = carsPositions[posibleAreas[i]];
        for(var j in carSelected)
        {
            if(myCars[carSelected[j]].status == "rest" && myCars[carSelected[j]].type == type)
            {
                var distance = checkDistance(xpoint,ypoint,myCars[carSelected[j]].position[0],myCars[carSelected[j]].position[1]);
                if(distance < preDistance )
                {
                    exactArea = posibleAreas[i];
                    selectedCar = carSelected[j];
                    preDistance = distance;
                    flag = 1;
                }
            }
        }
    }

    if(flag == 0)
    {
        for (var m in myCars)
        {
            if(myCars[m].status == "rest" && myCars[m].type == type )
            {
                var distance = checkDistance(xpoint,ypoint,myCars[m].position[0],myCars[m].position[1]);

                if(preDistance > distance)
                {
                    preDistance = distance;
                    selectedCar = m;
                    flag = 2;
                }
            }
        }
    }
    
    if(flag == 2)
    {
        var m = Math.ceil(myCars[selectedCar].position[0]/xAxis)*xAxis;
        var n = Math.ceil(myCars[selectedCar].position[1]/yAxis)*yAxis;
        m = m+""+n;
        exactArea = m;
    }
    var fromToDistance =  checkDistance(xpoint,ypoint,x1point,y1point);

    if(flag == 0)
    {
        var customerName = gE("customer").innerHTML;
        var forId = customerName.replace(/\s+/,"");
        var myDiv = '<div class="customers" id="'+forId+'"><h4 class="error">All cars are Busy</h4></div>'
        gE("statusOfCar").insertAdjacentHTML("afterend",myDiv)
        return;
    }

    var customerName = gE("customer").innerHTML;
    var forId = customerName.replace(/\s+/,"");
    var myDiv = '<div class="customers" id="'+forId+'"><h2>'+customerName+'</h2><h4>'+selectedCar+' started</h4><p>From: '+start+'</p><p>To: '+end+'</p><p>Type: '+typenm+'</p><p id="pri'+forId+'"></p></div>'

    customerName = customerName.replace(/(\d+)/,function(x){return ++x});
    gE("customer").innerHTML = customerName;


    gE("statusOfCar").insertAdjacentHTML("afterend",myDiv)

    var Indx = carsPositions[exactArea].indexOf(selectedCar);
    if (Indx > -1) carsPositions[exactArea].splice(Indx, 1);
    
    myCars[selectedCar].status = "driving";

    drawPathAndStart(myCars[selectedCar].position[0],myCars[selectedCar].position[1],xpoint,ypoint,{x1:xpoint,y1:ypoint,x2:x1point,y2:y1point},"n");


    //checking the distance between two coordinate
    function checkDistance(x1,y1,x2,y2)
    {   
        var ma = Math.sqrt((parseFloat(x1)-parseFloat(x2))**2+(parseFloat(y1)-parseFloat(y2))**2);
        return ma;
    }

    //it will draw the path to go and it will trigger the driving
    function drawPathAndStart(x1,y1,x2,y2,nxtVal,vai)
    {
        createElement({tag:"line",placingTag:'mapArea',x1:x1,y1:y1,"x2":x2,"y2":y2,"stroke-width":"0.4",stroke:"#3a3a3a","stroke-dasharray":"5,5","class":"showline","id":selectedCar+"line"});
        startDrive({x1:x1,y1:y1,x2:x2,y2:y2},vai,nxtVal);
    }

    //startDrive to move the position of cars for each car it will call twice. First time to go to the path second time to go the dropping area
    function startDrive(position,nY,goHere)
    {
        start = 0.1;
        var m = (position.y2-position.y1)/(position.x2-position.x1);
        var n = m * -position.x1;
        n = n  + position.y1;
        var startPoint = position.x1;
        var posOrNeg = (position.x1 >= position.x2)?0:1;
        var carGp = document.getElementById(selectedCar+"Grp");
        var startDriving = new Promise(function(resolve,reject)
        {
            loop(startPoint);
            function loop(i)
            {
                if(posOrNeg == 0)
                {
                    if(i > position.x2)
                    {
                        var y = m*i;
                        y = n + y;
                        carGp.setAttribute("transform",'translate('+i+','+y+')');
                        setTimeout(function(){
                            loop(--i);
                        },50)
                    }
                    else
                    {
                        resolve("success");
                    }
            
                }
                else if(posOrNeg == 1)
                {
                    if(i < position.x2)
                    {
                        var y = m*i;
                        y = n + y;
                        carGp.setAttribute("transform",'translate('+i+','+y+')');
                        setTimeout(function(){
                            loop(++i);
                        },20)
                    }
                    else
                    {
                        resolve("success");
                    }
                }
            }
        });

        startDriving.then(function(drivingStatus)
        {
            if(nY == "y")
            {
                if(drivingStatus == "success")
                {
                    var cost = Math.round(fromToDistance * 1);
                    cost = (type == "normal")?cost:cost+5;

                    myCars[selectedCar].status = "rest";

                    myCars[selectedCar].totalRide += 1;
                    myCars[selectedCar].totalEarned += cost;

                    gE("pri"+forId).innerHTML = "Total Fare <b>"+cost+"</b>";
                    var m = Math.ceil(position.x2/xAxis)*xAxis;
                    var n = Math.ceil(position.y2/yAxis)*yAxis;
                    m = m+""+n;
                    myCars[selectedCar].position = [position.x2,position.y2];
                    removeElement(selectedCar+"line");
                    removeElement(selectedCar+"line");
                    carsPositions[m].push(selectedCar);
                }
            }
            else
            {
                drawPathAndStart(goHere.x1,goHere.y1,goHere.x2,goHere.y2,"","y")
            }
        });

    }
}

//remove the dotted line after reaching the destination
function removeElement(id) 
{
    var elem = document.getElementById(id);
    return elem.parentNode.removeChild(elem);
}