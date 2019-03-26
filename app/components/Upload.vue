<template>
  <GridLayout
    columns="*, 2*"
    rows="auto, auto"
    background-color="#3c495e"
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
      this.startUpload(true, false);
    },
    onUploadTap(e) {
      this.startUpload(false, false);
    },
    onUploadMultiTap() {
      this.startUpload(false, true);
    },
    startUpload() {
      const name = this.file.substr(this.file.lastIndexOf('/') + 1);
      const description = `${name}`;
      const request = {
        url: 'https://api.cloudinary.com/v1_1/aaron-enders/image/upload',
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'File-Name': name,
        },
        description,
        androidAutoDeleteAfterUpload: false,
        androidNotificationTitle: 'NativeScript HTTP background',
      };
      // let task; // bgHttp.Task;
      let lastEvent = '';
      const params = [
        {
          name: 'upload_preset',
          value: 'zgatb9nt',
        },
        {
          name: 'file',
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
          this.generatePdf(JSON.parse(e.data).url);
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
      fetch(`https://api.ocr.space/parse/imageurl?isCreateSearchablePdf=true&language=ger&isSearchablePdfHideTextLayer=true&apikey=b8eaa39a6588957&url=${imageUrl}`)
        .then(response => response.text())
        .then((data) => {
          this.uploadPdf(JSON.parse(data).SearchablePDFURL);
        }).catch((e) => {
        });
    },
    uploadPdf(pdfUrl) {
      // 'https://api.cloudinary.com/v1_1/aaron-enders/image/upload'
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
