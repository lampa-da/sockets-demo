const express = require('express')
const app = express()
const path =require('path')
const ws = require('ws')


const randomMessage =()=>{
  const num = Math.round(Math.random()*1000)
  return {num}
}
const numbers = []
numbers.push(randomMessage())
numbers.push(randomMessage())
console.log(numbers)

app.get('/', (req, res)=>res.sendFile(path.join(__dirname, 'index.html')))
app.post('/', (req, res)=>{
  const message = randomMessage()
  numbers.push(message)
  res.send(message)
})

const port = process.env.PORT || 3000
const server = app.listen(port, ()=> console.log(`listening on ${port}`))

const webSocketServer = new ws.Server({ server })

let sockets = []

webSocketServer.on('connection', (socket)=>{
  sockets.push(socket)
  console.log(sockets.length)
  socket.send(JSON.stringify({ history: numbers }))
  socket.on('message', (data)=>{
    // const message = JSON.parse(data)
    // console.log(message)
    sockets.filter(s => s !== socket).forEach(s => s.send(data.toString()))
  }) 
  socket.on('close', ()=>{      //closing not active sockets
    sockets = sockets.filter(s => s !== socket)
    // console.log('closing')
  })
})
