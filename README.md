# Cuber

# This cuber app developed with vanilla js and svg without using any other plugins.


Algorithm 1: To find the nearest car
----------------------------------------------------------

We can find the nearest car by looping the all values and get the distance of the car but this is not a optimal procedures. But I have given another one apporach to find the nearest car.

Storing the values
------------------

I have created `carsPositions` object which contain the method name like 2000,4000,6000 .. etc.  

2000 means we have to split like 200,0. 200 is first position of -x box and 0 is -y postion of y box. this box is not visible

Top left box method name is 200130. 200 is x postion 130 is y position.

And the object values are the car name like car1,car2. I'm rounding car position value with rounding of box height and width. 
it means if let consider car x position is 150 and car y position is 80, I will round this value as 200,130 using the following formula

        carXposition = 150;
        result = Math.ceil(carXposition/200)*200; // 200

same method following for y, y height is 130.

After rounding value I will get the positions like "200,130". Then I'll concatenated the value like 200130. And stored the car into the "200130" key.


Retriving the values
--------------------

If user wants to go Area1 to Area9. Like what I did for the car, same thing made for the position value. And I am seaching cars into the matrix boxes Like

            ---------------------------
            |       |        |        |
            ---------------------------
            |       |    0   |        |
            ---------------------------   
            |       |        |        |
            ---------------------------   

Lets consider the above diagram 0 is the position where user give the areaname. I am seaching cars in 9 places From top left a00 , a01 , a02 , a10 , 0 ,a11 , a20 , a21 , a22 all values converted like `carsPositions` method's name and searching on carsPositions.








Algorithm 2: Moving car Start position to End position 
-------------------------------------------------------

I am having the x1,y1 position and x2,y2 position and drawn the line for the points. Now the task is we have to move the car on that line.
So I have used the following formula


                       Y-y1 = ((y2-y1)/(x2-x1)) * X - x1






Algorithm 3: Find the distance between two points 
-------------------------------------------------


I have made the graph in svg so I have the x1,x2,y1,y2 points so I have used the distance formula 

       distance = sqrt((x2-x1)^2+(y2-y1)^2)


