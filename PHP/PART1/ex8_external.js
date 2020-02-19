
//*** all global variable decalartions go here


//*** return x and y coords of a screen object *************
function findElementCoords(obj) {

            var curleft = curtop = 0;

            if (obj.offsetParent) {
               curleft = obj.offsetLeft;
               curtop = obj.offsetTop;

               while (obj = obj.offsetParent) {
                   curleft += obj.offsetLeft;
                   curtop += obj.offsetTop;
               }
            }

          return [curtop, curleft];
}


//*** display information about document ********************
function display(mode, event) {

               //*** find position of "Menu Item 1"
               position = findElementCoords(document.getElementById('menu1'));

               var myDivision = document.getElementById("menuItem1");

               if (mode=='show'){
                  myDivision.style.visibility = "visible";
                  myDivision.style.top        = position[0];
                  myDivision.style.left       = 100 + position[1]; // move 100 pixels over
               }
               else
                  myDivision.style.visibility = "hidden";

}


//*** change background color of an element as specified *****
function changeColor(elementID, color) {

               document.getElementById(elementID).style.background=color;
}