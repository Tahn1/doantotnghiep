import React, { useState, useRef, useEffect } from "react";
import { View, Text } from "react-native";
import { Camera, CameraType } from "expo-camera";

export default function ChamBaiScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>Không có quyền truy cập camera</Text>;
  }

  return (
    <Camera ref={cameraRef} style={{ flex: 1 }} type={CameraType.back}>
      {/* Overlay, v.v. */}
    </Camera>
  );
}
