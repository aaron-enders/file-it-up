<template>
  <StackLayout class="p-20">
    <Label text="Hauptordner zum Speichern" />
    <ListPicker
      v-if="folderLoaded"
      v-model="selectedFolder"
      :items="folders"
    />
    <Button
      text="Speichern"
      class="btn btn-primary"
      @tap="saveMainFolder()"
    />
  </StackLayout>
</template>

<script>
const appSettings = require('application-settings');

export default {
  data() {
    return {
      mstoken: '',
      folders: [],
      folderLoaded: false,
      selectedFolder: 0,
    };
  },
  mounted() {
    this.mstoken = appSettings.getString('mstoken');
    this.getDrives();
  },
  methods: {
    getDrives() {
      console.log(this.mstoken);
      fetch('https://graph.microsoft.com/v1.0/me/drive/root/children', {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.mstoken}` },
      })
        .then((response) => {
          response.json().then((json) => {
            let i = 0;
            const previousId = appSettings.getString('mainFolderId');
            json.value.forEach((folder) => {
              this.folders.push({ id: folder.id, name: folder.name, toString: () => folder.name });
              if (folder.id === previousId) {
                this.selectedFolder = i;
              }
              i += 1;
            });
            this.folderLoaded = true;
          });
        }).catch((e) => {
        });
    },
    saveMainFolder() {
      appSettings.setString('mainFolderId', this.folders[this.selectedFolder].id);
      this.$emit('back');
    },
  },
};
</script>
