// описание формы
var FormA = [

{ label:'Имя', elemtype:'text', name:'name', width:200 },

{ label:'Email', elemtype:'text', name:'email', width:200 },

{ label:'Возраст', elemtype:'text', name:'age', width:100 },

{ label:'Получать новости', elemtype:'check', name:'subscribe' },

{ label:'Отправить', elemtype:'button', value:'Send' }

];



// функция создания формы
function buildForm(formId, formData){

let form = document.getElementById(formId);

formData.forEach(function(field){

let row = document.createElement("div");
row.className = "form-row";

if(field.elemtype !== "button"){

let label = document.createElement("label");
label.innerText = field.label;
row.appendChild(label);

}

let input;

switch(field.elemtype){

case "text":

input = document.createElement("input");
input.type = "text";
input.name = field.name;
input.style.width = field.width + "px";

input.addEventListener("change", function(){
validateField(input);
});

break;


case "check":

input = document.createElement("input");
input.type = "checkbox";
input.name = field.name;

break;


case "button":

input = document.createElement("input");
input.type = "submit";
input.value = field.value;

break;

}

row.appendChild(input);

let error = document.createElement("div");
error.className = "error";
row.appendChild(error);

form.appendChild(row);

});

form.addEventListener("submit", function(e){

let valid = true;

let inputs = form.querySelectorAll("input[type=text]");

inputs.forEach(function(input){

if(!validateField(input)){
valid = false;
}

});

if(!valid) e.preventDefault();

});

}



// функция валидации одного поля
function validateField(input){

let error = input.parentNode.querySelector(".error");

let value = input.value.trim();

error.innerText = "";

if(input.name === "name"){

if(value.length < 2){
error.innerText = "Имя слишком короткое";
return false;
}

}

if(input.name === "email"){

let re = /^\S+@\S+\.\S+$/;

if(!re.test(value)){
error.innerText = "Неверный email";
return false;
}

}

if(input.name === "age"){

if(isNaN(value) || value < 1 || value > 120){
error.innerText = "Возраст должен быть числом 1-120";
return false;
}

}

return true;

}



// запуск генерации формы
buildForm("myForm", FormA);