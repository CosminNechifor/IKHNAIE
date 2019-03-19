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
  List,
  ListItem
} from "native-base";
import styles from "./styles";

class Tracking extends Component {
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
            <Title>Tracking</Title>
          </Body>
          <Right />
        </Header>
        <Text>Tracking page</Text>
      </Container>
    );
  }
}

export default Tracking;
