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
var globalStream;
var video;
var canvas = document.querySelector("#canvas");
$("#startCameraButton").on("click", function(){
    if(!document.getElementById("liveVideo"))
    {
        $("#canvas").css("display", "none");
        video = document.createElement('video');
        video.setAttribute('playsinline', '');
        video.setAttribute('autoplay', '');
        video.setAttribute('muted', '');
        video.setAttribute('id', 'liveVideo');
        video.style.width = '100%';
        video.style.height = '100%';
        var facingMode = "user";
        var constraints = {audio: false,video: {facingMode: facingMode}};
        navigator.mediaDevices.getUserMedia(constraints).then(function success(stream){
            video.srcObject = stream;
            globalStream = stream;
        });
        $(".camera-container").css("display", "none");
        var mainContentData = document.getElementsByClassName("main-content-data")[0];
        mainContentData.appendChild(video);
        $("#startCameraButton").text("Capture the image and recognise the equation");
        $("#startCameraButton").addClass('active');
    }
    else
    {
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        var image_data_url = canvas.toDataURL('image/jpeg');
        globalStream.getTracks().forEach(function(track){
            if (track.readyState == 'live'){
                track.stop();
            }
        });
        $("#startCameraButton").removeClass('active');
        $("#startCameraButton").text("Start Camera and Recognise the Equation");
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "/recognise",
            data: JSON.stringify({imageData: image_data_url}),
            success: function(data){
                    $("#recognitionPanelEquation").text(data["result"]);
                    calculator.setExpression({ id: 'graph1', latex: data["result"], color: Desmos.Colors.ORANGE });
            },
            dataType: "json"
        });
        document.getElementById("liveVideo").parentNode.removeChild(document.getElementById("liveVideo"));
        $("#canvas").css("display", "block");
    }
});