"use client";

import Multiplayer from "@/components/Multiplayer/Multiplayer";
import generateRandomWords from "@/components/Multiplayer/offline/RandomWords";
import Image from "next/image";
import React, { useState, useEffect, useRef, use } from "react";

interface PageProps {
  randomWords: string[];
}

const Page: React.FC<PageProps> = ({ randomWords: initialRandomWords }) => {
  const [randomWords, setRandomWords] = useState<string[]>(
    initialRandomWords || []
  );

  const time = 60;
  const timerStartedRef = useRef(false);
  const [mode, setMode] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [wrongWord, setWrongWord] = useState(false);
  const [origWordCharIndex, setOrigWordCharIndex] = useState(0);
  const [wordHistory, setWordHistory] = useState<
    Array<{ word: string; correct: number }>
  >([]);
  // const [flag, setFlag] = useState(false);
  const [correctWords, setCorrectWords] = useState(0);
  const [wrongWordsCount, setWrongWordsCount] = useState(0);
  const [timer, setTimer] = useState(time);

  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState("");
  const [completed, setCompleted] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const words = generateRandomWords(mode);

    setRandomWords(words);
  }, [mode]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [randomWords]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  const startTimer = () => {
    if (timer < 0) {
      return;
    }
    if (timerStartedRef.current) {
      return; // Timer has already been started
    }
    setTimer(time);
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          clearInterval(countdown);
        }
        return prevTimer - 1;
      });
    }, 1000);

    // Store the interval ID
    setIntervalId(countdown);
    timerStartedRef.current = true; // Set the flag to true
  };

  useEffect(() => {
    setWordHistory(randomWords.map((word) => ({ word, correct: 2 })));
  }, [randomWords]);

  const checkMatch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentChar = e.target.value;
    const currentWord = randomWords[wordIndex];
    setOrigWordCharIndex(origWordCharIndex + 1);

    if (currentChar[origWordCharIndex] !== currentWord[origWordCharIndex]) {
      setWrongWord(true);
    }
    if (currentChar === currentWord.substring(0, origWordCharIndex + 1)) {
      setWrongWord(false);
    }

    if (currentChar.endsWith(" ") && !completed) {
      const trimmedCurrentChar = currentChar.trim();
      const trimmedCurrentWord = currentWord.trim();

      setWrongWord((prevWrongWord) => {
        const newWrongWord = trimmedCurrentChar !== trimmedCurrentWord;
        setWordHistory((prevHistory) => {
          return prevHistory.map((entry, index) => {
            if (index === wordIndex) {
              return { ...entry, correct: Number(newWrongWord) };
            }
            return entry;
          });
        });

        return newWrongWord;
      });
    }

    if (completed && e.target.value.endsWith(" ")) {
      setText("");
    }

    if (e.target.value.endsWith(" ") && text != "" && !completed) {
      const trimmedInput = e.target.value.trim();

      setWordIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        return nextIndex < randomWords.length ? nextIndex : 0;
      });

      if (!wrongWord && trimmedInput === currentWord) {
        setCorrectWords(correctWords + 1);
      }
      setOrigWordCharIndex(0);
      setText("");
      setWordHistory((prevHistory) => {
        const updatedHistory = prevHistory.map((entry, index) => {
          if (index === wordIndex) {
            return { ...entry, correct: Number(wrongWord) };
          }
          return entry;
        });

        return updatedHistory;
      });

      setWrongWord(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && origWordCharIndex > 0) {
      setOrigWordCharIndex(origWordCharIndex - 2);
    }
    if (timer === time) {
      startTimer();
    }
  };

  const restartGame = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    timerStartedRef.current = false;
    setTimer(time);
    setWordIndex(0);
    setOrigWordCharIndex(0);
    setCorrectWords(0);
    setWrongWord(false);
    setText("");
    setRandomWords(generateRandomWords(mode));
    setWordHistory(randomWords.map((word) => ({ word, correct: 2 })));
    setCompleted(false);
  };

  const focusWordRef = useRef<HTMLSpanElement | null>(null);
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
    if (timer === 0) {
      setWpm(correctWords);
      setCompleted(true);
      const acc = Math.round((correctWords / wordIndex) * 100).toFixed(2);
      if (isNaN(Number(acc))) setAccuracy("0");
      else setAccuracy(acc);
      setWrongWordsCount(wordIndex - correctWords);
    }
  }, [timer, correctWords, wordIndex]);

  useEffect(() => {
    restartGame();
  }, [mode]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleDarkMode = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDarkMode(e.target.checked);
  };
  

  return (
    <div
      className={`bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text flex flex-col h-screen justify-between`}
    >
      {" "}
      <div className="bg-blue-500 h-20 w-full flex justify-between dark:bg-gray-800" >
        <Image
          className="m-[-20px] ml-4"
          src="/assets/logo.png"
          alt="logo"
          height={300}
          width={150}
        />

        <div className="my-auto">
          <label className="inline-flex items-center cursor-pointer flex-col sm:flex-row ">
            <input
              type="checkbox"
              value=""
              className="sr-only peer"
              checked={darkMode}
              onChange={handleDarkMode}
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ms-3 hidden sm:block sm:text-sm text-gray-900 dark:text-gray-100">
              Dark Mode
            </span>
          </label>
        </div>

        <button>
          <Multiplayer />
        </button>
      </div>
      <div
        className={`mx-auto sm:w-[600px] md:w-[768px] w-[400px] ${
          timer != 0 ? "mt-[-250px]" : ""
        } sm:max-h-[300px] max-h-[300px] overflow-hidden flex flex-col gap-6`}
      >
        <div className="font-bold text-center text-xl">Select Modes</div>
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => {
              setMode(0);
            }}
            disabled={!mode ? true : false}
            className={` ${
              !mode ? "opacity-50" : ""
            } sm:w-[120px] w-[120px] sm:text-[14px] text-xs rounded-md h-[40px] bg-blue-800 text-white`}
          >
            Normal
          </button>
          <button
            onClick={() => {
              setMode(1);
            }}
            disabled={mode ? true : false}
            className={` ${
              mode ? "opacity-50" : ""
            } sm:w-[120px] w-[120px] flex justify-center items-center  sm:text-[14px] text-xs rounded-md h-[40px] bg-black text-white`}
          >
            Advanced
            <Image src="/assets/fire.png" alt="fire" width={30} height={30} />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-full ">
            <div
              aria-label="Loading..."
              role="status"
              className="flex items-center space-x-2"
            >
              <svg
                className="h-20 w-20 animate-spin stroke-gray-500"
                viewBox="0 0 256 256"
              >
                <line
                  x1="128"
                  y1="32"
                  x2="128"
                  y2="64"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="24"
                ></line>
                <line
                  x1="195.9"
                  y1="60.1"
                  x2="173.3"
                  y2="82.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="24"
                ></line>
                <line
                  x1="224"
                  y1="128"
                  x2="192"
                  y2="128"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="24"
                ></line>
                <line
                  x1="195.9"
                  y1="195.9"
                  x2="173.3"
                  y2="173.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="24"
                ></line>
                <line
                  x1="128"
                  y1="224"
                  x2="128"
                  y2="192"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="24"
                ></line>
                <line
                  x1="60.1"
                  y1="195.9"
                  x2="82.7"
                  y2="173.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="24"
                ></line>
                <line
                  x1="32"
                  y1="128"
                  x2="64"
                  y2="128"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="24"
                ></line>
                <line
                  x1="60.1"
                  y1="60.1"
                  x2="82.7"
                  y2="82.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="24"
                ></line>
              </svg>
              <span className="text-4xl font-medium text-gray-500">
                Loading...
              </span>
            </div>
          </div>
        )}
        {!loading && (
          <div
            className={`bg-white h-24 pt-2 rounded-md dark:bg-gray-800 ${
              timer === 0 ? "hidden" : ""
            }`}
          >
            <div
              className={`${
                timer === 0 ? "hidden" : ""
              } w-full sm:h-20 h-16  rounded-md bg-white overflow-hidden dark:bg-gray-800 `}
            >
              <div className=" flex flex-wrap gap-2 w-full px-6 ">
                {wordHistory.map((item, i) => (
                  <span
                    key={i}
                    className={`line  p-0.5 ${
                      i === wordIndex ? "bg-gray-300 dark:bg-blue-500 " : ""
                    } ${i === wordIndex && wrongWord ? "bg-red-500 dark:bg-red-500" : ""}`}
                  >
                    <span
                      className={`${
                        item.correct === 1 ? " text-red-500" : ""
                      } ${item.correct === 0 ? " text-green-500" : ""} `}
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
        )}
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
            className="p-1 pl-4 w-full border sm:text-2xl text-xl  rounded-sm border-black dark:bg-gray-800 dark:focus:outline-none"
          />
          <div className="w-8 flex justify-center items-center bg-blue-500 text-white rounded-sm mx-1 px-5">
            {timer}
          </div>
          <button
            onClick={restartGame}
            className="sm:w-[50px] w-[50px] sm:text-md text-xs rounded-md h-[40px] bg-black flex justify-center items-center dark:bg-gray-400"
          >
            <Image
              src="/assets/reset.svg"
              alt="reset"
              height={20}
              width={20}
              className="text-white fill-white "
            />
          </button>
        </div>
      </div>
      {timer === 0 ? (
        <div className="w-[200px]   bg-blue-400 mx-auto rounded-md flex flex-col  mt-6  dark:bg-blue-500">
          <h2 className="text-white font-bold p-2 text-center">Result</h2>
          <div className="  bg-white flex flex-col dark:bg-gray-800">
            <span className="text-4xl mt-4 font-bold text-green-500 text-center flex flex-col ">
              {wpm} WPM{" "}
              <span className="text-sm font-normal opacity-90 text-gray-400 dark:text-gray-300 ">
                (Words Per Minute)
              </span>{" "}
            </span>
            <div className="mt-2 flex flex-col gap-2 mb-2  ">
              <div className="flex justify-between px-2">
                <span>Accuracy</span>
                <span className="font-bold">{accuracy}%</span>
              </div>
              <hr className="w-48 h-0.5 mx-auto my-1 bg-gray-100 border-0 rounded  opacity-30 dark:bg-gray-700" />
              <div className="flex justify-between px-2">
                <span>Correct Words</span>
                <span className="text-green-500 font-semibold">
                  {correctWords}
                </span>
              </div>
              <hr className="w-48 h-0.5 mx-auto my-1 bg-gray-100 border-0 rounded  opacity-30 dark:bg-gray-700" />

              <div className="flex justify-between px-2">
                <span>Wrong Words</span>
                <span className="text-red-500 font-semibold">
                  {wrongWordsCount}
                </span>
              </div>
              <hr className="w-48 h-0.5 mx-auto my-1 bg-gray-100 border-0 rounded  opacity-30 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      <footer className="  shadow bg-blue-500  w-full dark:bg-gray-800">
        <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
          <span className="text-sm text-gray-900 sm:text-center dark:text-gray-900"></span>
          {/* <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-900 dark:text-gray-900 sm:mt-0">
            <li>
              <a href="#" className="hover:underline me-4 md:me-6">
                About
              </a>
            </li>
           
            <li>
              <a href="#" className="hover:underline">
                Contact
              </a>
            </li>
          </ul> */}
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  const randomWords = generateRandomWords(0);

  return <Page randomWords={randomWords} />;
};

export default App;
