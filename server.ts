// server.ts
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import { getRandomWords } from './components/words';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;



  type Room = {
    host: string;
    participants: string[];
    words: string[];
    usernames: string[];
  };

app.prepare().then(() => {

    
    
    const rooms: { [key: string]: Room } = {};
    const countdownTime = 1;
    const MAX_ROOM_SIZE = 3; 
    const NO_OF_WORDS = 2;
    const socketToUsernameMap = new Map<string, string>();    const expressApp = express();
    const server = createServer(expressApp);
    const io = new Server(server);

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('join_room', (data: { room: string, username: string }) => {
            const { room, username } = data;
        
            if (!rooms[room]) {
              rooms[room] = { host: socket.id, participants: [socket.id], words: [], usernames: [username] };
              socket.join(room);
              socketToUsernameMap.set(socket.id, username);
              console.log(`User with id: ${socket.id} (host) created and joined the room ${room}`);
              const randomWordsForRoom = getRandomWords(NO_OF_WORDS);
              io.to(socket.id).emit('host', rooms[room].usernames);
              io.to(room).emit('random_words', randomWordsForRoom);
              io.to(room).emit('no_of_words', NO_OF_WORDS);
              rooms[room].words = randomWordsForRoom;
              io.to(room).emit('usernames', rooms[room].usernames);
            } else {
              const roomSize = rooms[room].participants.length;
              if (roomSize < MAX_ROOM_SIZE) {
                rooms[room].participants.push(socket.id);
                socket.join(room);
                socketToUsernameMap.set(socket.id, username);
                console.log(`User with id: ${socket.id} joined the room ${room}`);
                io.to(socket.id).emit('random_words', rooms[room].words);
                io.to(room).emit('usernames', rooms[room].usernames);
                io.to(room).emit('no_of_words', NO_OF_WORDS);
                rooms[room].usernames.push(username);
              } else {
                return; // Room is full
              }
            }
            console.log(getRoomSize(room));
          });
        
          socket.on("room_size", (room: string) => {
            if (getRoomSize(room) > MAX_ROOM_SIZE - 1) {
              socket.emit("max_size_reached");
              console.log("filled");
            }
          });
        
          socket.on('get_usernames_in_room', (data: { room: string, username: string }) => {
            const usernames = getUsernamesInRoom(data.room);
            if (usernames.includes(data.username)) {
              socket.emit('usernames_in_room', usernames);
            }
          });
        
          socket.on("start_game_countdown", (room: string) => {
            if (rooms[room] && rooms[room].host === socket.id) {
              io.to(room).emit("game_start_countdown", countdownTime);
            }
          });
        
          socket.on("start_game", (room: string) => {
            if (rooms[room] && rooms[room].host === socket.id) {
              io.to(room).emit("start_game");
              console.log(`Game started in room ${room}`);
            }
          });
        
          socket.on('word_index_update', (data: { room: string, username: string, wordIndex: number, wrongWordCount: number }) => {
            io.to(data.room).emit('word_index_updated', { username: data.username, wordIndex: data.wordIndex, wrongWordCount: data.wrongWordCount });
          });
        
          socket.on("restart_game", (room: string) => {
            if (rooms[room]) {
              rooms[room].words = getRandomWords(NO_OF_WORDS);
              rooms[room].usernames = [];
              io.to(room).emit('usernames', rooms[room].usernames);
            }
          });
        
          socket.on('disconnect', () => {
            console.log('User', socket.id, 'Disconnected');
          
            Object.keys(rooms).forEach((room) => {
              // Remove the disconnected user from the participants list
              rooms[room].participants = rooms[room].participants.filter(participant => participant !== socket.id);
          
              // Remove the disconnected username from the usernames array
              const disconnectedUsername = socketToUsernameMap.get(socket.id);
              if (disconnectedUsername) {
                socketToUsernameMap.delete(socket.id);
                rooms[room].usernames = rooms[room].usernames.filter(username => username !== disconnectedUsername);
              }
          
              // Check if the host has disconnected
              if (rooms[room].host === socket.id) {
                if (rooms[room].participants.length > 0) {
                  // Reassign host to the next available participant
                  const newHost = rooms[room].participants[0];
                  rooms[room].host = newHost;
          
                  // Notify the new host and all users in the room
                  io.to(newHost).emit('host', rooms[room].usernames);
                  io.to(room).emit('usernames', rooms[room].usernames);
          
                  console.log(`New host for room ${room} is now ${newHost}`);
                } else {
                  // If no participants are left, delete the room
                  delete rooms[room];
                  console.log(`Room ${room} deleted as no participants are left.`);
                }
              } else {
                // Notify the room that a non-host user has disconnected
                if (disconnectedUsername) {
                  io.to(room).emit("user_disconnected", { username: disconnectedUsername });
                  io.to(room).emit("alt_usernames", rooms[room].usernames);
                }
              }
            });
          });
          
          
        });
        
        const getRoomSize = (room: string) => {
          return rooms[room] ? rooms[room].participants.length : 0;
        };
        
        const getUsernamesInRoom = (room: string) => {
          return rooms[room] ? rooms[room].usernames : [];
        };
        

    expressApp.all('*', (req, res) => handle(req, res));

    server.listen(port, (err?: any) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
    });
});
