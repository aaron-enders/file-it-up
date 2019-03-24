<template>
  <Page class="page">
    <ActionBar class="action-bar">
      <Label
        class="action-bar-title"
        text="File It Up"
      />
    </ActionBar>
    <StackLayout>
      <Photo @selected="selected" />
      <Upload
        v-if="image !== ''"
        :img="image"
      />
    </StackLayout>
  </Page>
</template>

<script>
import Photo from '@/components/Photo.vue';
import Upload from '@/components/Upload.vue';

export default {
  components: {
    Photo, Upload,
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
