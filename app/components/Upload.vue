<template>
  <ListView
    v-if="saving"
    row="0"
    col="1"
    col-span="3"
    for="item in tasks"
  >
    <v-template>
      <StackLayout>
        <Label :text="item.description" />
        <Progress
          :value="item.upload"
          :max-value="item.totalUpload"
        />
        <Label :text="'Lade: ' + item.upload + ' / ' + item.totalUpload" />
        <Label :text="'Status: ' + item.status" />
      </StackLayout>
    </v-template>
  </ListView>
  <StackLayout
    v-else
    class="p-20"
  >
    <Label :text="'foldertosave'|L" />
    <ListPicker
      v-if="folderLoaded && hasFolders"
      key="folders.length"
      v-model="selectedFolder"
      :items="folders"
    />
    <Button
      :text="'newfolder'|L"
      class="btn btn-primary"
      @tap="newFolder()"
    />
    <Button
      :text="'continue'|L"
      class="btn btn-primary"
      @tap="uploadToCloud()"
    />
  </StackLayout>
</template>

<script>
const appSettings = require('application-settings');
const bgHttp = require('nativescript-background-http');

export default {
  props: {
    pdfFile: {
      type: Object,
      default() { return {}; },
    },
  },
  data() {
    return {
      saving: false,
      mstoken: '',
      folders: [],
      folderLoaded: false,
      hasFolders: false,
      selectedFolder: 0,
      session: bgHttp.session('image-upload'),
      tasks: [],
    };
  },
  mounted() {
    this.mstoken = appSettings.getString('mstoken');
    this.getDrives();
  },
  methods: {
    newFolder() {
      prompt({
        title: this.$localize('newfolder'),
        message: this.$localize('enternewfoldername'),
        okButtonText: this.$localize('create'),
        cancelButtonText: this.$localize('cancel'),
        defaultText: this.$localize('newfolder'),
      }).then((result) => {
        console.log(`Dialog result: ${result.result}, text: ${result.text}`);
        fetch('https://graph.microsoft.com/v1.0/me/drive/special/approot/children', {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.mstoken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: result.text,
            folder: { },
            '@microsoft.graph.conflictBehavior': 'rename',
          }),
        })
          .then((response) => {
            response.json().then((json) => {
              console.log(json);
              this.getDrives();
            });
          }).catch((e) => {
          });
      });
    },
    getDrives() {
      this.folders = [];
      this.folderLoaded = false;
      this.hasFolders = false;
      console.log(this.mstoken);
      fetch('https://graph.microsoft.com/v1.0/me/drive/special/approot/children?filter=folder%20ne%20null', {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.mstoken}` },
      })
        .then((response) => {
          response.json().then((json) => {
            console.log(json);
            if (json.value.length > 0) {
              let i = 0;
              const previousId = appSettings.getString('previousFolderId');
              json.value.forEach((folder) => {
                this.folders.push({
                  id: folder.id, name: folder.name, toString: () => folder.name,
                });
                if (folder.id === previousId) {
                  this.selectedFolder = i;
                }
                i += 1;
              });
              this.hasFolders = true;
            } else {
              this.hasFolders = false;
            }

            this.folderLoaded = true;
          });
        }).catch((e) => {
        });
    },
    uploadToCloud() {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
      const yyyy = today.getFullYear();

      const filename = `${yyyy}-${mm}-${dd}-${Math.floor(Date.now() / 1000)}.pdf`;
      const folderId = this.folders[this.selectedFolder].id;
      appSettings.setString('previousFolderId', this.folders[this.selectedFolder].id);
      const mstoken = appSettings.getString('mstoken');

      const request = {
        url: `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}:/${filename}:/content`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${mstoken}`, 'Content-Type': 'application/pdf', Prefer: 'respond-async' },
        description: 'Lade in Cloud',
        androidAutoDeleteAfterUpload: true,
        androidNotificationTitle: this.$localize('synchronizing'),
      };
      const task = this.session.uploadFile(this.pdfFile.path, request);


      function onEvent(e) {
        console.log(e);
        this.$set(this.tasks, this.tasks.indexOf(task), task);
        if (e.eventName === 'responded') {
          console.log('RESPONDED', JSON.parse(e.data));
          const pdfLink = JSON.parse(e.data)['@microsoft.graph.downloadUrl'];
          this.$emit('success', pdfLink);
        }
        if (e.eventName === 'error') {
          console.log('ERROR', e.data);
        }
      }
      task.on('progress', onEvent.bind(this));
      task.on('error', onEvent.bind(this));
      task.on('responded', onEvent.bind(this));
      task.on('complete', onEvent.bind(this));
      this.tasks.push(task);
    },
  },
};
</script>
