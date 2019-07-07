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
    currentComponent: '0x0000000000000000000000000000000000000000',
    componentList: [],
    componentsHistory: [],
    baseComponentURL: '/api/v1/component'
  };
  
  componentWillMount() {
    this.loadApp();
  }
  
  // TODO: Make requests concurrently 
  loadApp = async () => {
    const response = await axios.get(this.state.baseComponentURL);
    const addresses = response.data.components;

    let component;
    let componentList = [];
    for (addr of addresses) {
      component = await axios.get(
	this.state.baseComponentURL + `/${addr}`
      );
      componentList.push({address: addr, ...component.data});
    }
    this.setState({
      componentList: [...componentList],
      currentComponent: "0x0000000000000000000000000000000000000000"
    });
  }

  updateComponentList = async (component) => { 
    const url = this.state.baseComponentURL + '/' + component.address + '/child';
    const response = await axios.get(url);

    let componentList = [];
    let child; 
    console.log(response.data);
    for (c of response.data.child_address) {
      child = await axios.get(
        this.state.baseComponentURL + `/${c}`
      );
      componentList.push({address: c, ...child.data});
    }
    console.log(componentList);
    this.setState({
      componentList: [...componentList],
      currentComponent: component
    });
  }

  showChildComponentsHandler = (component) => {
    const text = "Showing child components for: " + component.address;
    Toast.show({
      text: text,
      textStyle: { color: "yellow" },
      buttonText: "Okay"
    });
    this.updateComponentList(component);
  }

  showParentComponentHandler = async (component) => {
    text = "Showing parent component";
    Toast.show({
      text: text,
      textStyle: { color: "yellow" },
      buttonText: "Okay"
    });

    if (component.parentComponent === '0x0000000000000000000000000000000000000000' || 
      component === '0x0000000000000000000000000000000000000000') {
      console.log('this is called');
      this.loadApp();
      return;
    }

    const response = await axios.get('/api/v1/component/' + component.parentComponent);
    
    const currentComponent = response.data;

    let child;
    let componentList = [];
    console.log(currentComponent);
    for (c of currentComponent.childComponentList) {
      child = await axios.get(
	this.state.baseComponentURL + `/${c}`
      );
      componentList.push({address: c, ...child.data});
    }
    this.setState({
      currentComponent: {...currentComponent},
      componentList: [...componentList]
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
	  this.state.currentComponent !== '0x0000000000000000000000000000000000000000' ? 
	  <Header style={{backgroundColor: '#808080'}}>
	    <Button transparent success onPress={() => this.showParentComponentHandler(this.state.currentComponent)}>
	      <Text>{this.state.currentComponent.data} children</Text>
	    </Button>
	  </Header>
	  : <Header style={{backgroundColor: '#808080'}}>
	    <Button transparent success onPress={() => this.showParentComponentHandler(this.state.currentComponent)}>
	      <Text>All Components</Text>
	    </Button>
	  </Header>
	}
	<ComponentList
	  components={this.state.componentList}
	  showChildComponents={this.showChildComponentsHandler}	
	/>
      </Container>
    );
  }
}

export default Tracking;
