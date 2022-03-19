import React from 'react';
class BlackAdd extends React.Component {
    constructor() {
        super();
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {
          name: "addblack",
        }
      }
    
      handleSubmit(e) {
        e.preventDefault();
        const form = document.forms.blackAdd;
        const blacker = {
          name: form.name.value, phoneNumber: form.phoneNumber.value,
        }
        this.props.createBlocked(blacker);
        form.name.value = ""; form.phoneNumber.value = "";
      }
    
      render() {
        return (
          <div>
          <h4>Please enter the traveller information to Black List:</h4>
          <p id="warning">Warning: Careful! Currently We don't support remove information from blacklist!!!</p>
          <form name="blackAdd" onSubmit={this.handleSubmit}>
            <label>Name: </label>
            <input type="text" name="name" placeholder="input name" />
            <br></br>
            <br></br>
            <label>Phone Number:</label>
            <input type="text" name="phoneNumber" placeholder="input phone number" />
            <button>Add</button>
          </form>
          </div>
        );
      }
  }
  export default BlackAdd;