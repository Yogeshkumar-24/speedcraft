"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";

interface GameProps {
  username: string;
  room: string;
}

const countdownTime = 1;
const waitTime = 1000; //millisecond
const Game: React.FC<GameProps> = ({ username, room }) => {

  const [numOfWords, setNumOfWords] = useState<number | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [gameStartCountdown, setGameStartCountdown] = useState(countdownTime);
  const [startGame, setStartGame] = useState(false);
  const [usernames, setUsernames] = useState<string[]>([]);
  const [roomFull, setRoomFull] = useState(false);

  useEffect(() => {
    const newSocket = io("https://speedcraft-server.onrender.com/");
    setSocket(newSocket);
    console.log("Socket connected:", newSocket); // Add this log statement

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const focusWordRef = useRef<HTMLSpanElement | null>(null);
  const [randomWords, setRandomWords] = useState<string[]>([]);
  const [wordHistory, setWordHistory] = useState<
    Array<{ word: string; correct: number }>
  >([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [wrongWord, setWrongWord] = useState(false);
  const [wrongWordCount, setWrongWordCount] = useState(0);
  const [text, setText] = useState("");
  const [origWordCharIndex, setOrigWordCharIndex] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<string[]>([]);
  const [userWordIndex, setUserWordIndex] = useState<{ [key: string]: number }>(
    {}
  );

  const router = useRouter();
  useEffect(() => {
    if (focusWordRef.current) {
      focusWordRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "center",
      });
    }
  }, [text, randomWords]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [randomWords]);

  useEffect(() => {
    setWordHistory(randomWords.map((word) => ({ word, correct: 2 })));
  }, [randomWords]);
  useEffect(() => {
    console.log(completed);
  }, [completed]);
  useEffect(() => {
    console.log(numOfWords);
  }, [numOfWords]);
  useEffect(() => {
    if (socket && !roomFull) {
      socket.emit("join_room", { room, username });
      socket.on("random_words", (words: string[]) => {
        setRandomWords(words);
      });

      if (numOfWords === null) {
        socket.on("no_of_words", (num: number) => {
          setNumOfWords(num);
        });
      }
      socket.on("host", (name) => {
        if (name.includes(username)) {
          setIsHost(true);
        }
      });
      socket.on("usernames", (usernames: string[]) => {
        const updatedUserWordIndex: { [key: string]: number } = {};
        setUsernames(usernames)
        usernames.forEach((user) => {
          updatedUserWordIndex[user] = userWordIndex[user] || 0;
        });
      
        setUserWordIndex(updatedUserWordIndex);
      });

      socket.on("user_disconnected", (data: { username: string }) => {
        console.log("User", data.username, "Disconnected");

        setUserWordIndex((prevUserWordIndex) => {
          const updatedUserWordIndex = { ...prevUserWordIndex };
          delete updatedUserWordIndex[data.username];
          return updatedUserWordIndex;
        });

    
        setUsernames((prevUsernames) => {
          const updatedUsernames = prevUsernames.filter(
            (name) => name !== data.username
          );
          return updatedUsernames;
        });
      });

      socket.on(
        "word_index_updated",
        (data: { username: string; wordIndex: number ; wrongWordCount: number}) => {
          // Update the userWordIndex when word index is updated
          if (!roomFull) {
            setUserWordIndex((prevUserWordIndex) => ({
              ...prevUserWordIndex,
              [data.username]: data.wordIndex,
            }));
            setWrongWordCount(data.wrongWordCount)
            if (data.wordIndex === -1) {
              setWordIndex((prevIndex) => {
                return prevIndex - 1;
              });
            }
          }
        }
      );

      socket.on("start_game", () => {
        setStartGame(true);
      });

      socket.on("game_start_countdown", (countdown: number) => {
        setGameStartCountdown(countdown);
      });

      return () => {
        socket.off("random_words");
        socket.off("usernames");
        socket.off("word_index_updated");
        socket.off("game_start_countdown");
      };
    }
  }, [socket, room, username]);

  useEffect(() => {
    if (socket) {
      const handleRoomFull = () => {
        // Use useEffect to handle state update asynchronously
        setRoomFull((prevRoomFull) => !prevRoomFull); 
      };

      socket.on("room_full", handleRoomFull);

      return () => {
        socket.off("room_full", handleRoomFull);
      };
    }
  }, [socket]);

  useEffect(() => {
    console.log(userWordIndex)
  },[userWordIndex])

  useEffect(() => {
    socket?.emit("room_full_client", roomFull);
  }, [roomFull]);

  const handleStartGame = () => {
    if (isHost) {
      socket?.emit("start_game_countdown", room);
      setTimeout(() => {
        socket?.emit("start_game", room);
      }, waitTime);
    }
  };
  useEffect(() => {
    if (startGame && gameStartCountdown > 0) {
      const countdownInterval = setInterval(() => {
        setGameStartCountdown((prevCountdown) =>
          prevCountdown > 0 ? prevCountdown - 1 : 0
        );
      }, 1000);

      return () => {
        clearInterval(countdownInterval);
      };
    }
  }, [startGame, gameStartCountdown]);
  useEffect(() => {
    if (wordIndex === numOfWords) {
      setCompleted(true);
    }
  });

  useEffect(() => {
    console.log(roomFull);
  }, [roomFull]);

  useEffect(() => {
    if (socket) {
      const handleWordIndexUpdated = (data: {
        username: string;
        room: string;
        wordIndex: number;
        wrongWordCount: number;
      }) => {
        setUserWordIndex((prevIndexes) => ({
          ...prevIndexes,
          [data.username]: data.wordIndex,
        }));
        setWrongWordCount(data.wrongWordCount)
        if (data.wordIndex === numOfWords) {
          setResult((prevResult: string[]) => {
            const updatedResult = [
              ...prevResult,
              `${data.username}: ${data.wrongWordCount}`,
            ];
            return updatedResult;
          });
        }
      };

      socket.on("word_index_updated", handleWordIndexUpdated);

      socket.emit("word_index_update", { room, username, wordIndex, roomFull, wrongWordCount: wrongWordCount });

      // Cleanup when the component is unmounted
      return () => {
        socket.off("word_index_updated", handleWordIndexUpdated);
      };
    }
  }, [socket, room, username, wordIndex, numOfWords]);

  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && origWordCharIndex > 0) {
      setOrigWordCharIndex(origWordCharIndex - 2);
    }
  };

  const checkMatch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentChar = e.target.value;
    const currentWord = randomWords[wordIndex];
    setOrigWordCharIndex(origWordCharIndex + 1);

    if (
      currentChar &&
      currentWord &&
      currentChar[origWordCharIndex] !== currentWord[origWordCharIndex]
    ) {
      setWrongWord(true);

    }
    if (currentChar === currentWord.substring(0, origWordCharIndex + 1)) {
      setWrongWord(false);
    }

    if (currentChar.endsWith(" ")) {
      const trimmedCurrentChar = currentChar.trim();
      const trimmedCurrentWord = currentWord.trim();

      setWrongWord((prevWrongWord) => {
        const newWrongWord = trimmedCurrentChar !== trimmedCurrentWord;
        setWordHistory((prevHistory) => {
          return prevHistory.map((entry, index) => {
            if (index === wordIndex && entry.correct === 2) {
              return { ...entry, correct: Number(0) };
            }
            return entry;
          });
        });

        return newWrongWord;
      });
    }

    if (e.target.value.endsWith(" ") && text != "" && currentWord) {
      const trimmedInput = e.target.value.trim();

      if (!wrongWord && trimmedInput === currentWord) {
        setWordIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          return nextIndex;
        });
      
        setCorrectWords(correctWords + 1);
      }
      else{
        setWrongWordCount(prevCount => prevCount + 1);

      }
      setOrigWordCharIndex(0);
      setText("");
      setWordHistory((prevHistory) => {
        const updatedHistory = prevHistory.map((entry, index) => {
          if (index === wordIndex && wrongWord) {
            return { ...entry, correct: Number(1) };
          }
          return entry;
        });

        return updatedHistory;
      });

      setWrongWord(false);
    }
  };

  const handleRestart = () => {
    
    router.push(window.location.href);
    router.refresh();  };

  return (
    <>
   

     
        <div className="">
          {/* players card */}
          <div className="flex justify-center mt-[-150px] mb-2">
            <span className=" font-bold text-2xl ">ROOM: {room}</span>
          </div>
          {isHost && (
            <div className="flex justify-center my-2">
              <span className="">You're the HOST</span>
            </div>
          )}
          <div className="mb-4 border border-blue-500 py-8 mx-8">
            {Object.entries(userWordIndex).map(([user, index]) => (
              <div
                key={user}
                className="flex justify-center pl-4 pr-6 items-center gap-4"
              >
                <div className={`${index === numOfWords ? "opacity-50" : ""}`}>
                  {user}
                </div>
                <div
                  className={`h-[2px] w-[500px] ${
                    user === username ? "bg-green-500" : "bg-blue-400"
                  } flex items-center relative ${
                    index === numOfWords ? "opacity-50" : ""
                  }`}
                >
                  <div
                    className={`h-[16px] w-[16px] ${
                      user === username ? "bg-green-500" : "bg-black"
                    }  absolute rounded-full ${
                      index === numOfWords ? "opacity-50" : ""
                    }`}
                    style={{ left: `${(index / (numOfWords || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          {!startGame && !isHost && (
            <div className=" text-center">
              {" "}
              Waiting for the host to start the game ...
            </div>
          )}
          {startGame && gameStartCountdown !== 0 && (
            <div className="text-center">
              Game starting in {gameStartCountdown} seconds...
            </div>
          )}
          {isHost && !startGame && (
            <div className="flex">
              <button
                className=" bg-black text-white font-semibold px-2 py-1 justify-center mx-auto rounded-md"
                onClick={handleStartGame}
              >
                Start Game
              </button>
            </div>
          )}
          {gameStartCountdown === 0 && !completed && (
            <div className="flex justify-center bg-blue-300 py-8 ">
              <div className=" mx-4  flex flex-col gap-4 justify-center items-center">
                <div
                  className={`mx-auto sm:w-[600px] md:w-[768px] w-[400px] 
        sm:max-h-[200px] max-h-[200px] overflow-hidden flex flex-col gap-6`}
                >
                  <div
                    className={`bg-white h-24 pt-2 rounded-md border border-black `}
                  >
                    <div
                      className={` w-full sm:h-20 h-16  rounded-md bg-white overflow-hidden`}
                    >
                      <div className=" flex flex-wrap gap-2 w-full px-6 ">
                        {wordHistory.map((item, i) => (
                          <span
                            key={i}
                            className={`line  p-0.5 ${
                              i === wordIndex ? "bg-gray-300" : ""
                            } ${
                              i === wordIndex && wrongWord ? "bg-red-500" : ""
                            }`}
                          >
                            <span
                              className={`${
                                i <= wordIndex - 1 && item.correct === 1
                                  ? " text-red-500"
                                  : ""
                              } ${
                                i <= wordIndex - 1 && item.correct === 0
                                  ? " text-green-500"
                                  : ""
                              } `}
                            >
                              {item.word.split("").map((char, idx) => (
                                <span
                                  className={`sm:text-xl  md:text-2xl lg:text-3x; `}
                                  id="text"
                                  key={idx}
                                  ref={(ref) => {
                                    if (i === wordIndex) {
                                      focusWordRef.current = ref;
                                    }
                                  }}
                                >
                                  {char}
                                </span>
                              ))}
                            </span>
                            <span> </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sm:w-[600px] md:w-[760px] w-[400px] flex px-12">
                  <input
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    autoFocus
                    ref={inputRef}
                    value={text}
                    onKeyDown={(e) => {
                      handleKeyDown(e);
                    }}
                    onChange={(e) => {
                      if (text == "" && e.target.value == " ") setText("");
                      else {
                        setText(e.target.value);

                        checkMatch(e);
                      }
                    }}
                    type="text"
                    className="p-1 pl-4 w-full border sm:text-2xl text-xl border-none rounded-sm border-black"
                  />
                </div>
              </div>
            </div>
          )}
          {wordIndex === numOfWords && (
            <div className="flex flex-col justify-center mx-auto my-8">
              <table className="table-auto mx-auto border-collapse border border-gray-400">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2">Rank</th>
                    <th className="px-4 py-2">Username</th>
                    <th className="px-4 py-2">Total Words</th>
                    <th className="px-4 py-2">Wrong Words</th>
                    <th className="px-4 py-2">Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {result.map((item, id) => {
                    // Split the string by ':' to get username and count
                    const [user, countStr] = item.split(":");
                    const count: number = parseInt(countStr, 10)

                    return (
                      <tr key={id} className="border-b border-gray-400">
                        <td className="px-4 py-2 text-center ">{id + 1}</td>
                        <td className="px-4 py-2 text-center ">{user.trim()}</td>
                        <td className="px-4 py-2 text-center ">{numOfWords}</td>
                        <td className="px-4 py-2 text-center">{count}</td>
                        <td className="px-4 py-2 text-center">{Math.round((Math.abs(numOfWords - count) / numOfWords) * 100).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex justify-center mt-4">
                <a href="" className=" bg-gray-800  px-4 py-2 rounded-md text-white font-bold " onClick={handleRestart}>Go Back</a>
              </div>
            </div>
          )}
        </div>
    </>
  );
};

export default Game;
