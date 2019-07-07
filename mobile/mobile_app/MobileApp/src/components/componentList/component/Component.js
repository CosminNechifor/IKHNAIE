import React, { Component } from "react";
import { Card, CardItem, Text, Body, Button } from 'native-base';

const componentElement = (props) => props.components.map(e => {

  stateNumberToText = (state) => {
    switch (state) {
      case 0: 
        return 'Editable';
      case 1: 
        return 'SubmitedForSale';
      case 2: 
        return 'Owned';
      case 3: 
        return 'Broken';
      case 4: 
        return 'NeedsRecycled';
      case 5: 
        return 'Recycled';
      case 6: 
        return 'Destroyed';
    }
  }

  return (
    <Card key={e.address}>
      <CardItem header>
        <Text>{e.componentName}</Text>
      </CardItem>
      <CardItem>
        <Body>
          <Text>
            Component Address: {e.address}
          </Text>
          <Text>
            Parent Address: {e.parentComponent}
          </Text>
          <Text>Creation Time: {e.creationTime}</Text>
          <Text>Expiration: {e.expiration}</Text>
          <Text>Other Info: {e.otherInformation}</Text>
          <Text>Price: {e.price}</Text>
          <Text>Producer: {e.producer}</Text>
          <Text>State: {stateNumberToText(e.state)}</Text>
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
