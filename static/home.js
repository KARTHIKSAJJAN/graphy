[...document.querySelectorAll('.menu-button')].forEach(function(item){
    item.addEventListener('click', function()
    {
        document.querySelector('.app-left').classList.add('show');
    });
});
[...document.querySelectorAll('.close-menu')].forEach(function(item){
    item.addEventListener('click', function()
    {
        document.querySelector('.app-left').classList.remove('show');
    });
});
$("#recogniseButton").click(function()
{
    $("#teamAppMain").css("display", "none");
    $("#recogniseAppMain").css("display", "block");
    $(this).addClass('active').siblings().removeClass('active');
    if(document.querySelector('.app-left').classList.contains('show'))
    {
        document.querySelector('.app-left').classList.remove('show');
    }
});
$("#teamButton").click(function()
{
    $("#recogniseAppMain").css("display", "none");
    $("#teamAppMain").css("display", "block");
    $(this).addClass('active').siblings().removeClass('active');
    if(document.querySelector('.app-left').classList.contains('show'))
    {
        document.querySelector('.app-left').classList.remove('show');
    }
});
var elt = document.getElementById('calculator');
var calculator = Desmos.GraphingCalculator(elt, {expressions: false});
var start = 1;
$("#startCameraButton").on("click", function(){
    if(start==1)
    {
        $("#recognitionPanelEquation").text("-");
        $.getJSON('/setStart');
        $(".camera-container").css("display", "none");
        $("#liveVideo").css("display", "block");
        $("#startCameraButton").text("Capture the image and recognise the equation");
        $("#startCameraButton").addClass('active');
        start = 2;
    }
    else
    {
        $.getJSON('/stopStart', function(data){
            console.log(data);
            $("#recognitionPanelEquation").text(data["result"]);
            calculator.setExpression({ id: 'graph1', latex: data["result"], color: Desmos.Colors.ORANGE });
        });
        $("#startCameraButton").removeClass('active');
        $("#startCameraButton").text("Start Camera and Recognise the Equation");
        start = 1;
    }
});