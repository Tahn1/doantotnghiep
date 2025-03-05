import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";

// Import API OpenCV
import { CvInvoke, Mat } from "react-native-opencv3";

export default function TestOpenCV() {
  const [resultUri, setResultUri] = useState("");

  useEffect(() => {
    // Gọi hàm test OpenCV khi component mount
    testOpenCV();
  }, []);

  const testOpenCV = () => {
    console.log("Starting OpenCV test...");

    // Ví dụ: load 1 ảnh "test.jpg" từ bundle (Android: /android/app/src/main/assets/, iOS: Copy Bundle Resources)
    CvInvoke.loadImageFromBundle("test.jpg", (srcMat: Mat) => {
      if (!srcMat) {
        console.log("Không load được ảnh, kiểm tra file test.jpg");
        return;
      }
      console.log("Image loaded, matId=", srcMat.matId);

      // Tạo dstMat
      let dstMat = new Mat();

      // Dùng hàm canny để test
      CvInvoke.canny(
        srcMat,
        dstMat,
        50, // threshold1
        150, // threshold2
        (res) => {
          console.log("Canny result code:", res);

          // Chuyển dstMat -> base64 => hiển thị
          CvInvoke.toDataURL(dstMat, (base64Str) => {
            // Tạo URI base64
            const uri = "data:image/png;base64," + base64Str;
            setResultUri(uri);

            // Giải phóng Mat
            CvInvoke.release(srcMat);
            CvInvoke.release(dstMat);
          });
        }
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test OpenCV</Text>
      {resultUri ? (
        <Image
          style={styles.image}
          source={{ uri: resultUri }}
          resizeMode="contain"
        />
      ) : (
        <Text>Đang xử lý hoặc chưa load ảnh...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  image: {
    width: 300,
    height: 300,
    backgroundColor: "#ccc",
    marginTop: 16,
  },
});
