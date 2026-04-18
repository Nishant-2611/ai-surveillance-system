setInterval(() => {

fetch("/api/detection/history")
.then(res => res.json())
.then(data => {
setInterval(()=>{
const now = new Date();
document.getElementById("system-time").innerText =
now.toLocaleTimeString();
},1000);
function showAlert(msg){
const alertBox=document.getElementById("alertBox");
alertBox.innerText=msg;
alertBox.style.display="block";

setTimeout(()=>{
alertBox.style.display="none";
},4000);
}
let recent = document.getElementById("recentEvents");

recent.innerHTML="";

data.slice(-5).forEach(event => {

recent.innerHTML += "<li>"+event.eventType+" - "+event.timestamp+"</li>";

});

if(data.length>0){

let last=data[data.length-1];

document.getElementById("alert").innerText=
"⚠ Human detected at "+last.timestamp;

}

});

},5000);