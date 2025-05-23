import { Formik, Form, FieldArray, Field } from "formik";
import { useEffect, useState, useRef } from "react";

function parseMarkdownToQuestion(markdown) {
  const lines = markdown.split("\n");

  const isHeadline = (line, keyword) => {
    const trimmed = line.trim().toLowerCase();
    keyword = keyword.toLowerCase();
    const formats = [
      `## **${keyword}`,
      `### **${keyword}`,
      `**${keyword}`,
      `## ${keyword}`,
      `### ${keyword}`,
      `${keyword}`,
    ];

    // Check if line starts with any of the standard formats:
    // ## **Question**
    // ## **Question:**
    // ### **Question**
    // ### **Question:**
    // **Question**
    // **Question:**
    // Or there could be the question number:
    // ## **Question 1**
    // ## **Question 1:**
    // ### **Question 1**
    // ### **Question 1:**
    // **Question 1**
    // **Question 1:**

    for (const format of formats) {
      if (trimmed.startsWith(format)) {
        if (
          trimmed.endsWith("**") ||
          trimmed.endsWith(":**") ||
          trimmed.endsWith(":")
        ) {
          return true;
        }

        const remainder = trimmed.slice(format.length).trim();
        if (
          /^(\d{1,2})\**$/.test(remainder) ||
          /^(\d{1,2}):\**$/.test(remainder)
        ) {
          return true;
        }
      }
    }

    return false;
  };

  const startsWithAnswer = (line) => {
    const trimmed = line.trim().toUpperCase();
    return [
      ...["A.", "B.", "C.", "D.", "E.", "F.", "G.", "H.", "I.", "J."].map(
        (letter) => `**${letter}`
      ),
      ...["A.", "B.", "C.", "D.", "E.", "F.", "G.", "H.", "I.", "J."],
      ...["A.", "B.", "C.", "D.", "E.", "F.", "G.", "H.", "I.", "J."].map(
        (letter) => `**${letter}**`
      ),
    ].some((prefix) => trimmed.startsWith(prefix.toUpperCase()));
  };

  const getAnswerText = (line) => {
    let strippedLine = line.trim();
    const answerPrefixes = [
      "A.",
      "B.",
      "C.",
      "D.",
      "E.",
      "F.",
      "G.",
      "H.",
      "I.",
      "J.",
    ];

    for (const prefix of answerPrefixes) {
      // Check for patterns like "**A.**" or "A." or "**A.** Text"
      const boldPrefix = `**${prefix}**`;
      const starPrefix = `**${prefix}`;
      if (strippedLine.startsWith(boldPrefix)) {
        strippedLine = strippedLine.slice(boldPrefix.length).trim();
        break;
      } else if (strippedLine.startsWith(starPrefix)) {
        // This handles "**A. Text" pattern
        strippedLine = strippedLine.slice(starPrefix.length).trim();
        break;
      } else if (strippedLine.startsWith(prefix)) {
        strippedLine = strippedLine.slice(prefix.length).trim();
        break;
      }
    }

    return strippedLine;
  };

  let parsingState = "none";
  let questionText = "";
  let answers = [];
  let correctAnswer = null;
  let currentAnswer = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    switch (parsingState) {
      case "none":
        if (isHeadline(line, "Question")) {
          parsingState = "question";
        }
        break;
      case "question":
        if (isHeadline(line, "Answers")) {
          parsingState = "answers";
        } else {
          questionText += line + "\n";
        }
        break;
      case "answers":
        if (isHeadline(line, "Correct Answer")) {
          parsingState = "correctAnswer";
          if (currentAnswer) {
            answers.push(getAnswerText(currentAnswer));
            currentAnswer = null;
          }
        } else if (startsWithAnswer(line)) {
          if (currentAnswer) {
            answers.push(getAnswerText(currentAnswer));
          }
          currentAnswer = line;
        } else if (currentAnswer !== null) {
          currentAnswer += "\n" + line;
        }
        break;
      case "correctAnswer":
        const match = line.trim().match(/^([A-Za-z])[\.]?/); // parse A. or B. or C
        if (match) {
          correctAnswer = match[1].toUpperCase();
          break;
        }
        break;
      default:
        break;
    }
  }

  if (currentAnswer) {
    answers.push(getAnswerText(currentAnswer));
  }

  if (!questionText || !answers.length || !correctAnswer) {
    throw new Error(`Parsing markdown question exception:\n${markdown}`);
  }

  return {
    text: questionText.trim(),
    answers: answers.map((text, index) => ({
      text,
      is_correct: String.fromCharCode(65 + index) === correctAnswer,
    })),
    correctAnswer,
  };
}

function TextEditor({ value, onUpdate, activeQuestionIndex }) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);

    const parsedQuestion = parseMarkdownToQuestion(e.target.value);

    if (parsedQuestion) {
      onUpdate(parsedQuestion, activeQuestionIndex);
    }
  };

  return (
    <textarea
      className="w-full h-full border rounded p-2"
      value={localValue}
      onChange={handleChange}
    ></textarea>
  );
}

function QuestionEditor({
  questions,
  setActiveQuestionIndex,
  activeQuestionIndex,
}) {
  const editorRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      }
    }, 100);
  };

  return (
    <Form>
      <FieldArray name="questions">
        {({ push, remove, move }) => (
          <div ref={editorRef}>
            {questions.map((_, index) => (
              <div
                key={index}
                className={`mb-4 p-4 border border-gray-300 rounded ${
                  index === activeQuestionIndex ? "bg-blue-100" : ""
                }`}
                onClick={() => setActiveQuestionIndex(index)}
              >
                <div className="mb-4 font-bold">Question {index + 1}</div>
                <div key={index} className="mb-4">
                  <div className="mb-2">
                    <Field
                      as="textarea"
                      className="w-full p-1 border rounded"
                      name={`questions[${index}].text`}
                      placeholder="Question"
                    />
                  </div>
                  <FieldArray name={`questions[${index}].answers`}>
                    {({ push: pushAnswer, remove: removeAnswer }) => (
                      <div>
                        {_.answers.map((answer, aIndex) => (
                          <div key={aIndex} className="flex items-center mb-2">
                            <Field
                              as="textarea"
                              className="flex-1 p-1 border rounded mr-2"
                              name={`questions[${index}].answers[${aIndex}].text`}
                              placeholder="Answer"
                            />
                            <button
                              type="button"
                              className="mr-2 px-2 py-1 bg-transparent hover:bg-red-300  text-red-500 hover:text-white border border-red-500 hover:border-transparent rounded transition duration-300"
                              onClick={() => removeAnswer(aIndex)}
                            >
                              X
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="mb-2 px-2 py-1 bg-transparent hover:bg-blue-500 text-blue-700 hover:text-white border border-blue-500 hover:border-transparent rounded transition duration-300"
                          onClick={() => pushAnswer({ text: "" })}
                        >
                          Add Answer
                        </button>
                      </div>
                    )}
                  </FieldArray>
                  <div className="mb-2">
                    <Field
                      className="w-full p-1 border rounded"
                      name={`questions[${index}].correctAnswer`}
                      placeholder="Correct Answer"
                    />
                  </div>
                  <div className="flex items-center">
                    {/* Move Up Button */}
                    {index > 0 && (
                      <button
                        type="button"
                        className="mr-2 px-2 py-1 bg-transparent hover:bg-blue-500 text-blue-700 hover:text-white border border-blue-500 hover:border-transparent rounded"
                        onClick={() => move(index, index - 1)}
                      >
                        Move Up
                      </button>
                    )}

                    {/* Move Down Button */}
                    {index < questions.length - 1 && (
                      <button
                        type="button"
                        className="mr-2 px-2 py-1 bg-transparent hover:bg-blue-500 text-blue-700 hover:text-white border border-blue-500 hover:border-transparent rounded"
                        onClick={() => move(index, index + 1)}
                      >
                        Move Down
                      </button>
                    )}

                    {/* Remove Button (pre-existing in your code) */}
                    <button
                      type="button"
                      className="ml-2 px-2 py-1 hover:bg-red-500 bg-red-300 text-white hover:text-white rounded transition duration-300"
                      onClick={() => remove(index)}
                    >
                      Remove Question
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-center mt-4 mb-4">
              <button
                type="button"
                className="px-2 py-1 bg-transparent hover:bg-blue-500 text-blue-700 hover:text-white border border-blue-500 hover:border-transparent rounded transition duration-300"
                onClick={() => {
                  push({
                    text: "",
                    answers: [{ text: "" }],
                    correctAnswer: "",
                  });
                  setActiveQuestionIndex(questions.length);
                  scrollToBottom();
                }}
              >
                Add Question
              </button>
            </div>
          </div>
        )}
      </FieldArray>
    </Form>
  );
}

function JsonEditor({ value, onUpdate }) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;

    setLocalValue(newValue);

    try {
      const parsedData = JSON.parse(newValue);
      onUpdate(parsedData);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <textarea
      className="w-full h-full border rounded p-2"
      value={localValue}
      onChange={handleChange}
    ></textarea>
  );
}

function questionsToMarkdown(questions) {
  return questions
    .map((question) => {
      const answers = question.answers
        .map((a, index) => {
          // Convert 0 to A, 1 to B, 2 to C, etc.
          const ASCII_A = 65;
          const letter = String.fromCharCode(ASCII_A + index);
          return `${letter}. ${a.text}`;
        })
        .join("\n");

      return `**Question**
${question.text}

**Answers**
${answers}

**Correct Answer**
${question.correctAnswer}`;
    })
    .join("\n\n");
}

function questionsToJson(questions) {
  return JSON.stringify(
    {
      name: "React Test",
      duration: 60,
      questions: questions.map((question) => ({
        text: question.text,
        answers: question.answers.map((a, index) => ({
          text: a.text,
          is_correct:
            question.correctAnswer === String.fromCharCode(65 + index),
        })),
      })),
    },
    null,
    2
  );
}

function App() {
  const [textStr, setTextStr] = useState("");
  const [jsonStr, setJsonStr] = useState("");
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(-1); // initial value to -1 which means no question is active
  const [isTextEditorVisible, setIsTextEditorVisible] = useState(true);
  const [isJsonEditorVisible, setIsJsonEditorVisible] = useState(true);

  const handleQuestionUpdate = (question, index, setFieldValue) => {
    setFieldValue(`questions[${index}]`, question);
  };

  return (
    <div className="min-h-screen flex">
      <Formik initialValues={{ questions: [] }} onSubmit={() => {}}>
        {({ values, setFieldValue }) => {
          useEffect(() => {
            const question = values.questions[activeQuestionIndex];
            if (question) {
              setTextStr(questionsToMarkdown([question]));
            } else {
              setTextStr("");
            }
            setJsonStr(questionsToJson(values.questions));
          }, [values, activeQuestionIndex]);

          return (
            <div className="flex flex-1">
              <>
                {!isTextEditorVisible && (
                  <button
                    onClick={() => setIsTextEditorVisible(!isTextEditorVisible)}
                    className="flex flex-col items-center justify-center bg-blue-500 text-white font-bold p-2 fixed top-2 left-2 rounded"
                  >
                    <span className="text-sm">
                      {isTextEditorVisible ? "Hide" : "Show"}
                    </span>
                  </button>
                )}

                {isTextEditorVisible && (
                  <div className="flex-1 border-r-2 border-gray-400 p-4 relative">
                    <button
                      onClick={() =>
                        setIsTextEditorVisible(!isTextEditorVisible)
                      }
                      className="flex flex-col items-center justify-center bg-blue-500 text-white font-bold p-2 absolute top-2 right-2 rounded"
                    >
                      <span className="text-sm">Hide</span>
                    </button>
                    <TextEditor
                      value={textStr}
                      onUpdate={(question, index) =>
                        handleQuestionUpdate(question, index, setFieldValue)
                      }
                      activeQuestionIndex={activeQuestionIndex}
                    />
                  </div>
                )}
              </>

              <div className="flex-1 border-r-2 border-gray-400 p-4 max-h-screen overflow-y-auto">
                <QuestionEditor
                  questions={values.questions}
                  setActiveQuestionIndex={setActiveQuestionIndex}
                  activeQuestionIndex={activeQuestionIndex}
                />
              </div>

              <>
                {!isJsonEditorVisible && (
                  <button
                    onClick={() => setIsJsonEditorVisible(!isJsonEditorVisible)}
                    className="flex flex-col items-center justify-center bg-blue-500 text-white font-bold p-2 fixed top-2 right-2 rounded"
                  >
                    <span className="text-sm">Show</span>
                  </button>
                )}

                {isJsonEditorVisible && (
                  <div className="flex-1 p-4 overflow-auto relative">
                    {" "}
                    <button
                      onClick={() =>
                        setIsJsonEditorVisible(!isJsonEditorVisible)
                      }
                      className="flex flex-col items-center justify-center bg-blue-500 text-white font-bold p-2 absolute top-2 left-2 rounded"
                    >
                      <span className="text-sm">Hide</span>
                    </button>
                    <JsonEditor
                      value={jsonStr}
                      onUpdate={(data) => {
                        setFieldValue("questions", data.questions);
                      }}
                    />
                  </div>
                )}
              </>
            </div>
          );
        }}
      </Formik>
    </div>
  );
}

export default App;
