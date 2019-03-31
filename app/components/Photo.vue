<template>
  <StackLayout background-color="#3c495e">
    <Button
      :text="'scannew'|L"
      class="btn btn-primary"
      @tap="scan"
    />
  </StackLayout>
</template>

<script>
import * as camera from 'nativescript-camera';
import { Image } from 'tns-core-modules/ui/image';

export default {
  name: 'Photo',
  props: {
    loggedIn: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      img: '',
    };
  },
  mounted() {
    if (this.loggedIn) {
      this.scan();
    }
  },
  methods: {
    scan() {
      camera.requestPermissions()
        .then(() => {
          camera.takePicture({
            width: 500, height: 500, keepAspectRatio: false, saveToGallery: false,
          })
            .then((imageAsset) => {
              const img = new Image();
              img.src = imageAsset;
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
