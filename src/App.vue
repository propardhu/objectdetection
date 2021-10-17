<template>
  <div class="w-3/4 m-auto">
    <div>
      <h1 class="text-2xl text-green-800">
        Object detection with inbuild camara
      </h1>
      <div v-if="!isStreaming">
        <!-- <button @click="openCamera">Open Camera</button> -->
      </div>
      <div v-else class="flex justify-between">
        <!-- <button @click="stopStreaming">
          Stop Streaming
        </button> -->
      </div>
      <div class="row">
        <div class="column">
          <video ref="videoRef" autoplay="true" width="500" id="video" />
        </div>
        <div class="column">
          <div class="bg-gray-300 rounded-lg shadow-md bg-cover bg-center">
            <img
              ref="imgRef"
              src=""
              alt=""
              crossorigin="anonymous"
            />
          </div>
        </div>
      </div>
      <!-- <button @click="detect">
        <span v-if="isLoading">Loading ... </span>
        <span v-else>Detect Object</span>
      </button> -->
      <div v-if="result.length > 0">
        <p v-for="i in result" :key="i">
          {{ i.class }} --> {{ i.score }} accurate <br />
          present at {{ i.bbox }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
require("@tensorflow/tfjs-backend-cpu");
require("@tensorflow/tfjs-backend-webgl");
const cocoSsd = require("@tensorflow-models/coco-ssd");
const video = document.getElementById("video") as HTMLVideoElement;
const img = document.getElementById("video") as HTMLImageElement;
export default defineComponent({
  name: "App",
  setup() {
    const imgRef = ref(img);
    const isLoading = ref(false);
    const videoRef = ref<HTMLVideoElement>(video);
    const isStreaming = ref(false);
    const result = ref([]);

    async function detect(canvas: HTMLCanvasElement) {
      const img = imgRef.value;
      const model = await cocoSsd.load();
      const predictions = await model.detect(img);
      console.log(predictions);

      for (let i = 0; i < predictions.length; i++) {
        if (predictions[i].score > 0.6) {
          let k = predictions[i].bbox;
          const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
          ctx.beginPath();
          ctx.rect(k[0], k[1], k[2], k[3]);
          ctx.stroke();
          const data = canvas.toDataURL("image/png");
          imgRef.value.setAttribute("src", data);
          // for(let j=0;j<k.length;j++){
          //   console.log(k[j]);
          // }
        }
      }
      result.value = predictions;
      isLoading.value = false;
    }
    async function openCamera() {
      if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
          isStreaming.value = true;

          videoRef.value.srcObject = stream;
        });
      }
    }
    function stopStreaming() {
      const stream = videoRef.value.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.map((track) => track.stop());
      isStreaming.value = false;
    }
    function snapshot() {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      ctx.drawImage(videoRef.value, 0, 0, 200, 200);
      const data = canvas.toDataURL("image/png");
      imgRef.value.setAttribute("src", data);
      detect(canvas);
    }
    openCamera();
    setInterval(function() {
      snapshot();
    }, 3000);
    return {
      imgRef,
      detect,
      result,
      isStreaming,
      videoRef,
      openCamera,
      stopStreaming,
      snapshot,
    };
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 10px;
}
.column {
  float: left;
  width: 45%;
}

/* Clear floats after the columns */
.row:after {
  content: "";
  display: table;
  clear: both;
}
</style>
