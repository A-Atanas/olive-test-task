import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
const port = 3000;

app.get('/', (req, res) => {
  res.send({
    teleport: {
        label: "Teleport to office"
    },
    walk: {
        label: "Walk to office"
    }
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})