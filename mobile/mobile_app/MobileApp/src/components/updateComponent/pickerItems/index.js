import React, { Component } from "react";
import { Picker, Icon, Item } from 'native-base';

export default class PickerItems extends Component {

    render() {
        return (
            <Item picker>
                <Picker
                    mode="dropdown"
                    iosIcon={<Icon name="arrow-down" />}
                    style={{ width: undefined }}
                    placeholder="Select your component"
                    placeholderStyle={{ color: "#bfc6ea" }}
                    placeholderIconColor="#007aff"
                    selectedValue={this.props.selectedValue}
                    onValueChange={(e) => this.props.onValueChange(e)}
                >
                    {this.props.options.map(p => <Picker.Item label={p.componentName} value={p} key={p.address} />)}
                </Picker>
            </Item>
        );
    }


}  
