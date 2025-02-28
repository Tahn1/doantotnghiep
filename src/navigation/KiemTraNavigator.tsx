// src/navigation/KiemTraNavigator.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

// Import các màn hình
import KiemTraScreen from "../screens/KiemTraScreen";
import BaiThiScreen from "../screens/BaiThiScreen";
import DapAnScreen from "../screens/DapAnScreen";
import ChamBaiScreen from "../screens/ChamBaiScreen";
import XemLaiScreen from "../screens/XemLaiScreen";
const Stack = createStackNavigator();

export default function KiemTraNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Tắt header mặc định, ta sẽ custom header
      }}
    >
      <Stack.Screen name="KiemTraHome" component={KiemTraScreen} />
      <Stack.Screen name="BaiThi" component={BaiThiScreen} />
      <Stack.Screen name="DapAn" component={DapAnScreen} />
      <Stack.Screen name="ChamBai" component={ChamBaiScreen} />
      <Stack.Screen name="XemLai" component={XemLaiScreen} />
    </Stack.Navigator>
  );
}
