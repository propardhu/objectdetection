import { createApp } from 'vue'
import App from './App.vue'
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';

const app = createApp(App);

app.component('Textarea', Textarea);
app.component('Button', Button);


app.mount('#app')


