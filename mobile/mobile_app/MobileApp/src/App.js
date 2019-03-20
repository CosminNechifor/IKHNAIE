import React from "react";
import { Root } from "native-base";
import { createDrawerNavigator, createStackNavigator, createAppContainer } from "react-navigation";

import SideBar from "./components/sidebar";
import Home from "./components/home";
import Tracking from "./components/tracking";
import AddComponents from "./components/addComponents";
import UpdateComponent from "./components/updateComponent";
import LinkComponent from "./components/linkComponent";

const Drawer = createDrawerNavigator(
  {
    Home: { screen: Home },
    Tracking: { screen: Tracking },
    AddComponents: { screen: AddComponents },
    UpdateComponent: { screen: UpdateComponent},
    LinkComponent: { screen: LinkComponent},
  },
  {
    initialRouteName: "Home",
    contentOptions: {
      activeTintColor: "#e91e63"
    },
    contentComponent: props => <SideBar {...props} />
  }
);

const AppNavigator = createStackNavigator(
  {
    Drawer: { screen: Drawer }
  },
  {
    initialRouteName: "Drawer",
    headerMode: "none"
  }
);

const AppContainer = createAppContainer(AppNavigator);

export default () =>
  <Root>
    <AppContainer />
  </Root>;

