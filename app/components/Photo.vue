<template>
  <StackLayout background-color="#3c495e">
    <Button
      text="Foto aufnehmen"
      @tap="scan"
    />
  </StackLayout>
</template>

<script>
import * as camera from 'nativescript-camera';
import { Image } from 'tns-core-modules/ui/image';

const { ImageCropper } = require('nativescript-imagecropper');
const imageSource = require('tns-core-modules/image-source');

const fileSystemModule = require('tns-core-modules/file-system');

export default {
  name: 'Photo',
  data() {
    return {
      img: '',
    };
  },
  methods: {
    scan() {
      camera.requestPermissions()
        .then(() => {
          camera.takePicture({
            width: 500, height: 500, keepAspectRatio: false, saveToGallery: false,
          })
            .then((imageAsset) => {
              console.log('ASSET', imageAsset);
              const img = new Image();
              img.src = imageAsset;


              // this.images.push(img);
              this.$emit('selected', img);
            })
            .catch((e) => {
              console.log('error:', e);
            });
        })
        .catch((e) => {
          console.log('Error requesting permission');
        });
    },
  },
};
</script>

<style scoped lang="scss">

</style>
