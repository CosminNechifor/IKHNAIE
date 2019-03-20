import React, { Component } from "react";
import { Container, Header, Content, List, ListItem, Text } from 'native-base';
import ComponentElement from './component/Component';

class ComponentList extends Component {
  render() {
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
