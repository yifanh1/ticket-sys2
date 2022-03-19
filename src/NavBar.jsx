import React from 'react';
import Container from './Container'

class NavBar extends React.Component {
    
      render() {
        return (
          // should return nav bar
          <nav>
            <ul>
                <li><button onClick={() => this.props.displayComponent("Home")}>Home</button></li>
                <li><button onClick={() => this.props.displayComponent("Add")}>Book Tickets</button></li>
                <li><button onClick={() => this.props.displayComponent("Delete")}>Cancel Bookings</button></li>
                <li><button onClick={() => this.props.displayComponent("Display")}>Display Bookings</button></li>
                <li><button onClick={() => this.props.displayComponent("Avail")}>Display Seats</button></li>
                <li><button onClick={() => this.props.displayComponent("AddBlack")}>Add BlackList</button></li>
            </ul>
        </nav>
        );
      }
  }
  export default NavBar;