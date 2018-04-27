import React, { Component } from 'react';
import logo from './logo.svg';
import _ from 'lodash';
import './App.css';
import './Section.css';
import './TimeEntry.css';
import './Todo.css';
import {DropdownData} from "./DropdownData.js"

class App extends Component {
  state = {
    Employee: {ID: 0}
  }
  componentDidMount(){
    this.callApi()
    .then(res => {this.setState({Employee: res})}
    ).catch(err => console.log(err));
  }
  callApi = async () => {
    const response = await fetch('/api/employeedata');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  }
  render() {
    console.log(this.state)
    return (
      <div id="mainContainer">
        <Section Title="Time">
          <Clock/>
        </Section>
        <Section Title="Hello">
          <p>{this.state.response}</p>
        </Section>
        <Section Title="Time Entry">
          <TimeEntry employeeId={this.state.Employee.ID}/>
        </Section>
        <Section Title="Todo List">
          <Todo/>
        </Section>
      </div>
    );
  }
}


class TimeEntry extends Component{
  constructor(props){
    super(props);
    this.state = {clients: [], projects: [], tasks: [], time: '', success: null}
    this.clientChanged = this.clientChanged.bind(this)
    this.projectChanged = this.projectChanged.bind(this)
    this.taskChanged = this.taskChanged.bind(this)
    this.submitTime = this.submitTime.bind(this)
  }
  selected = {client: 0, project: 0, task: 0}
  componentDidMount(){
    var _this = this;
    fetch('/api/assignments', {
    method: 'post',
    headers: {"Content-Type": "application/json"}
  }).then(function(response) {
    console.log(response)
      return response.json()
    }).then((data) => {
      _this.setState({projects: data.projects, clients: data.clients, tasks: data.tasks})
    })
  }
  submitTime(){
    fetch('/api/submittime', {
      method: "post",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ProjectID: this.selected.project.substr(1), TaskID: this.selected.task.substr(1), EmployeeID: this.props.employeeId, TotalHours: this.state.time})
    }).then(function (response){
      return response.json()
    }).then((data) => {
        this.setState({success: data.success})
    })
  }
  clientChanged(id){
    this.selected.client = id
    var fetchOptions = {
      method: 'post',
      headers: {"Content-Type": "application/json"}
    }
    if (id != 0){
      fetchOptions.body = JSON.stringify({id: id})
    }
    fetch('/api/assignments', fetchOptions).then(function (response){
      return response.json();
    }).then((data) => {
      this.setState({projects: data.projects})
    })
  }
  projectChanged(id){
    this.selected.project = id;
    var fetchOptions = {
      method: 'post',
      headers: {"Content-Type": "application/json"}
    }
    if (id != 0){
      fetchOptions.body = JSON.stringify({id: id})
    }
    fetch('/api/assignments', fetchOptions).then(function (response){
      return response.json();
    }).then((data) => {
      this.setState({tasks: data.tasks})
    })
  }
  taskChanged(id){
    this.selected.task = id
  }
  render(){
    var successClass = ""
    if (this.state.success == true){
      successClass = "Success"
    }else if (this.state.success == false){
      successClass = "Failed"
    }
    return (
      <div>
        <DropdownData onChanged={this.clientChanged} data={this.state.clients}/>
        <DropdownData onChanged={this.projectChanged} data={this.state.projects}/>
        <DropdownData onChanged={this.taskChanged} data={this.state.tasks}/>
        <input type="text" value={this.state.time} onChange={(e) => {this.setState({time: e.target.value, success: null})}}/>
        <button onClick={this.submitTime}>Submit</button>
        <span className={successClass}/>
      </div>
    )
  }
}


class Todo extends Component{
  constructor(props){
    super(props)
    this.state = {data: [], nextTodo: ""}
    console.log(this.state);
    this.addTodo = this.addTodo.bind(this)
    this.keyDown = this.keyDown.bind(this)
  }
  componentDidMount(){
    this.callApi('/api/todo')
    .then(res => {this.setState(res)})
    .catch(err => console.log(err));
  }
  callApi = async (url) => {
    const response = await fetch(url);
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  }
  addTodo(){
    var requestData = {text: this.state.nextTodo};
    fetch('/api/addTodo', {
    method: 'post',
    body: JSON.stringify(requestData),
    headers: {"Content-Type": "application/json"}
  }).then(function(response) {
    return response.json();
  }).then(data => {
      data.nextTodo = ""
      this.setState(data);
    })
  }
  checkTodo(id){
    var requestData = {"id": id};
    fetch('/api/checkTodo', {
    method: 'post',
    body: JSON.stringify(requestData),
    headers: {"Content-Type": "application/json"}
  }).then(function(response) {
    return response.json();
  }).then(data => {
      this.setState(data);
    })
  }
  deleteTodo(id){
    var requestData = {"id": id};
    fetch('/api/deleteTodo', {
    method: 'post',
    body: JSON.stringify(requestData),
    headers: {"Content-Type": "application/json"}
  }).then(function(response) {
    return response.json();
  }).then(data => {
      this.setState(data);
    })
  }
  keyDown(e){
    if (e.key == "Enter"){
      this.addTodo();
    }
  }
  render(){
    return (
      <div>
        <input type="text" value={this.state.nextTodo} onKeyDown={this.keyDown} onChange={(e) => this.setState({nextTodo: e.target.value})}/>
        <button onClick={this.addTodo}>Add Item</button>
        {this.state.data.map((value) => (
          (value != null ?
          <div className="outerTodo" key={value.id}>
            <div className={value.checked ? "strike" : ""}>{value.text}</div><div className="buttonBox"><button onClick={(e) => this.checkTodo(value.id)} className={value.checked ? "check" : "nocheck"}></button><button className="deleteButton" onClick={(e) => this.deleteTodo(value.id)}>Delete</button></div>
          </div>
          : null)))
          }
      </div>
    )
  }
}


class Section extends Component{
  render(){
    return (
      <div className="Section"><h1>{this.props.Title}</h1><hr/>{this.props.children}</div>
    );
  }
}

class Clock extends Component{
  constructor(props){
    super(props);
    this.state = {date: new Date()};
  }

  componentDidMount(){
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount(){
    clearInterval(this.timerID);
  }

  tick(){
    this.setState({
      date: new Date()
    });
  }

  render(){
    return (
      <div>
        <h2>{this.state.date.toLocaleTimeString()}.</h2>
      </div>
    );
  }
}

export default App;
