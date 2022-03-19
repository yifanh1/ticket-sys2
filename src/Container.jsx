import TicketTable from './pages/DisplayPage'
import TicketAdd from './pages/AddPage'
import TicketDelete from './pages/DeletePage'
import TicketAvail from './pages/FreeSeatsPage'
import NavBar from './NavBar'
import Home from './pages/HomePage'
import React from 'react';
import BlackAdd from './pages/AddBlackPage';
const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}
class Container extends React.Component {
    constructor() {
        super();
        this.state = { 
          tickets: [],
          showHome: true,
          showAdd: false,
          showDisplay: false,
          showDelete: false,
          showAvail: false,
          showAddBlack: false,
         };
        this.createTicket = this.createTicket.bind(this);
        this.deleteTicket = this.deleteTicket.bind(this);
        this.displayComponent = this.displayComponent.bind(this);
        this.createBlocked = this.createBlocked.bind(this);
      }
    
      componentDidMount() {
        this.loadData();
      }

      async loadData() {
        const query = `query {
          ticketList {
            id name phoneNumber created
          }
        }`;
    
        const response = await fetch('/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify({ query })
        });
        const body = await response.text();
        const result = JSON.parse(body, jsonDateReviver);
        this.setState({ tickets: result.data.ticketList });
      }
    
      async createTicket(ticket) {
        const query = `mutation {
          ticketAdd(ticket: {
            name: "${ticket.name}",
            phoneNumber: "${ticket.phoneNumber}",
          }) 
          {status, errors}
        }`
        // console.log(query)
        const response = await fetch('/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify({ query, variables: { ticket } })
        });
        const res = await response.text();
        const resJ = JSON.parse(res);
        console.log(resJ);
        if (resJ.data.ticketAdd.status) alert("Add Traveller Successfully!");
        else {
          const errors = resJ.data.ticketAdd.errors;
          alert(`Failure! Errors: ${errors}`)
        };
        this.loadData();
      }

      async deleteTicket(ticket) {
        const query = `mutation {
          ticketDelete(ticket: {
           name: "${ticket.name}",
           phoneNumber: "${ticket.phoneNumber}",
         })
         {status, errors}
         }`
        console.log(query);
        // console.log(query)
        const response = await fetch('/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify({ query, variables: { ticket } })
        });
        const res = await response.text();
        console.log(res);
        const resJ = JSON.parse(res);
        console.log(resJ);
        const errors = resJ.data.ticketDelete.errors;
        if (resJ.data.ticketDelete.status) alert("Cancel Traveller Successfully!");
        else alert(`Failure! Errors: ${errors}`);
        this.loadData();
      }

      async createBlocked(ticket) {
        const query = `mutation {
          blackAdd(ticket: {
            name: "${ticket.name}",
            phoneNumber: "${ticket.phoneNumber}",
          }) 
        }`
        const response = await fetch('/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify({ query, variables: { ticket } })
        });
        const res = await response.text();
        const resJ = JSON.parse(res);
        console.log(resJ);
        if (resJ.data.blackAdd) alert("Add traveller to BlackList Successfully!");
        else {
          alert(`Add to BlackList Failure!`)
        };
        this.loadData();
      }

      displayComponent(name) {
        switch (name) {
          case "Home":
            this.setState({ 
              showHome: true,
              showAdd: false,
              showDisplay: false,
              showDelete: false,
              showAvail: false,
              showAddBlack:false,});
              console.log()
              // Container.render();
            break;
          case "Add":
            this.setState({ 
                showHome: false,
                showAdd: true,
                showDisplay: false,
                showDelete: false,
                showAvail: false,
                showAddBlack:false,});
                // Container.render();
            break;
          case "Delete":
            this.setState({ 
                showHome: false,
                showAdd: false,
                showDisplay: false,
                showDelete: true,
                showAvail: false,
                showAddBlack:false,});
                // Container.render();
            break;
          case "Avail":
                this.setState({ 
                    showHome: false,
                    showAdd: false,
                    showDisplay: false,
                    showDelete: false,
                    showAvail: true,
                    showAddBlack:false,}); 
                    // Container.render();
                    break;
          case "Display":
            this.setState({ 
                showHome: false,
                showAdd: false,
                showDisplay: true,
                showDelete: false,
                showAvail: false,
                showAddBlack:false,});  
                // Container.render();
                break;
          case "AddBlack":
            this.setState({
                showHome: false,
                showAdd: false,
                showDisplay: false,
                showDelete: false,
                showAvail: false,
                showAddBlack:true,
            })
        }
      }


    
    render() {
      return(
        <React.Fragment>
        <h2>Singapore Railway Ticket System</h2>
        <NavBar displayComponent = {this.displayComponent}></NavBar>
        {this.state.showHome && <Home></Home>}
        {this.state.showDisplay && <TicketTable tickets={this.state.tickets}></TicketTable>}
        {this.state.showAdd && <TicketAdd createTicket={this.createTicket}></TicketAdd>}
        {this.state.showDelete && <TicketDelete deleteTicket={this.deleteTicket}></TicketDelete>}
        {this.state.showAvail && <TicketAvail ticketNum = {this.state.tickets.length}></TicketAvail>}
        {this.state.showAddBlack && <BlackAdd createBlocked = {this.createBlocked}></BlackAdd>}
        </React.Fragment>);
    }
  }
  export default Container;