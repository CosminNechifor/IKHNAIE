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
		console.log(text);
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
			  <Button primary><Text> Create </Text></Button>
		  </Body>
		</Container>
	  )
	}
}
