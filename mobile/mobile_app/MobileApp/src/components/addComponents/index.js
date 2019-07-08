import React, { Component } from "react";
import {
  Container,
  Header,
  Button,
  Icon,
  Text,
  Left,
  Body,
  Right,
  Input,
  Item,
  Form,
  Label,
  Toast
} from "native-base";

import styles from "./styles";
import axios from '../../axios';

export default class AddComponents extends Component {

  state = {
    name: '',
    expirationTime: 0,
    price: 0,
    otherInformation: '',
    lockValue: 0,
    baseURL: '/api/v1/component'
  };

  handleChangeName = (name) => {
    this.setState({ name: name });
  }

  handleChangeExpirationTime = (expirationTime) => {
    this.setState({ expirationTime: expirationTime });
  }

  handleChangePrice = (price) => {
    this.setState({ price: price });
  }

  handleChangeLockValue = (lockValue) => {
    this.setState({ lockValue: lockValue });
  }

  handleChangeOtherInformation = (otherInformation) => {
    console.log('HandleChangeOtherInformation:');
    console.log(otherInformation);
    this.setState({ otherInformation: otherInformation });
  }

  handleCreate = async () => {

    if (this.state.name === '' ||
      this.state.expirationTime === 0 ||
      this.state.price === 0 ||
      this.state.otherInformation === '' ||
      this.state.lockValue === 0
    ) {
      Toast.show({
        text: 'Please add text to all fields',
        textStyle: { color: "red" },
        buttonText: "Okay"
      });
      return;
    }
    const response = await axios.post(this.state.baseURL,
      {
        'name': this.state.name,
        'expirationTime': this.state.expirationTime,
        'price': this.state.price,
        'otherInformation': this.state.otherInformation,
        'value': this.state.lockValue
      }
    );
    console.log('RESPONSE:');
    console.log(response);
  }

  render() {
    return (
      <Container style={styles.container}>
        <Header style={{ backgroundColor: '#808080' }}>
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
            <Label>Name:</Label>
            <Input onChangeText={(text) => this.handleChangeName(text)} />
          </Item>
          <Item floatingLabel>
            <Label>expirationTime:</Label>
            <Input
              onChangeText={(text) => this.handleChangeExpirationTime(text)}
              keyboardType="numeric"
            />
          </Item>
          <Item floatingLabel>
            <Label>Price:</Label>
            <Input
              onChangeText={(text) => this.handleChangePrice(text)}
              keyboardType="numeric"
            />
          </Item>
          <Item floatingLabel>
            <Label>LockValue:</Label>
            <Input
              onChangeText={(text) => this.handleChangeLockValue(text)}
              keyboardType="numeric"
            />
          </Item>
          <Item floatingLabel>
            <Label>OtherInformation:</Label>
            <Input onChangeText={(text) => this.handleChangeOtherInformation(text)} />
          </Item>
        </Form>
        <Body style={{ flexDirection: "row", justifyContent: "center", marginTop: 15 }}>
          <Button primary onPress={this.handleCreate}><Text> Create </Text></Button>
        </Body>
      </Container>
    )
  }
}
