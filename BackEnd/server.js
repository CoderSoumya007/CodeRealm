const app = require('express')();
const http = require('http');
const { Server } = require('socket.io');
const cors = require("cors");

const bodyParser = require('body-parser')
const { exec } = require('child_process');
const fs = require('fs');
const path = require("path");
// const options = { status: true }

app.use(bodyParser.json())
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.get('/', function (req, res) {
  console.log("hello server!");
});

app.post('/output', function (req, res) {
  const code = req.body.code;
  const lang = req.body.language;
  const input = req.body.input;


  if (lang == "java") {
    const tempFolder = "temp";
    const filePath = `${tempFolder}/Main.java`;
    const classfile = `${filePath}`.replace(".java", ".class");
    var responseSent = false;

    try {
      fs.writeFileSync(filePath, code);
    } catch (error) {
      if(!responseSent){
        responseSent = true;
        return res.status(500).send({error:'Error writing file:',error});
      }
      // Handle the error appropriately, e.g., send a response to the client
    }
    exec(`javac ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (unlinkError) => {
            if (unlinkError) {
              console.error('Error deleting file:', unlinkError);
            }
          });
        }
        // Compilation failed, send an error response
        if (responseSent == false) {
          responseSent = true;
          return res.send({ error: `Compilation error: ${stderr}` });
        }
      }

      const executionprocess = (!input) ?
        // Compilation successful, continue with execution
        exec(`java ${filePath}`, (execError, execStdout, execStderr) => {
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (unlinkError) => {
              if (unlinkError) {
                console.log("Failed to delete temporary java file: ", unlinkError);
              }
            });
          }
          if (fs.existsSync(classfile)) {
            fs.unlink(classfile, (unlinkError) => {
              if (unlinkError) {
                console.error('Error deleting file:', unlinkError);
              }
            });
          }
          if (execError) {
            // Execution failed, send an error response
            if (!responseSent) {
              responseSent = true;
              return res.send({ error: execStderr });
            }
          }
          // Execution successful, send the output response
          if (!responseSent) {
            responseSent = true;
            res.send({ output: execStdout });
          }
        }) :
        exec(`echo ${input} | java ${filePath}`, (execError, execStdout, execStderr) => {
          fs.unlink(filePath, (unlinkError) => {
            if (unlinkError) {
              console.log("Failed to delete temporary java file: ", unlinkError);
            }
          });
          fs.unlink(classfile, (unlinkError) => {
            if (unlinkError) {
              console.error('Error deleting file:', unlinkError);
            }
          });
          if (execError) {
            // Execution failed, send an error response
            if (!responseSent) {
              responseSent = true;
              return res.send({ error: execStderr });
            }
          }
          // Execution successful, send the output response
          if (!responseSent) {
            responseSent = true;
            res.send({ output: execStdout });
          }
        });
      const timeoutDuration = 10000; // 10 seconds
      setTimeout(() => {
        if (!responseSent) {
          responseSent = true;
          executionprocess.kill();
          res.send({ error: 'Timed out' });
        }
      }, timeoutDuration);
    });
  }

  if (lang == "c" || lang == "cpp") {
    const tempFolder = "temp";
    const filePath = `${tempFolder}/main.cpp`;
    const exepath = `${filePath}`.replace(".cpp", ".exe");
    var responseSent = false;

    try {
      fs.writeFileSync(filePath, code);
    } catch (error) {
      if(!responseSent){
        responseSent = true;
        return res.status(500).send({error:'Error writing file:',error});
      }
      // Handle the error appropriately, e.g., send a response to the client
    }

    exec(`g++ ${filePath} -o ${tempFolder}/main.exe`, (compileError, compileStdout, compileStderr) => {

      if (compileError) {
        fs.unlinkSync(filePath, (error) => {
          if (error) {
            console.error('Error deleting file:', error);
          }
        })
        // Compilation failed, send an error response
        if (!responseSent) {
          responseSent = true;
          res.send({ error: compileStderr });
        }
      }
      // console.log("compile success");
      // Compilation successful, continue with execution
      const executionprocess = (!input) ?
        exec(`${path.join(tempFolder, "main.exe")}`, (runError, runStdout, runStderr) => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath, (error) => {
              if (error) {
                console.error('Error deleting file:', error);
              }
            })
          }
          if (fs.existsSync(exepath)) {
            fs.unlinkSync(exepath, (error) => {
              if (error) {
                console.error('Error deleting file:', error);
              }
            })
          }
          if (runError) {
            // console.log(runError)
            if (!responseSent) {
              responseSent = true;
              res.send({ error: runStderr });
            }
          }
          // console.log(runStdout);
          if (!responseSent) {
            responseSent = true;
            res.send({ output: runStdout });
          }
        })
        :
        exec(`echo ${input} | ${path.join(tempFolder, "main.exe")}`, (runError, runStdout, runStderr) => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath, (error) => {
              if (error) {
                console.error('Error deleting file:', error);
              }
            })
          }
          if (fs.existsSync(exepath)) {
            fs.unlinkSync(exepath, (error) => {
              if (error) {
                console.error('Error deleting file:', error);
              }
            })
          }
          if (runError) {
            if (!responseSent) {
              responseSent = true;
              res.send({ error: runStderr });
            }
          }
          if (!responseSent) {
            responseSent = true;
            res.send({ output: runStdout });
          }
        });

      const timeoutDuration = 10000; // 10 seconds
      setTimeout(() => {
        if (!responseSent) {
          responseSent = true;
          executionprocess.kill();
          res.send({ error: 'Timed out' });
        }
      }, timeoutDuration);
    });
  }

  if (lang == "python") {
    const tempFolder = "temp";
    const filePath = `${tempFolder}/python.py`;
    var responsesent = false;
    
    try {
      fs.writeFileSync(filePath, code);
    } catch (error) {
      if(!responsesent){
        responsesent = true;
        return res.status(500).send({error:'Error writing file:',error});
      }
      // Handle the error appropriately, e.g., send a response to the client
    }

    const executionprocess = (!input) ?
      exec(`python ${filePath}`, (error, stdout, stderr) => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        if (error) {
          if (!responsesent) {
            responsesent = true;
            return res.send({ error: stderr });
          }
        }
        // console.log(stdout);
        if (!responsesent) {
          responsesent = true;
          return res.send({ output: stdout })
        }
      })
      :
      exec(`echo ${input} | python ${filePath}`, (error, stdout, stderr) => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        if (error) {
          if (!responsesent) {
            responsesent = true;
            return res.send({ error: stderr });
          }
        }
        // console.log(stdout);
        if (!responsesent) {
          responsesent = true;
          res.send({ output: stdout })
        }
      })
    const timeoutDuration = 10000; // 10 seconds
    setTimeout(() => {
      if (!responsesent) {
        responsesent = true;
        executionprocess.kill();
        res.send({ error: 'Timed out' });
      }
    }, timeoutDuration);
  }

  if (lang === "javascript") {
    const tempFolder = "temp";
    const filePath = `${tempFolder}/temp_${Date.now()}.js`;
    var responsesent = false;

    const executionprocess = fs.writeFile(filePath, code, (err) => {
      if (err) {
        if (!responsesent) {
          responsesent = true;
          return res.status(500).send({ error: 'Error writing file',err});
        }
      }

      // Execute the JavaScript file using Node.js
      exec(`node ${filePath}`, (error, stdout, stderr) => {
        // Delete the temporary file
        fs.unlink(filePath, (unlinkError) => {
          if (unlinkError) {
            console.error('Error deleting file:', unlinkError);
          }
        });

        if (error) {
          if (!responsesent) {
            // console.error('Error executing code:', error);
            responsesent = true;
            return res.send({ error: stderr });
          }
        } else {
          // console.log('Code executed successfully:', stdout);
          if (!responsesent) {
            responsesent = true;
            return res.send({ output: stdout });
          }
        }
      });;

    });

    const timeoutDuration = 10000; // 10 seconds
    setTimeout(() => {
      if (!responsesent) {
        responsesent = true;
        executionprocess.kill();
        res.send({ error: 'Timed out' });
      }
    }, timeoutDuration);
  }
});


// Whenever someone connects, this gets executed
const initialCode = {};
const connectedClients = {};

io.on('connection', function (socket) {

  socket.on("when a user joins", async ({ roomid, username }) => {
    console.log(`User ${username} joined room ${roomid}`)
    socket.join(roomid);  
    if (!initialCode[roomid]) {
      initialCode[roomid] = "";
    }
    if (!connectedClients[roomid]) {
      connectedClients[roomid] = 0;
    }
    connectedClients[roomid]++;

    io.to(roomid).emit('initial-code', initialCode[roomid]);
    io.to(roomid).emit('update-connected-clients', connectedClients[roomid],username);

    socket.on("code-changed", (code) => {
      initialCode[roomid] = code;
      io.to(roomid).emit("update-code", code);
    });

    socket.on('disconnecting', function () {
      const rooms = [...socket.rooms];  // Convert Set to Array
      rooms.forEach((roomid) => {
        connectedClients[roomid]--;
        io.to(roomid).emit('update-connected-clients', connectedClients[roomid]);
      });

    });
  });

  // 'disconnect' event can still be used for logging purposes
  socket.on('disconnect', function () {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, function () {
  console.log(`listening on port : ${PORT}`);
});
