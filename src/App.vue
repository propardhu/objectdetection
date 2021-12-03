<template>
  <div v-if="open" class="w-3/4 m-auto">
    <div>
      <h1 class="text-2xl text-green-800">
        Object detection with inbuild camara
      </h1>
      <div>
        <button @click="openCamera">Open Camera</button>
      </div>
      <div class="flex justify-between">
        <button @click="stopStreaming">
          Stop Streaming
        </button>
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
      <Button @click="open=false" label="open text upderstanding"></Button>
    </div>
  </div>
  <div v-else>
    <Button @click="open=true" label="open video understanding"></Button>
    <h5>Enter text to be understandable</h5>
    <Textarea v-model="dataToUnder" :autoResize="true" rows="5" cols="170" /><br>
    <h5>Enter the question</h5>
    <Textarea v-model="question" :autoResize="true" rows="5" cols="60" /><br>
    <Button @click="answer" label="answer"></Button><br>
    <div v-for="a in ans" :key="a">
      <span>text:->{{a.text}} score:->{{a.score}} startIndex:->{{a.startIndex}} endIndex:->{{a.endIndex}}</span>
      <br>
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
    const open = ref(true);
    const dataToUnder = ref(`Google LLC is an American multinational technology company that specializes in Internet-related services and products, which include online advertising technologies, search engine, cloud computing, software, and hardware. It is considered one of the Big Four technology companies, alongside Amazon, Apple, and Facebook. Google was founded in September 1998 by Larry Page and Sergey Brin while they were Ph.D. students at Stanford University in California. Together they own about 14 percent of its shares and control 56 percent of the stockholder voting power through supervoting stock. They incorporated Google as a California privately held company on September 4, 1998, in California. Google was then reincorporated in Delaware on October 22, 2002. An initial public offering (IPO) took place on August 19, 2004, and Google moved to its headquarters in Mountain View, California, nicknamed the Googleplex. In August 2015, Google announced plans to reorganize its various interests as a conglomerate called Alphabet Inc. Google is Alphabet's leading subsidiary and will continue to be the umbrella company for Alphabet's Internet interests. Sundar Pichai was appointed CEO of Google, replacing Larry Page who became the CEO of Alphabet.`);
    const question = ref('Who is the CEO of Google?');
    const ans = ref();
    const qna = require('@tensorflow-models/qna');

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
    async function answer() {
      try{
        const model = await qna.load();
        const a = await model.findAnswers(question.value, dataToUnder.value);
        ans.value = a
        console.log(a);
      }catch(err){
        console.log(err);
      }
    }
    openCamera();
    setInterval(function() {
      if(open.value == true){
        snapshot();
      }
    }, 3000);
    return {
      imgRef,
      detect,
      result,
      isStreaming,
      videoRef,
      open,
      dataToUnder,
      question,
      ans,
      answer,
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
