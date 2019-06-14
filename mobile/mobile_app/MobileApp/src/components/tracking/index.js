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
    componentList: [ 
    ],
    componentsHistory: []
  };
  
  componentWillMount() {
    this.loadApp();
  }

  loadApp() {
    axios.get('/api/v1/component').then(res => {
      let requests = res.data.components.map(addr => {
	return axios.get('/api/v1/component/' + addr);
      });
      Promise.all(requests).then(res => {
	const componentList = res.map(r => {
	  console.log(r.data);
	  return {
	    'data': r.data.data,
	    'parent': r.data.parentAddress,
	    'address': r.data.componentAddress
	  };
	});
	this.setState({
	  componentList: componentList,
	  currentComponent: '0x0000000000000000000000000000000000000000'
	});
      }).catch(e => 
	console.log(e)
      );
    });
  }

  updateComponentList(component) {
    const url = '/api/v1/component/'+component.address+'/child'
    axios.get(url).then(res => {
      let requests = res.data.childComponentsAddresses.map(addr => {
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
	this.setState({componentList: componentList, currentComponent: component});
      }).catch(e => 
	console.log(e)
      );
    }).catch(e => {
      console.log(e);
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

  showParentComponentHandler = (component) => {
    text = "Showing parent component";
    Toast.show({
      text: text,
      textStyle: { color: "yellow" },
      buttonText: "Okay"
    });

    if (component.parent === '0x0000000000000000000000000000000000000000' || 
      component === '0x0000000000000000000000000000000000000000') {
      console.log('this is called');
      this.loadApp();
      return;
    }

    axios.get('/api/v1/_component/' + component.parent).then(res => {
      const parentComponent = {
	'data': res.data.data,
	'parent': res.data.parentAddress,
	'address': res.data.componentAddress
      };
      console.log(parentComponent);
      this.updateComponentList(parentComponent);
    }).catch(e => console.log(e));
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
