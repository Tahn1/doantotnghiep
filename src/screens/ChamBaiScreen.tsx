//ChamBaiScreen.tsx expoapp
import React, { useRef, useEffect, useState } from "react";
import { CameraView, Camera, useCameraPermissions } from "expo-camera";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
export default function ChamDiemScreen() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: "black" }} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Ứng dụng cần quyền truy cập camera để chấm bài
        </Text>
        <Button title="Cấp quyền" onPress={requestPermission} />
      </View>
    );
  }

  const chupAnh = async () => {
    if (cameraRef.current) {
      // Gọi hàm takePhotoAsync để chụp ảnh
      const photo = await Camera.takePhotoAsync(cameraRef.current);
      // Lưu đường dẫn ảnh để xử lý hoặc gửi lên server
      setPhotoUri(photo.uri);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {!photoUri ? (
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
          {/* Overlay căn chỉnh - 4 ô vuông ở các góc */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          {/* Nút chụp ảnh */}
          <TouchableOpacity style={styles.captureButton} onPress={chupAnh}>
            <Text style={{ color: "white", fontSize: 16 }}>Chụp ảnh</Text>
          </TouchableOpacity>
        </CameraView>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Xem lại ảnh đã chụp */}
          <Text>Ảnh đã chụp: {photoUri}</Text>
          {/* Gửi ảnh lên server / xử lý cục bộ... */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  permissionText: {
    textAlign: "center",
    marginBottom: 8,
    fontSize: 16,
  },
  corner: {
    position: "absolute",
    width: 80,
    height: 80,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 2,
    borderColor: "white",
  },
  topLeft: {
    top: 40,
    left: 40,
  },
  topRight: {
    top: 40,
    right: 40,
  },
  bottomLeft: {
    bottom: 100,
    left: 40,
  },
  bottomRight: {
    bottom: 100,
    right: 40,
  },
  captureButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 12,
    borderRadius: 8,
  },
});
