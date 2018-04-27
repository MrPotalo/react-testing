import React, { Component } from 'react';

export class DropdownData extends Component{
    constructor(props){
        super(props);
    }
    render(){
        if (this.props.data.length == 0 || this.props.data[0].id != 0)
            this.props.data.unshift({id: 0, name: "None"})
        
        return (
            <select onChange={(e) => {(this.props.onChanged != null ? this.props.onChanged(e.target.value) : null)}}>
                {this.props.data.map((val) => (
                    <option key={val.id} value={val.id}>{val.name}</option>
                ))}
            </select>
        )
    }
}