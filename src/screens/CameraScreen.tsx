import React, { Component, useRef, useEffect, useState } from "react";
import { CameraView, Camera, useCameraPermissions } from "expo-camera";
import {
  AppRegistry,
  View,
  Text,
  Platform,
  Image,
  TouchableOpacity,
} from "react-native";
// import { RNCamera as Camera } from "react-native-camera";
import Toast, { DURATION } from "react-native-easy-toast";

import styles from "../Styles/Screens/CameraScreen";
import OpenCV from "../NativeModules/OpenCV";
import CircleWithinCircle from "../assets/svg/CircleWithinCircle";

const cameraRef = useRef(null);
const [permission, requestPermission] = useCameraPermissions();
const [photoUri, setPhotoUri] = useState<string | null>(null);

export default class CameraScreen extends Component {
  constructor(props) {
    super(props);

    this.takePicture = this.takePicture.bind(this);
    this.checkForBlurryImage = this.checkForBlurryImage.bind(this);
    this.proceedWithCheckingBlurryImage =
      this.proceedWithCheckingBlurryImage.bind(this);
    this.repeatPhoto = this.repeatPhoto.bind(this);
    this.usePhoto = this.usePhoto.bind(this);
  }

  state = {
    cameraPermission: false,
    photoAsBase64: {
      content: "",
      isPhotoPreview: false,
      photoPath: "",
    },
  };

  checkForBlurryImage(imageAsBase64) {
    return new Promise((resolve, reject) => {
      if (Platform.OS === "android") {
        OpenCV.checkForBlurryImage(
          imageAsBase64,
          (error) => {
            // error handling
          },
          (msg) => {
            resolve(msg);
          }
        );
      } else {
        OpenCV.checkForBlurryImage(imageAsBase64, (error, dataArray) => {
          resolve(dataArray[0]);
        });
      }
    });
  }

  proceedWithCheckingBlurryImage() {
    const { content, photoPath } = this.state.photoAsBase64;

    this.checkForBlurryImage(content)
      .then((blurryPhoto) => {
        if (blurryPhoto) {
          this.refs.toast.show("Photo is blurred!", DURATION.FOREVER);
          return this.repeatPhoto();
        }
        this.refs.toast.show("Photo is clear!", DURATION.FOREVER);
        this.setState({
          photoAsBase64: {
            ...this.state.photoAsBase64,
            isPhotoPreview: true,
            photoPath,
          },
        });
      })
      .catch((err) => {
        console.log("err", err);
      });
  }

  async takePicture() {
    if (this.camera) {
      const options = { quality: 0.5, base64: true };
      const data = await this.camera.takePictureAsync(options);
      this.setState({
        ...this.state,
        photoAsBase64: {
          content: data.base64,
          isPhotoPreview: false,
          photoPath: data.uri,
        },
      });
      this.proceedWithCheckingBlurryImage();
    }
  }

  repeatPhoto() {
    this.setState({
      ...this.state,
      photoAsBase64: {
        content: "",
        isPhotoPreview: false,
        photoPath: "",
      },
    });
  }

  usePhoto() {
    // do something, e.g. navigate
  }

  render() {
    if (this.state.photoAsBase64.isPhotoPreview) {
      return (
        <View style={styles.container}>
          <Toast ref="toast" position="center" />
          <Image
            source={{
              uri: `data:image/png;base64,${this.state.photoAsBase64.content}`,
            }}
            style={styles.imagePreview}
          />
          <View style={styles.repeatPhotoContainer}>
            <TouchableOpacity onPress={this.repeatPhoto}>
              <Text style={styles.photoPreviewRepeatPhotoText}>
                Repeat photo
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.usePhotoContainer}>
            <TouchableOpacity onPress={this.usePhoto}>
              <Text style={styles.photoPreviewUsePhotoText}>Use photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

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
}

AppRegistry.registerComponent("CameraScreen", () => CameraScreen);
