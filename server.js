const express = require('express');
const http = require("http");
const request = require("request");
const fs = require("fs")

const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 5000;
var clientKey, userKey;
var todoData = {data: []}
fs.readFile("keys.json", function (err, data){
  console.log("keys.json data: " + data)
  if (err){
    return;
  }else{
    var jsonData = JSON.parse(data);
    clientKey = jsonData.clientKey;
    userKey = jsonData.userKey;
  }
})
function callAPI(url, content, fnc){
  var requestOptions = {json: true,
    headers: {Authorization: 'WRAP access_token="client=' + clientKey + 'user_token=' + userKey + '"'}
}
  if (content != null){
    requestOptions.body = content;
  }
  request(url, requestOptions, (err, res, body) => {
    if (err) return console.log(err);
    fnc(body);
  })
}
function updateTodoDataFile(){
  fs.writeFile("todoStore.json", JSON.stringify(todoData), function (err){
    if (err)
      console.log(err);
  })
}
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.get('/api/employeedata', (req, res) => {
  callAPI("https://api.dovico.com/Employees/Me/?version=6", null, (body) => {
    console.log(body)
    res.send(body.Employees[0])
  })
});
app.post('/api/submittime', (req, res) => {
  var date = new Date()
  var month = date.getMonth() + 1;
  req.body.Date = date.getFullYear() + "-" + (month < 10 ? "0" + month : month) + "-" + date.getDate()
  console.log(req.body)
  callAPI("https://api.dovico.com/TimeEntries/?version=6", req.body, (body) => {
    console.log(body)
    res.send({Success: true})
  })
});
app.post('/api/assignments', (req,res) => {
  console.log(req.body)
    callAPI("https://api.dovico.com/Assignments/" + (req.body.id == null ? "" : ("/" + req.body.id)) + "/?version=6", null, (body) => {
      var returnData = {clients: [], projects: [], tasks: []}
      for (var i=0;i<body.Assignments.length;i++){
        if (body.Assignments[i].AssignmentID[0] == "P"){
          returnData.projects.push({id: body.Assignments[i].AssignmentID, name: body.Assignments[i].Name})
        }
        else if (body.Assignments[i].AssignmentID[0] == "C"){
          returnData.clients.push({id: body.Assignments[i].AssignmentID, name: body.Assignments[i].Name})
        }
        else if (body.Assignments[i].AssignmentID[0] == "T"){
          returnData.tasks.push({id: body.Assignments[i].AssignmentID, name: body.Assignments[i].Name})
        }
      }
      console.log(returnData)
      res.send(returnData);
    });
})
app.post('/api/addTodo', (req,res) => {
  todoData.data.push({id: todoData.data.length, text: req.body.text, checked: false})
  updateTodoDataFile()
  res.send(todoData);
})
app.post('/api/checkTodo', (req,res) => {
  todoData.data[req.body.id].checked = !todoData.data[req.body.id].checked;
  updateTodoDataFile()
  res.send(todoData);
})
app.post('/api/deleteTodo', (req,res) => {
  todoData.data[req.body.id] = null;
  updateTodoDataFile()
  res.send(todoData);
})
app.get('/api/todo', (req,res) => {
  res.send(todoData);
})

console.log("Initialization of Todo...")
fs.readFile("todoStore.json", function (err, data){
  if (err){
    todoData = {data: []}
  }else{
    todoData = JSON.parse(data);
    if (!todoData.data){
      todoData = {data: []}
    }
  }
})

app.listen(port, () => console.log(`Listening on port ${port}`));