import React, { Component } from "react";
import { Container, Header, Left, Body, Right, Button, Icon, Title, Segment, Content, Text } from 'native-base';
import styles from "./styles";
import axios from '../../axios';


export default class UpdateComponent extends Component {
  state = {
    data: ''
  }


  

  dataChangedHandler = (text) => {
    this.setState({data: text});
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
            <Text>Update component</Text>
          </Body>
          <Right />
        </Header>
        <Content padder>
          <Form>
            <Item floatingLabel>
              <Label>Component new data data</Label>
              <Input onChangeText={(text) => this.dataChangedHandler(text)}/>
            </Item>
          </Form>
          <Body style={{flexDirection: "row", justifyContent: "center", marginTop: 15}}>
            <Button primary onPress={this.handleCreate}><Text> Create </Text></Button>
          </Body>
        </Content>
      </Container>
    );
  }
}
