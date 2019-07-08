import React, { Component } from "react";
import { Container, Header, Left, Body, Picker, Input, Right, Button, Icon, Title, Segment, Toast, Content, Text, Label, Item, Form } from 'native-base';
import styles from "./styles";
import axios from '../../axios';

import PickerItems from './pickerItems';

export default class UpdateComponent extends Component {
  state = {
    selected: undefined,
    data: '',
    componentList: []
  }

  componentWillMount() {
    this.loadComponents();
  }

  dataChangedHandler = (text) => {
    this.setState({ data: text });
  }

  loadComponents() {
    axios.get('/api/v1/component').then(res => {
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
        this.setState({
          componentList: componentList,
          selected: componentList[0]
        });
        //console.log(this.state.componentList);
      }).catch(e =>
        console.log(e)
      );
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
    const url = '/api/v1/_component/' + this.state.selected.address;
    axios.put(url, { 'data': this.state.data })
      .then(res => {
        this.loadComponents();
        console.log(res);
      })
      .catch(err => console.log(err));
  }

  onValueChange = (e) => {
    this.setState({
      selected: e
    });
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
          <Form>
            <Item floatingLabel>
              <Label>Component new data data</Label>
              <Input onChangeText={(text) => this.dataChangedHandler(text)} />
            </Item>
          </Form>
          <Body style={{ flexDirection: "row", justifyContent: "center", marginTop: 15 }}>
            <Button primary onPress={this.handleUpdate}><Text> Update </Text></Button>
          </Body>
        </Content>
      </Container>
    );
  }
}
