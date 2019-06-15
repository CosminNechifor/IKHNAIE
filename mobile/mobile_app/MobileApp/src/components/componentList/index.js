import React, { Component } from "react";
import { Container, Content }  from 'native-base';
import ComponentElement from './component/Component';

class ComponentList extends Component {
  render() {
    console.log('ComponentList');
    return (
      <Container>
	<Content>
	  <ComponentElement 
	    components={this.props.components}
	    showChildComponents={this.props.showChildComponents} 
	  />
	</Content>
      </Container>
   );
  }
}

export default ComponentList;
