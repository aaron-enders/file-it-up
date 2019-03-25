<template>
  <Page class="page">
    <ActionBar class="action-bar">
      <Label
        class="action-bar-title"
        text="File It Up"
      />
    </ActionBar>
    <StackLayout>
      <Auth />
      <Photo @selected="selected" />
      <Upload
        v-if="image !== ''"
        :img="image"
      />
    </StackLayout>
  </Page>
</template>

<script>
import Auth from '@/components/Auth.vue';
import Photo from '@/components/Photo.vue';
import Upload from '@/components/Upload.vue';

export default {
  components: {
    Photo, Upload, Auth,
  },
  data() {
    return {
      image: '',
    };
  },
  methods: {
    selected(img) {
      this.image = img;
    },
  },
};
</script>

<style scoped lang="scss">
    // Start custom common variables
    // End custom common variables
    // Custom styles
    .fa {
        color: #000000;
    }

    .info {
        font-size: 20;
    }
</style>
