import React, { Component } from "react";
import { Container, Header, Content, Card, CardItem, Text, Body, Button } from 'native-base';

const componentElement = (props) => props.components.map(e => {
  return (
    <Card key={e.address}>
      <CardItem header>
        <Text>{e.data}</Text>
      </CardItem>
      <CardItem>
        <Body>
          <Text>
            Component Address: {e.address}
          </Text>
          <Text>
            Parent Address: {e.parent}
          </Text>
        </Body>
      </CardItem>
      <CardItem footer>
        <Button light onPress={() => props.showChildComponents(e)}> 
          <Text>
            Child components 
          </Text>
        </Button>
      </CardItem>
    </Card>
  );
}); 

export default componentElement;
