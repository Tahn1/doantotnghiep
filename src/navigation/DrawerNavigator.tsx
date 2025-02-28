// src/navigation/DrawerNavigator.tsx
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

// Import Stack thay vì import KiemTraScreen
import KiemTraNavigator from "./KiemTraNavigator";
import GiayThiScreen from "../screens/GiayThiScreen";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="KiemTraStack"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Drawer.Screen
        name="KiemTraStack"
        component={KiemTraNavigator}
        options={{ drawerLabel: "Kiểm tra" }}
      />
      <Drawer.Screen
        name="GiayThi"
        component={GiayThiScreen}
        options={{ drawerLabel: "Giấy thi" }}
      />
    </Drawer.Navigator>
  );
}
