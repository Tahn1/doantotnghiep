// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
// import DrawerNavigator from "./src/navigation/DrawerNavigator";
import TestOpenCV from "./TestOpenCV";

export default function App() {
  return (
    <NavigationContainer>
      {/* Thay DrawerNavigator bằng TestOpenCV để test nhanh */}
      <TestOpenCV />
    </NavigationContainer>
  );
}
