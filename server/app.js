import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
const port = 3000;

app.get('/', (req, res) => {
  const fullResponse = {
    teleport: {
        label: "Teleport to office"
    },
    walk: {
        label: "Walk to office"
    }
  }
  res.send(!req.query.q
    ? fullResponse
    : res.send(
      Object.fromEntries(Object.entries(fullResponse).filter(([type]) => type.toLocaleLowerCase().includes(req.query.q.toLocaleLowerCase())))
    )
  )
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})