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
  ListItem,
  Input,
  Item,
  Form,
  Label,
  H1,
  H3
} from "native-base";

import styles from "./styles";
import axios from '../../axios';

export default class AddComponents extends Component {

    state = {
      data: null
    };

    handleComponentDataChange = (text) => {
      this.setState({data: text});
    }	

    handleCreate = () => {
      axios.post('/api/v1/component', {
	'data': this.state.data
      }).then(res => {
	const text = 'Component created successfully';
	Toast.show({
	  text: text,
	  textStyle: { color: "yellow" },
	  buttonText: "Okay"
	});
	console.log(res);
      }).catch(err => {
	const text = 'Error while creating component';
	Toast.show({
	  text: text,
	  textStyle: { color: "red" },
	  buttonText: "Okay"
	});
	console.log(err);	
      })
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
	      <Text>Add components page</Text>
	    </Body>
	    <Right />
	  </Header>
	  <Form>
	    <Item floatingLabel>
	      <Label>Component data</Label>
	      <Input onChangeText={(text) => this.handleComponentDataChange(text)}/>
	    </Item>
	  </Form>
	  <Body style={{flexDirection: "row", justifyContent: "center", marginTop: 15}}>
	    <Button primary onPress={this.handleCreate}><Text> Create </Text></Button>
	  </Body>
	</Container>
      )
    }
}
