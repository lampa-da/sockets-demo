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
//when clicked on from client end, invoke the randomnumber function
app.post('/', (req, res)=>{
  const message = randomMessage()
  //update the array of numbers
  numbers.push(message)
  //also send the number received from randomNumber() to the client's end
  res.send(message)
})

const port = process.env.PORT || 3000

//app.listen can return a seerver
const server = app.listen(port, ()=> console.log(`listening on ${port}`))

//server side connection fro websocket
const webSocketServer = new ws.Server({ server })

//managing multiple sockets
let sockets = []

// event listener
// every refresh, websocket gets replaced
webSocketServer.on('connection', (socket)=>{
  sockets.push(socket)
  console.log(sockets.length)
  // can't send objects, has to be string of a buffer or same array
  socket.send(JSON.stringify({ history: numbers }))
  socket.on('message', (data)=>{
    // const message = JSON.parse(data)
    // console.log(message)
    // filter prevents double entry on the sender's so that if it's the sender, it won't read the data that it sent out, it'll just see it on the list
    sockets.filter(s => s !== socket).forEach(s => s.send(data.toString()))
  }) 
  //rerfresh or close
  socket.on('close', ()=>{      //closing not active sockets
    //redefines the sockets array without the current socket that closes
    sockets = sockets.filter(s => s !== socket)
    // console.log('closing')
  })
})
