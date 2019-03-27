<template>
  <GridLayout
    columns="*, 2*"
    rows="auto, auto"
    background-color="#3c495e"
    style="margin-top:5"
  >
    <Image
      row="0"
      col="0"
      :src="img.src"
      width="75"
    />
    <ListView
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
          <Label :text="'Uploading: ' + item.upload + ' / ' + item.totalUpload" />
          <Label :text="'Status: ' + item.status" />
        </StackLayout>
      </v-template>
    </ListView>
    <ListView
      v-if="false"
      row="2"
      col-span="3"
      for="item in events"
    >
      <v-template let-item="item">
        <StackLayout>
          <Label :text="item.eventTitle" />
          <Label
            :text="item.eventData"
            text-wrap="true"
          />
        </StackLayout>
      </v-template>
    </ListView>

    <Button
      row="3"
      col="0"
      col-span="2"
      margin="2"
      text="Scannen"
      @tap="onUploadMultiTap"
    />
  </gridlayout>
</template>

<script>
const bgHttp = require('nativescript-background-http');
const fs = require('file-system');
const platform = require('platform');
const appSettings = require('application-settings');

export default {
  props: {
    img: {
      type: Object,
      default() { return {}; },
    },
  },
  data() {
    return {
      tasks: [],
      events: [],
      /* file: fs.path.normalize(
        `${fs.knownFolders.currentApp().path}/bigpic.jpg`,
      ), */
      // NOTE: This works for emulator. Real device will need other address.
      session: bgHttp.session('image-upload'),
      counter: 0,
    };
  },
  computed: {
    file() {
      return fs.path.normalize(
        this.img.src.android,
      );
    },
  },
  mounted() {
    console.log('IMAGE', this.img);
  },
  methods: {
    onUploadWithErrorTap(e) {
      this.session = bgHttp.session('image-upload');
      this.resize(true, false);
    },
    onUploadTap(e) {
      this.resize(false, false);
    },
    onUploadMultiTap() {
      this.resize(false, true);
    },
    resize() {
      const name = this.file.substr(this.file.lastIndexOf('/') + 1);
      const description = `${name}`;
      const request = {
        url: 'https://img-resize.com/resize',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'File-Name': name,
          'X-Requested-With': 'XMLHttpRequest',
        },
        description,
        androidAutoDeleteAfterUpload: false,
        androidNotificationTitle: 'NativeScript HTTP background',
      };
      // let task; // bgHttp.Task;
      let lastEvent = '';
      const params = [
        { name: 'op', value: 'scale' },
        { name: 'scaledWidth', value: '1000' },
        {
          name: 'input',
          filename: this.file,
          mimeType: 'image/jpeg',
        },
      ];
      const task = this.session.multipartUpload(params, request);

      function onEvent(e) {
        /* console.log('EVENT', e);
        console.log('EVENTDATA', e.data); */
        if (lastEvent !== e.eventName) {
          // suppress all repeating progress events and only show the first one
          lastEvent = e.eventName;
        } else {
          return;
        }
        this.events.push({
          eventTitle: `${e.eventName} ${e.object.description}`,
          eventData: JSON.stringify({
            error: e.error ? e.error.toString()
              : e.error,
            currentBytes: e.currentBytes,
            totalBytes: e.totalBytes,
            body: e.data,
          }),
        });
        this.$set(this.tasks, this.tasks.indexOf(task), task);
        if (e.eventName === 'responded') {
          this.generatePdf(`https://img-resize.com${JSON.parse(e.data).view}`);
        }
      }
      task.on('progress', onEvent.bind(this));
      task.on('error', onEvent.bind(this));
      task.on('responded', onEvent.bind(this));
      task.on('complete', onEvent.bind(this));
      lastEvent = '';
      this.tasks.push(task);
    },
    generatePdf(imageUrl) {
      console.log('generating pdf', imageUrl);
      fetch(`https://api.ocr.space/parse/imageurl?isCreateSearchablePdf=true&language=ger&isSearchablePdfHideTextLayer=true&apikey=b8eaa39a6588957&url=${imageUrl}`)
        .then(response => response.text())
        .then((data) => {
          this.uploadPdf(JSON.parse(data).SearchablePDFURL);
        }).catch((e) => {
        });
    },
    uploadPdf(pdfUrl) {
      console.log('starting uploadPdf', pdfUrl);
      const mainFolderId = appSettings.getString('mainFolderId');
      const mstoken = appSettings.getString('mstoken');
      fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${mainFolderId}/children`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${mstoken}`, 'Content-Type': 'application/json', Prefer: 'respond-async' },
        body: JSON.stringify({
          '@microsoft.graph.sourceUrl': pdfUrl,
          name: 'test.pdf',
          file: { },
        }),
      })
        .then(response => response.text())
        .then((data) => {
          console.log(data);
        }).catch((e) => {
          console.log(e);
        });
    },
    onItemLoading(args) {
      const label = args.view.getViewById('imageLabel');
      label.text = `image ${args.index}`;
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
