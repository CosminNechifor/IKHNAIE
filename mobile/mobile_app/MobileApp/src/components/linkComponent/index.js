import React, { Component } from "react";
import { Container, Header, Left, Body, Right, Button, Icon, Title, Segment, Content, Text } from 'native-base';
import styles from "./styles";
import axios from '../../axios';


export default class LinkComponent extends Component {

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
            <Text>Link component</Text>
          </Body>
          <Right />
        </Header>
        <Content padder>
          <Text>Coresponding fields</Text>
        </Content>
      </Container>
    );
  }
}
