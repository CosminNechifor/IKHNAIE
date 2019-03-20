import React, { Component } from "react";
import {
  Container,
  Header,
  Title,
  Content,
  Button,
  Icon,
  Text,
  Left,
  Body,
  Right,
  Toast,
  List,
  ListItem
} from "native-base";
import styles from "./styles";
import ComponentList from '../componentList';
import axios from '../../axios';

class Tracking extends Component {

  state = {
    currnetComponent: null,
    componentList: [ 
    ],
    componentsHistory: []
  };
  
  componentWillMount() {
    axios.get('/api/v1/component').then(res => {
      //console.log(res.data.components)
      let requests = res.data.components.map(addr => {
	return axios.get('/api/v1/_component/' + addr);
      });
      Promise.all(requests).then(res => {
	const componentList = res.map(r => {
	  return {
	    'data': r.data.data,
	    'parent': r.data.parentAddress,
	    'address': r.data.componentAddress
	  };
	});
	this.setState({componentList: componentList})
	console.log(componentList);
      }).catch(e => 
	console.log(e)
      );
    });
  }

  showChildComponentsHandler = (component) => {
    const text = "Showing child components for: " + component.address;
    Toast.show({
      text: text,
      textStyle: { color: "yellow" },
      buttonText: "Okay"
    });
    
    const newComponentsHistory = this.state.componentsHistory;
    newComponentsHistory.push(this.state.currentComponent);
    this.setState({
      componentsHistory: newComponentsHistory,
      currentComponent: component 
    });
  }

  //replace with proper logic
  showParentComponentHandler = () => {
    text = "Showing parent component";
    Toast.show({
      text: text,
      textStyle: { color: "yellow" },
      buttonText: "Okay"
    });
    const newComponentsHistory = this.state.componentsHistory;
    const newCurrentComponent =  newComponentsHistory.pop();
    this.setState({
      componentsHistory: newComponentsHistory,
      currentComponent: newCurrentComponent
    });
  }

  render() {
    return (
      <Container style={styles.container}>
        <Header style={{backgroundColor: '#808080'}}>
          <Left>
            <Button
              transparent
              onPress={() => this.props.navigation.openDrawer()}
            >
              <Icon name="menu" />
            </Button>
          </Left>
          <Body>
	    <Text>Tracking page</Text>
          </Body>
          <Right />
        </Header>
	{
	  this.state.currentComponent ? 
	  <Header style={{backgroundColor: '#808080'}}>
	    <Button transparent success>
	      <Text>{this.state.currentComponent.data}</Text>
	    </Button>
	  </Header>
	  :<Header style={{backgroundColor: '#808080'}}>
	    <Button transparent success>
	      <Text>All Components</Text>
	    </Button>
	  </Header>
	}
	<ComponentList
	  components={this.state.componentList}
	  showChildComponents={this.showChildComponentsHandler}	
	  showParentComponent={this.showParentComponentHandler}
	/>
      </Container>
    );
  }
}

export default Tracking;
