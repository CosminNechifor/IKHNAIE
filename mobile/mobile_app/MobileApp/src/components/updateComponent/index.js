import React, { Component } from "react";
import { Container, Header, Left, Body, Picker, Input, Right, Button, Icon, Title, Segment, Toast, Content, Text, Label, Item, Form } from 'native-base';
import styles from "./styles";
import axios from '../../axios';
import stateNumberToText from '../../stateToString';
import isRootComponent from '../../auxiliaryFunctions';

import PickerItems from './pickerItems';

export default class UpdateComponent extends Component {
  state = {
    selected: undefined,
    name: '',
    expirationTime: 0,
    price: 0,
    otherInformation: '',
    componentList: [],
    baseUserComponentsURL: '/api/v1/user/component',
    baseComponentURL: '/api/v1/component'
  }

  componentWillMount() {
    this.loadComponents();
  }

  dataChangedHandler = (text) => {
    this.setState({ data: text });
  }

  loadComponents = async () => {
    const response = await axios.get(this.state.baseUserComponentsURL);
    const componentsAddressList = response.data.components;

    let requests = [];
    for (addr of componentsAddressList) {
      url = this.state.baseComponentURL + '/' + addr
      requests.push(axios.get(url));
    }

    Promise.all(requests).then((responses) => {
      let componentList = [];
      let newString;
      for (r of responses) {
        newString = new String(r.request.url);
        componentList.push({ address: newString.slice(42), ...r.data });
      }
      if (componentList.length > 0) {
        this.setState({ componentList: [...componentList], selected: componentList[0] });
      } else {
        this.setState({ componentList: [...componentList] });
      }
    }).catch((err) => {
      console.log('Error in loadComponents[UPDATE]');
      console.log(err);
    });
  }

  handleUpdate = () => {
    const text = "Component data was updated!";
    // console.log(this.state.selected);
    Toast.show({
      text: text,
      textStyle: { color: "yellow" },
      buttonText: "Okay"
    });
  }

  onValueChange = (e) => {
    this.setState({
      selected: e
    });
  }

  handleResponse = (response) => {
    if (response.status === 200) {
      Toast.show({
        text: "Success",
        textStyle: { color: "green" },
        buttonText: "Okay"
      });
      return true;
    } else {
      Toast.show({
        text: "Fail",
        textStyle: { color: "red" },
        buttonText: "Okay"
      });
      return false;
    }
  }

  handleChangeName = async (input) => {
    const newObj = { ...this.state.selected, componentName: input };
    this.setState({ selected: newObj });
  }

  handleChangePrice = (input) => {
    const newPrice = parseInt(input);
    const newObj = { ...this.state.selected, price: newPrice };
    this.setState({ selected: newObj });
  }

  handleChangeOtherInformation = (input) => {
    const newObj = { ...this.state.selected, otherInformation: input };
    this.setState({ selected: newObj });
  }

  handleUpdateName = async () => {
    const URL = `/api/v1/component/${this.state.selected.address}/updateComponentName`;
    const response = await axios.put(
      URL,
      {
        'name': this.state.selected.componentName
      }
    );
    this.handleResponse(response);
  }

  handleUpdatePrice = async () => {
    const URL = `/api/v1/component/${this.state.selected.address}/updateComponentPrice`;
    const response = await axios.put(
      URL,
      {
        'price': this.state.selected.price
      }
    );
    this.handleResponse(response);
  }

  handleUpdateOtherInformation = async () => {
    const URL = `/api/v1/component/${this.state.selected.address}/updateComponentOtherInformation`;
    const response = await axios.put(
      URL,
      {
        'otherInformation': this.state.selected.otherInformation
      }
    );
    this.handleResponse(response);
  }

  submitToMarket = async () => {
    const URL = `/api/v1/market/${this.state.selected.address}`;
    const response = await axios.post(URL);
    if (this.handleResponse(response)) {
      this.setState({ selected: { ...this.state.selected, state: 1 } });
    }
  }

  render() {
    return (
      <Container style={styles.container}>
        <Header style={{ backgroundColor: '#808080' }}>
          <Left>
            <Button
              transparent
              onPress={() => { this.props.navigation.openDrawer(); this.loadComponents() }}
            >
              <Icon name="menu" />
            </Button>
          </Left>
          <Body>
            <Text>Update component</Text>
          </Body>
          <Right />
        </Header>
        <Content padder>
          <PickerItems
            options={this.state.componentList}
            selectedValue={this.state.selected}
            onValueChange={this.onValueChange}
          />
          {
            this.state.selected !== undefined ?
              <Form>
                <Label style={{ paddingLeft: 17 }}>State: {stateNumberToText(this.state.selected.state)}</Label>
                <Label style={{ paddingLeft: 17, marginTop: 5 }}>
                  Is Root Component: { isRootComponent(this.state.selected) ? <Text>Yes</Text> : <Text>No</Text> }
                </Label>
                <Item floatingLabel>
                  <Label>Price: {this.state.selected.price}</Label>
                  <Input keyboardType="numeric" onChangeText={(text) => this.handleChangePrice(text)} />
                </Item>
                {
                  this.state.selected.state === 0 ?
                    <React.Fragment>
                      <Item floatingLabel>
                        <Label>Component Name: {this.state.selected.componentName}</Label>
                        <Input onChangeText={(text) => this.handleChangeName(text)} />
                      </Item>
                      <Item floatingLabel>
                        <Label>Other Information: {this.state.selected.otherInformation}</Label>
                        <Input onChangeText={(text) => this.handleChangeOtherInformation(text)} />
                      </Item>
                    </React.Fragment>
                    : null
                }
              </Form>
              :
              <Text>It is undefined</Text>
          }
          <Body style={{ flexDirection: "column", justifyContent: "center", marginTop: 15 }}>
            {
              this.state.selected && this.state.selected.state === 0 ?
                <React.Fragment>
                  <Button style={{ marginTop: 10, marginLeft: 47 }} primary onPress={this.handleUpdateName}><Text>Update Name</Text></Button>
                  <Button style={{ marginTop: 10 }} primary onPress={this.handleUpdateOtherInformation}><Text>Update OtherInformation</Text></Button>
                  <Button style={{ marginTop: 10, marginLeft: 47 }} primary onPress={this.handleUpdatePrice}><Text>Update Price</Text></Button>
                </React.Fragment>
                :
                <Button primary onPress={this.handleUpdatePrice}><Text>Update Price</Text></Button>
            }
            {
              this.state.selected && isRootComponent(this.state.selected) &&
                (
                  this.state.selected.state === 0 ||
                  this.state.selected.state === 2 ||
                  this.state.selected.state === 3 ||
                  this.state.selected.state === 4
                ) ?
                <React.Fragment>
                  <Button style={{ marginTop: 10, marginLeft: 30 }} success onPress={this.submitToMarket}><Text>Submit to Mrket</Text></Button>
                </React.Fragment> :
                null
            }
          </Body>
        </Content>
      </Container>
    );
  }
}
